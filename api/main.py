import os
import asyncio
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import pandas as pd
import numpy as np
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="SpaceWeatherDash API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys
NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")

# In-memory storage for cached data
cached_events: List[Dict[str, Any]] = []
cached_risk_scores: List[Dict[str, Any]] = []
cached_noaa_data: List[Dict[str, Any]] = []
last_fetch_time: Optional[datetime] = None

# Scheduler for auto-refresh
scheduler = AsyncIOScheduler()


# Pydantic models for response validation
class EventResponse(BaseModel):
    events: List[Dict[str, Any]]
    last_updated: str


class RiskScoreResponse(BaseModel):
    risk_scores: List[Dict[str, Any]]
    last_updated: str


class NOAADataResponse(BaseModel):
    kp_index: List[Dict[str, Any]]
    last_updated: str


async def fetch_nasa_donki_events() -> List[Dict[str, Any]]:
    """
    Fetch solar events from NASA DONKI API for the last 7 days.
    Fetches CME (Coronal Mass Ejections), FLR (Solar Flares), and GST (Geomagnetic Storms).
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=7)
    
    all_events = []
    
    # Event types to fetch
    event_types = ["CME", "FLR", "GST"]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for event_type in event_types:
            url = f"https://api.nasa.gov/DONKI/{event_type}"
            params = {
                "startDate": start_date.strftime("%Y-%m-%d"),
                "endDate": end_date.strftime("%Y-%m-%d"),
                "api_key": NASA_API_KEY
            }
            
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                events = response.json()
                
                # Add event type to each event for easier processing
                for event in events:
                    event["eventType"] = event_type
                
                all_events.extend(events)
            except httpx.HTTPStatusError as e:
                print(f"Error fetching {event_type} events: {e}")
            except Exception as e:
                print(f"Unexpected error fetching {event_type}: {e}")
    
    return all_events


async def fetch_noaa_kp_index() -> List[Dict[str, Any]]:
    """
    Fetch current Kp index data from NOAA Space Weather API.
    Returns Kp index values for the last 24 hours.
    """
    url = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # Filter to last 24 hours
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
            filtered_data = [
                item for item in data
                if datetime.fromisoformat(item["time_tag"].replace("Z", "+00:00")) > cutoff_time
            ]
            
            return filtered_data
        except Exception as e:
            print(f"Error fetching NOAA data: {e}")
            return []


def calculate_risk_scores(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculate daily risk scores (0-10) based on solar events using Pandas.
    
    Risk scoring logic:
    - CME events: Base score 2-6 based on speed (1000-3000+ km/s)
    - FLR events: Base score 1-5 based on class (B=1, C=2, M=3-4, X=5)
    - GST events: Base score 3-8 based on Kp index (5-9)
    - Recency multiplier: Events in last 24h get 1.5x multiplier
    - Daily cap: Maximum score of 10
    
    Returns list of daily risk scores with date, event count, risk score, and dominant event type.
    """
    if not events:
        return []
    
    # Convert events to DataFrame for processing
    df = pd.DataFrame(events)
    
    # Extract date from event time (field names vary by event type)
    df["eventDate"] = df.apply(
        lambda row: (
            row.get("timeTag") or 
            row.get("startTime") or 
            row.get("observedTime") or 
            row.get("startTime")
        ),
        axis=1
    )
    
    # Parse dates and extract date component
    df["parsedDate"] = pd.to_datetime(df["eventDate"], errors="coerce")
    df["date"] = df["parsedDate"].dt.date
    
    # Calculate individual event risk scores
    def calculate_event_risk(row: pd.Series) -> float:
        """Calculate risk score for a single event based on type and magnitude."""
        event_type = row.get("eventType", "")
        
        if event_type == "CME":
            # CME: Risk based on speed (1000-3000+ km/s)
            speed = row.get("speed", 0)
            if speed >= 3000:
                return 6.0
            elif speed >= 2000:
                return 4.5
            elif speed >= 1500:
                return 3.0
            elif speed >= 1000:
                return 2.0
            else:
                return 1.0
                
        elif event_type == "FLR":
            # FLR: Risk based on flare class (B=1, C=2, M=3-4, X=5)
            class_type = row.get("classType", "")
            if class_type.startswith("X"):
                return 5.0
            elif class_type.startswith("M"):
                # M1-M5 = 3, M5-M9 = 4
                magnitude = float(class_type[1:]) if len(class_type) > 1 else 0
                return 4.0 if magnitude >= 5 else 3.0
            elif class_type.startswith("C"):
                return 2.0
            elif class_type.startswith("B"):
                return 1.0
            else:
                return 1.0
                
        elif event_type == "GST":
            # GST: Risk based on Kp index (5-9)
            kp_index = row.get("kpIndex", 0)
            if kp_index >= 9:
                return 8.0
            elif kp_index >= 7:
                return 6.5
            elif kp_index >= 5:
                return 5.0
            else:
                return 3.0
        
        return 1.0  # Default minimal risk
    
    # Apply event risk calculation
    df["eventRisk"] = df.apply(calculate_event_risk, axis=1)
    
    # Apply recency multiplier (events in last 24 hours get 1.5x)
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
    df["recencyMultiplier"] = df["parsedDate"].apply(
        lambda x: 1.5 if pd.notna(x) and x > cutoff_time else 1.0
    )
    df["adjustedRisk"] = df["eventRisk"] * df["recencyMultiplier"]
    
    # Group by date and aggregate using named aggregations
    daily_risk = df.groupby("date").agg(
        dominantEventType=("eventType", lambda x: x.mode()[0] if len(x) > 0 else "None"),
        totalRisk=("adjustedRisk", "sum"),
        eventCount=("eventType", "count")
    ).reset_index()
    
    # Cap risk score at 10
    daily_risk["riskScore"] = np.minimum(daily_risk["totalRisk"], 10.0)
    
    # Format output
    result = []
    for _, row in daily_risk.iterrows():
        result.append({
            "date": row["date"].isoformat(),
            "event_count": int(row["eventCount"]),
            "risk_score": round(float(row["riskScore"]), 2),
            "dominant_event_type": row["dominantEventType"]
        })
    
    # Sort by date descending
    result.sort(key=lambda x: x["date"], reverse=True)
    
    return result


async def refresh_data():
    """
    Refresh all cached data from external APIs.
    Called by scheduler every 10 minutes.
    """
    global cached_events, cached_risk_scores, cached_noaa_data, last_fetch_time
    
    print(f"Refreshing data at {datetime.now(timezone.utc)}")
    
    # Fetch events
    cached_events = await fetch_nasa_donki_events()
    
    # Calculate risk scores
    cached_risk_scores = calculate_risk_scores(cached_events)
    
    # Fetch NOAA data
    cached_noaa_data = await fetch_noaa_kp_index()
    
    # Update last fetch time
    last_fetch_time = datetime.now(timezone.utc)
    
    print(f"Data refresh complete. Events: {len(cached_events)}, Risk scores: {len(cached_risk_scores)}, NOAA data points: {len(cached_noaa_data)}")


@app.on_event("startup")
async def startup_event():
    """Initialize data on startup and start scheduler."""
    # Initial data fetch
    await refresh_data()
    
    # Start scheduler for 10-minute refresh cycle
    scheduler.add_job(
        refresh_data,
        trigger=IntervalTrigger(minutes=10),
        id="data_refresh",
        replace_existing=True
    )
    scheduler.start()
    print("Scheduler started")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler on app shutdown."""
    scheduler.shutdown()
    print("Scheduler shutdown")


@app.get("/api/events", response_model=EventResponse)
async def get_events():
    """
    Get the last 7 days of solar events from NASA DONKI API.
    Returns CME, FLR, and GST events with timestamps and magnitudes.
    """
    return EventResponse(
        events=cached_events,
        last_updated=last_fetch_time.isoformat() if last_fetch_time else None
    )


@app.get("/api/risk", response_model=RiskScoreResponse)
async def get_risk_scores():
    """
    Get daily risk scores for the last 7 days.
    Risk scores (0-10) are computed based on event type, magnitude, and recency.
    """
    return RiskScoreResponse(
        risk_scores=cached_risk_scores,
        last_updated=last_fetch_time.isoformat() if last_fetch_time else None
    )


@app.get("/api/noaa", response_model=NOAADataResponse)
async def get_noaa_data():
    """
    Get current space weather conditions from NOAA Space Weather API.
    Returns Kp index values for the last 24 hours.
    """
    return NOAADataResponse(
        kp_index=cached_noaa_data,
        last_updated=last_fetch_time.isoformat() if last_fetch_time else None
    )


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "last_fetch": last_fetch_time.isoformat() if last_fetch_time else None,
        "events_count": len(cached_events),
        "risk_scores_count": len(cached_risk_scores),
        "noaa_data_count": len(cached_noaa_data)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# SpaceWeatherDash

A live space weather risk dashboard that consumes NASA and NOAA APIs to display real-time solar event intelligence. Built for satellite operators and space weather monitoring.

## Features

- **Real-time Risk Scoring**: Daily risk scores (0-10) computed from solar event data
- **Live Dashboard**: Dark-mode space-themed UI with auto-refresh every 5 minutes
- **Multiple Data Sources**: NASA DONKI API (CME, Flares, Geomagnetic Storms) and NOAA Space Weather API (Kp index)
- **Interactive Visualizations**: Risk gauge, 7-day trend charts, event tables, and Kp index charts
- **Automated Refresh**: Backend refreshes data every 10 minutes using APScheduler

## Architecture

### Backend (`/api`)
- **Framework**: Python FastAPI
- **Endpoints**:
  - `/api/events` - Fetches last 7 days of solar events from NASA DONKI API
  - `/api/risk` - Computes daily risk scores using Pandas based on event type, magnitude, and recency
  - `/api/noaa` - Fetches current Kp index values from NOAA Space Weather API
  - `/api/health` - Health check endpoint
- **Caching**: In-memory storage with 10-minute refresh cycle via APScheduler

### Frontend (`/frontend`)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS with custom space-themed dark mode
- **Charts**: Recharts for trend lines and bar charts
- **Auto-refresh**: Every 5 minutes

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- NASA API Key (optional, defaults to DEMO_KEY)

### Backend Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (optional):
```bash
# Create a .env file
echo "NASA_API_KEY=your_api_key_here" > .env
```
If no API key is provided, the application will use NASA's DEMO_KEY.

5. Run the backend:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running with Docker

### Backend Docker

1. Build the Docker image:
```bash
cd api
docker build -t spaceweather-api .
```

2. Run the container:
```bash
docker run -p 8000:8000 -e NASA_API_KEY=your_api_key_here spaceweather-api
```

Or using docker-compose (create docker-compose.yml in project root):
```yaml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - NASA_API_KEY=${NASA_API_KEY:-DEMO_KEY}
```

Then run:
```bash
docker-compose up
```

## Deployment

### Backend (Docker/Cloud)
- The backend is containerized with Dockerfile in `/api`
- Deploy to any container registry (Docker Hub, AWS ECR, GCP Container Registry)
- Ensure the NASA_API_KEY environment variable is set in production

### Frontend (Vercel)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from the frontend directory:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your deployed backend URL

Update `vercel.json` with your actual backend URL before deployment.

## API Documentation

### GET /api/events
Returns the last 7 days of solar events from NASA DONKI API.

**Response:**
```json
{
  "events": [
    {
      "eventType": "CME",
      "timeTag": "2024-01-15T12:00:00Z",
      "speed": 1200,
      ...
    }
  ],
  "last_updated": "2024-01-15T12:00:00Z"
}
```

### GET /api/risk
Returns daily risk scores for the last 7 days.

**Response:**
```json
{
  "risk_scores": [
    {
      "date": "2024-01-15",
      "event_count": 5,
      "risk_score": 6.5,
      "dominant_event_type": "CME"
    }
  ],
  "last_updated": "2024-01-15T12:00:00Z"
}
```

### GET /api/noaa
Returns Kp index values for the last 24 hours from NOAA.

**Response:**
```json
{
  "kp_index": [
    {
      "time_tag": "2024-01-15T12:00:00Z",
      "kp_index": 4
    }
  ],
  "last_updated": "2024-01-15T12:00:00Z"
}
```

## Risk Scoring Logic

The risk scoring algorithm in `/api/main.py` uses Pandas to compute daily risk scores:

### Event Type Weights
- **CME (Coronal Mass Ejections)**: Base score 1-6 based on speed
  - Speed ≥ 3000 km/s: 6.0
  - Speed ≥ 2000 km/s: 4.5
  - Speed ≥ 1500 km/s: 3.0
  - Speed ≥ 1000 km/s: 2.0
  - Speed < 1000 km/s: 1.0

- **FLR (Solar Flares)**: Base score 1-5 based on class
  - X-class: 5.0
  - M-class (M5+): 4.0
  - M-class (M1-M4): 3.0
  - C-class: 2.0
  - B-class: 1.0

- **GST (Geomagnetic Storms)**: Base score 3-8 based on Kp index
  - Kp ≥ 9: 8.0
  - Kp ≥ 7: 6.5
  - Kp ≥ 5: 5.0
  - Kp < 5: 3.0

### Recency Multiplier
- Events in the last 24 hours receive a 1.5x multiplier
- Older events use base score (1.0x multiplier)

### Daily Calculation
1. Sum all adjusted event risks for each day
2. Cap at maximum score of 10
3. Determine dominant event type (most frequent)

## Metrics for Satellite Operators

### Risk Score (0-10)
- **0-3 (Low Risk)**: Minor solar activity, minimal impact expected
  - Monitor routine operations
  - No special precautions needed

- **4-6 (Medium Risk)**: Moderate activity, potential for minor disruptions
  - Monitor satellite systems closely
  - Prepare for potential communication delays
  - Check radiation shielding status
  - Consider delaying non-critical maneuvers

- **7-10 (High Risk)**: Severe activity, significant impact likely
  - Implement protective measures immediately
  - Put satellites in safe mode if possible
  - Delay all non-essential operations
  - Prepare for potential satellite drag increases
  - Monitor for single-event upsets (SEUs)
  - Expect communication disruptions

### Kp Index (Planetary K-index)
- **0-2**: Quiet geomagnetic conditions
- **3-4**: Unsettled to active conditions
- **5-6**: Minor to moderate geomagnetic storm (G1-G2)
- **7-8**: Major to severe geomagnetic storm (G3-G4)
- **9**: Extreme geomagnetic storm (G5)

### Event Types
- **CME (Coronal Mass Ejection)**: Ejection of plasma and magnetic field from the solar corona. Can cause geomagnetic storms when Earth-directed.
- **FLR (Solar Flare)**: Intense brightness on the Sun. Can cause radio blackouts and radiation storms.
- **GST (Geomagnetic Storm)**: Disturbance in Earth's magnetosphere. Can cause satellite drag, navigation errors, and power grid fluctuations.

## Extending the Risk Scoring Logic

The risk scoring logic in `/api/main.py` is designed to be easily extended:

1. **Add new event types**: Update the `event_types` list in `fetch_nasa_donki_events()`
2. **Add new scoring rules**: Extend the `calculate_event_risk()` function with new event type logic
3. **Adjust weights**: Modify the base scores and multipliers in the scoring function
4. **Add new data sources**: Create new fetch functions and integrate into the `refresh_data()` function

## Troubleshooting

### API Issues
- If NASA API returns errors, verify your API key is valid
- NOAA API is public and doesn't require authentication
- Check network connectivity to external APIs

### Frontend Issues
- Ensure the backend is running on port 8000
- Check browser console for CORS errors
- Verify the Vite proxy configuration in `vite.config.js`

### Docker Issues
- Ensure Docker daemon is running
- Check port conflicts (default: 8000 for backend)
- Verify environment variables are properly passed

## License

This project is built for educational and operational purposes. Data sources:
- NASA DONKI API: https://api.nasa.gov/DONKI
- NOAA Space Weather API: https://services.swpc.noaa.gov/json/

## Contributing

This project is designed to be extensible. To add new features:
1. Backend: Add new endpoints in `main.py`
2. Frontend: Create new components in `frontend/src/components/`
3. Styling: Extend Tailwind config in `tailwind.config.js`

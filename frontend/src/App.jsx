import React, { useState, useEffect } from 'react';
import RiskGauge from './components/RiskGauge';
import RiskTrendChart from './components/RiskTrendChart';
import EventsTable from './components/EventsTable';
import KpIndexChart from './components/KpIndexChart';
import axios from 'axios';

function App() {
  const [riskData, setRiskData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [noaaData, setNoaaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [riskResponse, eventsResponse, noaaResponse] = await Promise.all([
        axios.get('/api/risk'),
        axios.get('/api/events'),
        axios.get('/api/noaa')
      ]);

      setRiskData(riskResponse.data);
      setEventsData(eventsResponse.data);
      setNoaaData(noaaResponse.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch data from API');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getCurrentRiskScore = () => {
    if (!riskData || !riskData.risk_scores || riskData.risk_scores.length === 0) {
      return 0;
    }
    return riskData.risk_scores[0].risk_score;
  };

  const getRiskColor = (score) => {
    if (score >= 7) return 'text-risk-high';
    if (score >= 4) return 'text-risk-medium';
    return 'text-risk-low';
  };

  return (
    <div className="min-h-screen bg-space-900 text-white">
      {/* Header */}
      <header className="bg-space-800 border-b border-space-600 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SpaceWeatherDash
            </h1>
            <p className="text-gray-400 text-sm">Live Solar Event Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-400">
                Last updated: {lastUpdated}
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-space-600 hover:bg-space-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Risk Score Gauge */}
        <div className="mb-8">
          <RiskGauge score={getCurrentRiskScore()} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Risk Trend Chart */}
          <div className="bg-space-800 rounded-xl p-6 border border-space-600">
            <h2 className="text-xl font-semibold mb-4">7-Day Risk Trend</h2>
            {riskData && <RiskTrendChart data={riskData.risk_scores} />}
          </div>

          {/* Kp Index Chart */}
          <div className="bg-space-800 rounded-xl p-6 border border-space-600">
            <h2 className="text-xl font-semibold mb-4">24-Hour Kp Index</h2>
            {noaaData && <KpIndexChart data={noaaData.kp_index} />}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-space-800 rounded-xl p-6 border border-space-600">
          <h2 className="text-xl font-semibold mb-4">Recent Solar Events</h2>
          {eventsData && <EventsTable data={eventsData.events} />}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-space-800 rounded-xl p-6 border border-space-600">
          <h2 className="text-xl font-semibold mb-4">Risk Score Legend</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-risk-low"></div>
              <div>
                <p className="font-semibold text-risk-low">Low Risk (0-3)</p>
                <p className="text-sm text-gray-400">Minor solar activity, minimal impact</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-risk-medium"></div>
              <div>
                <p className="font-semibold text-risk-medium">Medium Risk (4-6)</p>
                <p className="text-sm text-gray-400">Moderate activity, monitor satellite systems</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-risk-high"></div>
              <div>
                <p className="font-semibold text-risk-high">High Risk (7-10)</p>
                <p className="text-sm text-gray-400">Severe activity, take protective measures</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-space-800 border-t border-space-600 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>Data sources: NASA DONKI API & NOAA Space Weather Prediction Center</p>
          <p className="mt-1">For satellite operators: High risk scores indicate potential for satellite drag, communication disruptions, and radiation damage.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

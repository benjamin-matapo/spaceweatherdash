import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Satellite, Radio, AlertTriangle, CheckCircle2,
  TrendingUp, BarChart3, List, Info, Sun, Globe,
} from 'lucide-react';
import RiskGauge from './components/RiskGauge';
import RiskTrendChart from './components/RiskTrendChart';
import EventsTable from './components/EventsTable';
import KpIndexChart from './components/KpIndexChart';
import StatCards from './components/StatCards';
import {
  SkeletonGauge,
  SkeletonChart,
  SkeletonTable,
  SkeletonStatCards,
} from './components/Skeletons';
import axios from 'axios';

function App() {
  const [riskData, setRiskData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [noaaData, setNoaaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting | online | offline

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const [riskResponse, eventsResponse, noaaResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/risk`),
        axios.get(`${apiUrl}/api/events`),
        axios.get(`${apiUrl}/api/noaa`),
      ]);

      setRiskData(riskResponse.data);
      setEventsData(eventsResponse.data);
      setNoaaData(noaaResponse.data);
      setLastUpdated(new Date());
      setConnectionStatus('online');
    } catch (err) {
      setError('Unable to connect to the space weather API. Retrying…');
      setConnectionStatus('offline');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getCurrentRiskScore = () => {
    if (!riskData?.risk_scores?.length) return 0;
    return riskData.risk_scores[0].risk_score;
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffMs = now - lastUpdated;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin === 1) return '1 min ago';
    return `${diffMin} min ago`;
  };

  return (
    <div className="relative min-h-screen bg-space-950 text-white font-sans">
      {/* ── Ambient Background ─────────────────────────── */}
      <div className="starfield" aria-hidden="true" />
      <div className="nebula-glow nebula-glow--purple" aria-hidden="true" />
      <div className="nebula-glow nebula-glow--blue" aria-hidden="true" />
      <div className="nebula-glow nebula-glow--cyan" aria-hidden="true" />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="relative z-10 border-b border-space-700/50 backdrop-blur-md bg-space-950/60 sticky top-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sun className="w-7 h-7 text-amber-400 animate-spin-slow" />
              <div className="absolute inset-0 w-7 h-7 bg-amber-400/20 rounded-full blur-md" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  SpaceWeatherDash
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide">
                LIVE SOLAR EVENT INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Connection status */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <div className={`relative w-2 h-2 rounded-full ${
                connectionStatus === 'online'
                  ? 'bg-emerald-400 status-dot status-dot--green'
                  : connectionStatus === 'offline'
                  ? 'bg-red-400 status-dot status-dot--red'
                  : 'bg-amber-400 status-dot status-dot--amber'
              }`} />
              <span className="text-gray-500 font-medium">
                {connectionStatus === 'online' ? 'Live' : connectionStatus === 'offline' ? 'Offline' : 'Connecting'}
              </span>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <span className="hidden md:block text-xs text-gray-600">
                Updated {formatLastUpdated()}
              </span>
            )}

            {/* Refresh button */}
            <button
              id="refresh-button"
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-space-700/60 hover:bg-space-600/80 border border-space-600/50
                hover:border-accent-purple/30 transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:shadow-glow-purple"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────── */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Error Banner */}
        {error && (
          <div className="animate-fade-in-down glass-card border-red-500/30 p-4 flex items-center gap-3" id="error-banner">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-200 font-medium">{error}</p>
              <p className="text-xs text-red-300/60 mt-0.5">Check your connection or try refreshing</p>
            </div>
            <button
              onClick={() => fetchData()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error ? (
          <div className="space-y-6 animate-fade-in">
            <SkeletonStatCards />
            <SkeletonGauge />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
            <SkeletonTable />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <StatCards riskData={riskData} eventsData={eventsData} noaaData={noaaData} />

            {/* Risk Gauge */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <RiskGauge score={getCurrentRiskScore()} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Trend */}
              <div
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: '200ms', animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-accent-purple" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                    7-Day Risk Trend
                  </h2>
                </div>
                {riskData ? (
                  <RiskTrendChart data={riskData.risk_scores} />
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-600 text-sm">
                    Waiting for data…
                  </div>
                )}
              </div>

              {/* Kp Index */}
              <div
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: '300ms', animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-accent-cyan" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                    24-Hour Kp Index
                  </h2>
                </div>
                {noaaData ? (
                  <KpIndexChart data={noaaData.kp_index} />
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-600 text-sm">
                    Waiting for data…
                  </div>
                )}
              </div>
            </div>

            {/* Events Table */}
            <div
              className="glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: '400ms', animationFillMode: 'both' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-accent-blue" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                    Recent Solar Events
                  </h2>
                </div>
                {eventsData?.events?.length > 0 && (
                  <span className="text-xs font-mono text-gray-600 bg-space-700/50 px-2 py-0.5 rounded">
                    {eventsData.events.length} events
                  </span>
                )}
              </div>
              {eventsData ? (
                <EventsTable data={eventsData.events} />
              ) : (
                <div className="py-16 text-center text-gray-600 text-sm">
                  Waiting for data…
                </div>
              )}
            </div>

            {/* Risk Legend */}
            <div
              className="glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: '500ms', animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Info className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                  Risk Score Guide
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    level: 'Low Risk',
                    range: '0 – 3',
                    description: 'Minor solar activity. Minimal impact on satellite operations.',
                    color: 'text-risk-low',
                    dotColor: 'bg-risk-low',
                    bgColor: 'bg-risk-low/5',
                    borderColor: 'border-risk-low/20',
                    icon: CheckCircle2,
                  },
                  {
                    level: 'Moderate Risk',
                    range: '4 – 6',
                    description: 'Moderate activity. Monitor satellite drag and comm channels.',
                    color: 'text-risk-medium',
                    dotColor: 'bg-risk-medium',
                    bgColor: 'bg-risk-medium/5',
                    borderColor: 'border-risk-medium/20',
                    icon: Radio,
                  },
                  {
                    level: 'High Risk',
                    range: '7 – 10',
                    description: 'Severe activity. Expect comm disruptions and radiation risk.',
                    color: 'text-risk-high',
                    dotColor: 'bg-risk-high',
                    bgColor: 'bg-risk-high/5',
                    borderColor: 'border-risk-high/20',
                    icon: Satellite,
                  },
                ].map((item) => (
                  <div
                    key={item.level}
                    className={`rounded-xl p-4 ${item.bgColor} border ${item.borderColor} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className={`text-sm font-bold ${item.color}`}>{item.level}</span>
                      <span className="text-xs text-gray-600 font-mono ml-auto">{item.range}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-space-700/30 mt-8 backdrop-blur-sm bg-space-950/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Globe className="w-3.5 h-3.5" />
              <span>Data from NASA DONKI API &amp; NOAA SWPC</span>
            </div>
            <p className="text-xs text-gray-700 text-center sm:text-right max-w-md">
              For satellite operators: High risk scores indicate potential for satellite drag,
              communication disruptions, and radiation damage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

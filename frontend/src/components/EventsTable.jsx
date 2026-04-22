import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

/**
 * EventsTable - Professional data table for recent solar events.
 * Features sortable columns, event type badges with icons, risk contribution indicators,
 * and responsive card layout on mobile.
 */
function EventsTable({ data }) {
  const [sortField, setSortField] = useState('time');
  const [sortAsc, setSortAsc] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center mb-4">
          <ExternalLink className="w-5 h-5 text-gray-600" />
        </div>
        <p className="text-sm font-medium">No events recorded</p>
        <p className="text-xs text-gray-600 mt-1">Solar events will appear here when detected</p>
      </div>
    );
  }

  const formatEventTime = (event) => {
    const timeField = event.timeTag || event.startTime || event.observedTime;
    if (!timeField) return 'N/A';
    try {
      const d = new Date(timeField);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return 'N/A';
    }
  };

  const getEventTimestamp = (event) => {
    const timeField = event.timeTag || event.startTime || event.observedTime;
    return timeField ? new Date(timeField).getTime() : 0;
  };

  const getEventMagnitude = (event) => {
    if (event.eventType === 'CME') return event.speed ? `${Math.round(event.speed)} km/s` : 'N/A';
    if (event.eventType === 'FLR') return event.classType || 'N/A';
    if (event.eventType === 'GST') return event.kpIndex ? `Kp ${event.kpIndex}` : 'N/A';
    return 'N/A';
  };

  const getRiskScore = (event) => {
    if (event.eventType === 'CME') {
      const speed = event.speed || 0;
      if (speed >= 3000) return 6.0;
      if (speed >= 2000) return 4.5;
      if (speed >= 1500) return 3.0;
      if (speed >= 1000) return 2.0;
      return 1.0;
    }
    if (event.eventType === 'FLR') {
      const ct = event.classType || '';
      if (ct.startsWith('X')) return 5.0;
      if (ct.startsWith('M')) return parseFloat(ct.slice(1)) >= 5 ? 4.0 : 3.0;
      if (ct.startsWith('C')) return 2.0;
      return 1.0;
    }
    if (event.eventType === 'GST') {
      const kp = event.kpIndex || 0;
      if (kp >= 9) return 8.0;
      if (kp >= 7) return 6.5;
      if (kp >= 5) return 5.0;
      return 3.0;
    }
    return 1.0;
  };

  const getRiskBarColor = (score) => {
    if (score >= 5) return 'bg-risk-high';
    if (score >= 3) return 'bg-risk-medium';
    return 'bg-risk-low';
  };

  const getRiskBarWidth = (score) => `${Math.min((score / 8) * 100, 100)}%`;

  const eventTypeConfig = {
    CME: {
      label: 'CME',
      fullLabel: 'Coronal Mass Ejection',
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      dot: 'bg-purple-400',
    },
    FLR: {
      label: 'FLR',
      fullLabel: 'Solar Flare',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
    },
    GST: {
      label: 'GST',
      fullLabel: 'Geomagnetic Storm',
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      dot: 'bg-cyan-400',
    },
  };

  // Sort events
  const sorted = [...data].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'time') {
      cmp = getEventTimestamp(a) - getEventTimestamp(b);
    } else if (sortField === 'type') {
      cmp = (a.eventType || '').localeCompare(b.eventType || '');
    } else if (sortField === 'risk') {
      cmp = getRiskScore(a) - getRiskScore(b);
    }
    return sortAsc ? cmp : -cmp;
  });

  const visible = sorted.slice(0, visibleCount);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-600" />;
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-accent-purple" />
      : <ChevronDown className="w-3 h-3 text-accent-purple" />;
  };

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-space-600/50">
              {[
                { key: 'type', label: 'Event Type' },
                { key: 'time', label: 'Time (UTC)' },
                { key: 'magnitude', label: 'Magnitude' },
                { key: 'risk', label: 'Risk Contribution' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'magnitude' && handleSort(col.key)}
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                    col.key !== 'magnitude' ? 'cursor-pointer hover:text-gray-300 select-none' : ''
                  } transition-colors`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.key !== 'magnitude' && <SortIcon field={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((event, index) => {
              const config = eventTypeConfig[event.eventType] || eventTypeConfig.CME;
              const riskScore = getRiskScore(event);
              return (
                <tr
                  key={index}
                  className="event-row border-b border-space-700/30"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500 hidden lg:inline">
                        {config.fullLabel}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-300 font-mono text-xs">
                    {formatEventTime(event)}
                  </td>
                  <td className="py-3.5 px-4 text-sm font-mono font-medium text-gray-200">
                    {getEventMagnitude(event)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-space-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getRiskBarColor(riskScore)} transition-all duration-500`}
                          style={{ width: getRiskBarWidth(riskScore) }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-400 w-8">
                        {riskScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {visible.map((event, index) => {
          const config = eventTypeConfig[event.eventType] || eventTypeConfig.CME;
          const riskScore = getRiskScore(event);
          return (
            <div
              key={index}
              className="bg-space-800/50 rounded-xl p-4 border border-space-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                  {config.fullLabel}
                </span>
                <span className="text-xs font-mono text-gray-500">{formatEventTime(event)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Magnitude</span>
                  <p className="text-sm font-mono font-medium text-gray-200">{getEventMagnitude(event)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Risk</span>
                  <p className="text-sm font-mono font-medium text-gray-200">{riskScore.toFixed(1)}</p>
                </div>
              </div>
              <div className="mt-2 w-full h-1.5 bg-space-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getRiskBarColor(riskScore)}`}
                  style={{ width: getRiskBarWidth(riskScore) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / less */}
      {data.length > 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setVisibleCount((c) => (c >= data.length ? 10 : Math.min(c + 10, data.length)))
            }
            className="text-xs font-medium text-accent-purple hover:text-purple-300 transition-colors px-4 py-2 rounded-lg hover:bg-purple-500/10"
          >
            {visibleCount >= data.length
              ? 'Show less'
              : `Show more (${data.length - visibleCount} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}

export default EventsTable;

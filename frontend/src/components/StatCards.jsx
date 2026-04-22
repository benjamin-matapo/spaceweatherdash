import React from 'react';
import { Activity, Zap, Wind, Gauge } from 'lucide-react';

/**
 * StatCards - Quick-glance metric cards at the top of the dashboard.
 * Displays today's risk, total events, latest Kp index, and dominant event type.
 */
function StatCards({ riskData, eventsData, noaaData }) {
  const currentRisk = riskData?.risk_scores?.[0]?.risk_score ?? null;
  const totalEvents = eventsData?.events?.length ?? 0;
  const latestKp = noaaData?.kp_index?.length
    ? noaaData.kp_index[noaaData.kp_index.length - 1]?.kp_index ?? 0
    : null;
  const dominantType = riskData?.risk_scores?.[0]?.dominant_event_type ?? '--';

  const getRiskLevel = (score) => {
    if (score === null) return { label: '--', color: 'text-gray-400', bg: 'bg-space-700' };
    if (score >= 7) return { label: 'High', color: 'text-risk-high', bg: 'bg-risk-high/10' };
    if (score >= 4) return { label: 'Moderate', color: 'text-risk-medium', bg: 'bg-risk-medium/10' };
    return { label: 'Low', color: 'text-risk-low', bg: 'bg-risk-low/10' };
  };

  const getKpColor = (kp) => {
    if (kp === null) return 'text-gray-400';
    if (kp >= 7) return 'text-risk-high';
    if (kp >= 5) return 'text-risk-medium';
    return 'text-accent-cyan';
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'CME': return 'CME';
      case 'FLR': return 'Solar Flare';
      case 'GST': return 'Geo Storm';
      default: return type;
    }
  };

  const risk = getRiskLevel(currentRisk);

  const cards = [
    {
      icon: Gauge,
      label: 'Risk Level',
      value: currentRisk !== null ? currentRisk.toFixed(1) : '--',
      sub: risk.label,
      color: risk.color,
      iconColor: risk.color,
    },
    {
      icon: Activity,
      label: 'Events (7d)',
      value: totalEvents.toString(),
      sub: 'Solar events tracked',
      color: 'text-accent-purple',
      iconColor: 'text-accent-purple',
    },
    {
      icon: Zap,
      label: 'Kp Index',
      value: latestKp !== null ? latestKp.toFixed(1) : '--',
      sub: 'Current geomagnetic',
      color: getKpColor(latestKp),
      iconColor: getKpColor(latestKp),
    },
    {
      icon: Wind,
      label: 'Dominant Type',
      value: getEventTypeLabel(dominantType),
      sub: 'Most frequent today',
      color: 'text-accent-blue',
      iconColor: 'text-accent-blue',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="glass-card p-5 animate-fade-in-up group cursor-default"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {card.label}
            </span>
            <card.icon
              className={`w-4 h-4 ${card.iconColor} opacity-60 group-hover:opacity-100 transition-opacity`}
            />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${card.color} mb-1`}>
            {card.value}
          </div>
          <div className="text-xs text-gray-500">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;

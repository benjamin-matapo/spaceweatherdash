import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

/**
 * RiskTrendChart - 7-day risk score area chart with gradient fill,
 * reference lines for risk thresholds, and custom tooltip.
 */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const getColor = (v) => {
    if (v >= 7) return '#f87171';
    if (v >= 4) return '#fbbf24';
    return '#34d399';
  };
  const getLabel = (v) => {
    if (v >= 7) return 'High';
    if (v >= 4) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="custom-tooltip">
      <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getColor(value) }}
        />
        <span className="text-white font-bold font-mono text-sm">
          {value.toFixed(1)}
        </span>
        <span className="text-xs" style={{ color: getColor(value) }}>
          {getLabel(value)}
        </span>
      </div>
    </div>
  );
};

function RiskTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-gray-500">
        <p className="text-sm">No risk trend data available</p>
        <p className="text-xs mt-1 text-gray-600">Data will appear once events are processed</p>
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      risk: item.risk_score,
      events: item.event_count,
    }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(50,50,122,0.4)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="transparent"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            stroke="transparent"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(167,139,250,0.2)' }} />

          {/* Risk threshold lines */}
          <ReferenceLine
            y={4}
            stroke="rgba(251,191,36,0.2)"
            strokeDasharray="6 4"
            label={{ value: '', position: 'right' }}
          />
          <ReferenceLine
            y={7}
            stroke="rgba(248,113,113,0.2)"
            strokeDasharray="6 4"
            label={{ value: '', position: 'right' }}
          />

          <Area
            type="monotone"
            dataKey="risk"
            stroke="#a78bfa"
            strokeWidth={2.5}
            fill="url(#riskGradient)"
            dot={{
              fill: '#a78bfa',
              r: 4,
              stroke: '#12122a',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: '#a78bfa',
              stroke: '#a78bfa',
              strokeWidth: 3,
              strokeOpacity: 0.3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskTrendChart;

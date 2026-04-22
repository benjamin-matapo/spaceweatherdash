import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

/**
 * KpIndexChart - 24-hour Kp index bar chart with color-coded bars
 * based on geomagnetic storm thresholds, reference lines, and custom tooltip.
 */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const getStormLevel = (kp) => {
    if (kp >= 8) return { label: 'Severe Storm (G4)', color: '#dc2626' };
    if (kp >= 7) return { label: 'Strong Storm (G3)', color: '#f87171' };
    if (kp >= 6) return { label: 'Moderate Storm (G2)', color: '#f59e0b' };
    if (kp >= 5) return { label: 'Minor Storm (G1)', color: '#fbbf24' };
    if (kp >= 4) return { label: 'Active', color: '#34d399' };
    return { label: 'Quiet', color: '#60a5fa' };
  };
  const storm = getStormLevel(value);

  return (
    <div className="custom-tooltip">
      <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: storm.color }} />
        <span className="text-white font-bold font-mono text-sm">Kp {value.toFixed(1)}</span>
      </div>
      <p className="text-xs mt-1" style={{ color: storm.color }}>{storm.label}</p>
    </div>
  );
};

function KpIndexChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-gray-500">
        <p className="text-sm">No Kp index data available</p>
        <p className="text-xs mt-1 text-gray-600">NOAA data will appear when available</p>
      </div>
    );
  }

  // Sample to ~24 points for readability
  const step = Math.max(1, Math.floor(data.length / 24));
  const sampled = data.filter((_, i) => i % step === 0).slice(-24);

  const chartData = sampled.map((item) => ({
    time: new Date(item.time_tag).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    kp: item.kp_index || 0,
  }));

  const getBarColor = (kp) => {
    if (kp >= 8) return '#dc2626';
    if (kp >= 7) return '#f87171';
    if (kp >= 6) return '#f59e0b';
    if (kp >= 5) return '#fbbf24';
    if (kp >= 4) return '#34d399';
    return '#818cf8';
  };

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {chartData.map((entry, i) => (
              <linearGradient key={`kpGrad-${i}`} id={`kpGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getBarColor(entry.kp)} stopOpacity={0.9} />
                <stop offset="100%" stopColor={getBarColor(entry.kp)} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(50,50,122,0.4)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke="transparent"
            tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 9]}
            stroke="transparent"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Inter' }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 3, 5, 7, 9]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(167,139,250,0.06)' }} />

          {/* Storm threshold lines */}
          <ReferenceLine y={5} stroke="rgba(251,191,36,0.25)" strokeDasharray="6 4" />
          <ReferenceLine y={7} stroke="rgba(248,113,113,0.25)" strokeDasharray="6 4" />

          <Bar dataKey="kp" radius={[4, 4, 0, 0]} maxBarSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#kpGrad-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default KpIndexChart;

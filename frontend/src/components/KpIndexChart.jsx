import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function KpIndexChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No Kp index data available</div>;
  }

  // Process data for the chart
  const chartData = data.slice(-24).map(item => ({
    time: new Date(item.time_tag).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    kp: item.kp_index || 0,
  }));

  const getKpColor = (kp) => {
    if (kp >= 7) return '#ef4444';
    if (kp >= 5) return '#f59e0b';
    if (kp >= 4) return '#22c55e';
    return '#3b82f6';
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252550" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 9]}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a3a',
              border: '1px solid #252550',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar 
            dataKey="kp" 
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <rect 
                key={`bar-${index}`}
                fill={getKpColor(entry.kp)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default KpIndexChart;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function RiskTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>;
  }

  // Sort data by date ascending for the chart
  const chartData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    risk: item.risk_score,
  }));

  const getRiskColor = (score) => {
    if (score >= 7) return '#ef4444';
    if (score >= 4) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#252550" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            domain={[0, 10]}
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
          <Line 
            type="monotone" 
            dataKey="risk" 
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskTrendChart;

import React from 'react';

function RiskGauge({ score }) {
  const getRiskColor = (score) => {
    if (score >= 7) return 'bg-risk-high';
    if (score >= 4) return 'bg-risk-medium';
    return 'bg-risk-low';
  };

  const getRiskLabel = (score) => {
    if (score >= 7) return 'HIGH RISK';
    if (score >= 4) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  const getTextColor = (score) => {
    if (score >= 7) return 'text-risk-high';
    if (score >= 4) return 'text-risk-medium';
    return 'text-risk-low';
  };

  const percentage = Math.min((score / 10) * 100, 100);

  return (
    <div className="bg-space-800 rounded-xl p-8 border border-space-600">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-6 text-gray-200">Current Space Weather Risk</h2>
        
        {/* Gauge Display */}
        <div className="relative w-64 h-32 mx-auto mb-6">
          {/* Background arc */}
          <div className="absolute w-64 h-32 rounded-t-full bg-space-600 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-full rounded-t-full flex">
              {/* Color segments */}
              <div className="flex-1 bg-risk-low"></div>
              <div className="flex-1 bg-risk-medium"></div>
              <div className="flex-1 bg-risk-high"></div>
            </div>
          </div>
          
          {/* Needle/Indicator */}
          <div 
            className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom transition-transform duration-500"
            style={{
              transform: `rotate(${(score / 10) * 180 - 90}deg)`,
            }}
          ></div>
          
          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Score Display */}
        <div className="mb-4">
          <div className={`text-6xl font-bold ${getTextColor(score)}`}>
            {score.toFixed(1)}
          </div>
          <div className={`text-lg font-semibold ${getTextColor(score)}`}>
            {getRiskLabel(score)}
          </div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-sm text-gray-400 px-8">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}

export default RiskGauge;

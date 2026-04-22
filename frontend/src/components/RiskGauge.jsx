import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

/**
 * RiskGauge - Premium SVG-based semicircular gauge showing current space weather risk.
 * Features animated needle, gradient arc, glow effects, and risk level indicator.
 */
function RiskGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount / change
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = animatedScore;
    const to = score;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const getRiskInfo = (s) => {
    if (s >= 7) return {
      label: 'HIGH RISK',
      sublabel: 'Take protective measures',
      color: '#f87171',
      glowColor: 'rgba(248,113,113,0.3)',
      Icon: ShieldAlert,
      gradient: 'from-red-500/20 to-orange-500/10',
    };
    if (s >= 4) return {
      label: 'MODERATE RISK',
      sublabel: 'Monitor satellite systems',
      color: '#fbbf24',
      glowColor: 'rgba(251,191,36,0.3)',
      Icon: Shield,
      gradient: 'from-amber-500/20 to-yellow-500/10',
    };
    return {
      label: 'LOW RISK',
      sublabel: 'Minimal solar impact',
      color: '#34d399',
      glowColor: 'rgba(52,211,153,0.3)',
      Icon: ShieldCheck,
      gradient: 'from-emerald-500/20 to-teal-500/10',
    };
  };

  const risk = getRiskInfo(score);

  // SVG arc parameters
  const cx = 150;
  const cy = 140;
  const radius = 110;
  const startAngle = Math.PI;  // 180°
  const endAngle = 0;          // 0°
  const arcLength = Math.PI * radius;

  // Needle angle based on score (0-10 maps to 180° to 0°)
  const needleAngle = Math.PI - (animatedScore / 10) * Math.PI;
  const needleX = cx + radius * 0.85 * Math.cos(needleAngle);
  const needleY = cy - radius * 0.85 * Math.sin(needleAngle);

  // Arc path for the background
  const describeArc = (r) => {
    const x1 = cx - r;
    const y1 = cy;
    const x2 = cx + r;
    const y2 = cy;
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <div className={`glass-card p-8 relative overflow-hidden animate-fade-in-up`}>
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${risk.glowColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative text-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Current Space Weather Risk
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Composite score based on CME, solar flare, and geomagnetic storm activity
        </p>

        {/* SVG Gauge */}
        <div className="relative mx-auto" style={{ width: 300, height: 180 }}>
          <svg viewBox="0 0 300 180" className="w-full h-full">
            <defs>
              {/* Gradient for the arc */}
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="35%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="85%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="needleGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <path
              d={describeArc(radius)}
              fill="none"
              stroke="rgba(50,50,122,0.3)"
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Colored arc */}
            <path
              d={describeArc(radius)}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              filter="url(#glow)"
              strokeDasharray={arcLength}
              strokeDashoffset={arcLength * (1 - animatedScore / 10)}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />

            {/* Tick marks */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => {
              const angle = Math.PI - (tick / 10) * Math.PI;
              const innerR = radius + 14;
              const outerR = radius + (tick % 5 === 0 ? 24 : 19);
              const x1 = cx + innerR * Math.cos(angle);
              const y1 = cy - innerR * Math.sin(angle);
              const x2 = cx + outerR * Math.cos(angle);
              const y2 = cy - outerR * Math.sin(angle);
              return (
                <g key={tick}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={tick % 5 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={tick % 5 === 0 ? 2 : 1}
                  />
                  {tick % 5 === 0 && (
                    <text
                      x={cx + (outerR + 12) * Math.cos(angle)}
                      y={cy - (outerR + 12) * Math.sin(angle)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.35)"
                      fontSize="11"
                      fontFamily="Inter"
                      fontWeight="500"
                    >
                      {tick}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Needle */}
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke={risk.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#needleGlow)"
            />

            {/* Center dot */}
            <circle cx={cx} cy={cy} r="6" fill={risk.color} opacity="0.8" />
            <circle cx={cx} cy={cy} r="3" fill="white" opacity="0.9" />
          </svg>
        </div>

        {/* Score display */}
        <div className="mt-2 mb-4">
          <div
            className="text-6xl font-black font-mono tabular-nums tracking-tight"
            style={{ color: risk.color }}
          >
            {animatedScore.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <risk.Icon className="w-5 h-5" style={{ color: risk.color }} />
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: risk.color }}
            >
              {risk.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{risk.sublabel}</p>
        </div>
      </div>
    </div>
  );
}

export default RiskGauge;

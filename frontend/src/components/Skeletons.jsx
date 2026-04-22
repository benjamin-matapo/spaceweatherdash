import React from 'react';

/**
 * Skeleton loading components for dashboard cards.
 * Provides animated placeholder UI while data loads.
 */

export function SkeletonGauge() {
  return (
    <div className="glass-card p-8 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="skeleton h-5 w-56 rounded-lg" />
        <div className="skeleton h-40 w-64 rounded-full" />
        <div className="skeleton h-12 w-24 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="skeleton h-5 w-40 mb-6 rounded-lg" />
      <div className="flex items-end gap-2 h-64">
        {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
          <div
            key={i}
            className="skeleton flex-1 rounded-t-md"
            style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="skeleton h-5 w-44 mb-6 rounded-lg" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="skeleton h-8 w-32 rounded-full" />
            <div className="skeleton h-8 flex-1 rounded-lg" />
            <div className="skeleton h-8 w-24 rounded-lg" />
            <div className="skeleton h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="skeleton h-4 w-20 mb-3 rounded-lg" />
          <div className="skeleton h-8 w-16 mb-2 rounded-lg" />
          <div className="skeleton h-3 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

import React from 'react';

/**
 * StatCard — Metric display card with icon, value, label, and optional trend.
 * Redesigned to feature an absolute bottom accent line, custom colors,
 * right-aligned values, and highly styled badge pills.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element rendered in a rounded container.
 * @param {string|number} props.value - Primary stat value.
 * @param {string} props.label - Descriptive label below the value.
 * @param {{ value: string|number, direction: 'up'|'down' }} [props.trend] - Optional trend indicator.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function StatCard({ icon, value, label, trend, className = '' }) {
  const lowerLabel = label.toLowerCase();
  
  // Dynamic bottom accent line color based on card label
  let accentColor = 'bg-brand';
  if (lowerLabel.includes('notebook')) {
    accentColor = 'bg-indigo-500';
  } else if (lowerLabel.includes('quiz')) {
    accentColor = 'bg-blue-500';
  } else if (lowerLabel.includes('streak')) {
    accentColor = 'bg-orange-500';
  } else if (lowerLabel.includes('weak')) {
    accentColor = 'bg-red-500';
  } else if (lowerLabel.includes('xp')) {
    accentColor = 'bg-purple-500';
  }

  const isStreak = lowerLabel.includes('streak');

  // Format trend value for clean representation (e.g., "+2 this week" -> "+2")
  const formatTrendValue = (val) => {
    if (typeof val === 'string') {
      return val.replace(/\s+this\s+week/i, '').trim();
    }
    return val;
  };

  return (
    <div className={`relative overflow-hidden bg-[#151515] border border-neutral-800/80 rounded-2xl p-5 min-h-[145px] flex flex-col justify-between shadow-lg transition-all duration-300 hover:border-neutral-700/80 hover:shadow-xl group ${className}`}>
      {/* Absolute Bottom Accent Highlight Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[4px] rounded-b-2xl transition-all duration-300 group-hover:h-[6px] ${accentColor}`} />

      {/* Top Row: Icon container + Badge */}
      <div className="flex items-center justify-between w-full">
        {/* Icon container */}
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-[#222222] border border-neutral-800/40 flex items-center justify-center text-text-primary transition-colors duration-300 group-hover:bg-[#2a2a2a] group-hover:border-neutral-700/40 shrink-0">
            {React.isValidElement(icon) ? (
              React.cloneElement(icon, { 
                className: `w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${icon.props.className || ''}` 
              })
            ) : (
              <span className="text-lg transition-transform duration-300 group-hover:scale-110">{icon}</span>
            )}
          </div>
        )}

        {/* Badge: Trend or Status */}
        {trend ? (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
              trend.direction === 'up'
                ? 'text-green-400 bg-green-500/10 border border-green-500/10'
                : 'text-red-400 bg-red-500/10 border border-red-500/10'
            }`}
          >
            <span className="text-[10px]">{trend.direction === 'up' ? '↗' : '↘'}</span>
            {formatTrendValue(trend.value)}
          </span>
        ) : isStreak ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/10 transition-all duration-300">
            <span className="text-[10px]">🔥</span> Active
          </span>
        ) : null}
      </div>

      {/* Bottom Row: Value + Label (Right Aligned) */}
      <div className="flex flex-col items-end mt-4 w-full">
        {/* Value */}
        <span className="text-[36px] font-bold text-white tracking-tight leading-none transition-transform duration-300 group-hover:translate-x-[-2px]">
          {value}
        </span>

        {/* Label */}
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.1em] mt-2 transition-colors duration-300 group-hover:text-neutral-300">
          {label}
        </span>
      </div>
    </div>
  );
}


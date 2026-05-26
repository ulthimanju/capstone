/**
 * XPBar — Experience-point progress bar with level indicator.
 *
 * Displays a gradient-filled progress track, a floating level badge,
 * and a current/max XP readout below the bar.
 *
 * @param {object} props
 * @param {number} props.currentXP – Current experience points
 * @param {number} props.maxXP     – XP needed for next level
 * @param {number} props.level     – Current level number
 * @param {string} [props.className]
 */
export default function XPBar({ currentXP, maxXP, level, className = '' }) {
  const pct = maxXP > 0 ? Math.min((currentXP / maxXP) * 100, 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Track + fill */}
      <div className="relative">
        {/* Level badge */}
        <span className="absolute right-0 -top-6 bg-surface-elevated text-text-muted text-xs rounded-full px-2 py-0.5">
          Level {level}
        </span>

        <div className="h-3 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* XP label */}
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>
          {currentXP} / {maxXP} XP
        </span>
      </div>
    </div>
  );
}

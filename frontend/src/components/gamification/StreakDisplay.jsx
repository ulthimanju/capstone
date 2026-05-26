/**
 * StreakDisplay — Shows the user's current learning streak.
 *
 * Renders a flame icon, the streak count, and a label. Visual style
 * differs based on whether the streak is active today.
 *
 * @param {object}  props
 * @param {number}  props.count       – Number of consecutive days
 * @param {boolean} [props.activeToday] – Whether the user has been active today
 * @param {string}  [props.className]
 */
export default function StreakDisplay({
  count,
  activeToday = false,
  className = '',
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Flame icon */}
      <span
        className={`text-xl ${
          activeToday ? 'text-warning' : 'text-text-disabled grayscale'
        }`}
      >
        🔥
      </span>

      {/* Count + label */}
      <div className="flex flex-col leading-tight">
        <span
          className={`text-lg font-bold ${
            activeToday ? 'text-text-primary' : 'text-text-muted'
          }`}
        >
          {count}
        </span>
        <span
          className={`text-xs ${
            activeToday ? 'text-warning' : 'text-text-muted'
          }`}
        >
          {activeToday ? 'day streak!' : 'days'}
        </span>
      </div>
    </div>
  );
}

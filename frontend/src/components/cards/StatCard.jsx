/**
 * StatCard — Metric display card with icon, value, label, and optional trend.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element rendered in a rounded container.
 * @param {string|number} props.value - Primary stat value.
 * @param {string} props.label - Descriptive label below the value.
 * @param {{ value: string|number, direction: 'up'|'down' }} [props.trend] - Optional trend indicator.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function StatCard({ icon, value, label, trend, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-md p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          {/* Icon container */}
          {icon && (
            <div className="w-10 h-10 rounded-md bg-surface-elevated flex items-center justify-center text-text-muted">
              {icon}
            </div>
          )}

          {/* Value */}
          <span className="text-2xl font-bold text-text-primary">{value}</span>

          {/* Label */}
          <span className="text-sm text-text-muted">{label}</span>
        </div>

        {/* Trend */}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend.direction === 'up' ? 'text-brand' : 'text-danger'
            }`}
          >
            <span aria-hidden="true">{trend.direction === 'up' ? '▲' : '▼'}</span>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

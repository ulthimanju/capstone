/**
 * StatusBadge — Badge with a small dot indicator on the left for live statuses.
 *
 * @param {{ status?: 'success'|'warning'|'error'|'neutral'|'info', children: React.ReactNode, className?: string }} props
 */

const statusConfig = {
  success: { bg: 'bg-success-muted', text: 'text-success',        dot: 'bg-success' },
  warning: { bg: 'bg-warning-muted', text: 'text-warning',      dot: 'bg-warning' },
  error:   { bg: 'bg-danger-muted',  text: 'text-danger',       dot: 'bg-danger' },
  neutral: { bg: 'bg-surface-elevated', text: 'text-text-muted', dot: 'bg-text-muted' },
  info:    { bg: 'bg-accent-blue-muted', text: 'text-accent-blue', dot: 'bg-accent-blue' },
};

export default function StatusBadge({ status = 'neutral', children, className = '' }) {
  const config = statusConfig[status] ?? statusConfig.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}

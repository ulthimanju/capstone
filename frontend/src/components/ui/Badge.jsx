/**
 * Badge — A small, rounded-full pill for labeling and categorization.
 *
 * @param {{ variant?: 'success'|'warning'|'danger'|'neutral'|'brand', children: React.ReactNode, className?: string }} props
 */

const variantClasses = {
  success: 'bg-success-muted text-brand',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  neutral: 'bg-surface-elevated text-text-muted',
  brand: 'bg-brand/10 text-brand',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${variantClasses[variant] ?? variantClasses.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

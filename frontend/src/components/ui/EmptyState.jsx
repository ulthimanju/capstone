/**
 * EmptyState — Centered placeholder for empty lists or no-data views.
 *
 * @param {{
 *   icon?: React.ReactNode,
 *   title: string,
 *   description?: string,
 *   action?: React.ReactNode,
 *   className?: string
 * }} props
 */
export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-2xl text-text-muted">
          {icon}
        </div>
      )}

      <h3 className="text-base font-medium text-text-primary mt-4">{title}</h3>

      {description && (
        <p className="text-sm text-text-muted mt-1 max-w-xs text-center">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

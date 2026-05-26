/**
 * AssignmentCard — Assignment display with status-dependent grade presentation.
 *
 * @param {Object} props
 * @param {string} props.title - Assignment title.
 * @param {'GRADED'|'PENDING'|'SUBMITTED'} props.status - Assignment status.
 * @param {string|number} [props.grade] - Grade value (shown when GRADED).
 * @param {string} [props.dueDate] - Due date string.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function AssignmentCard({ title, status, grade, dueDate, className = '' }) {
  const renderStatus = () => {
    switch (status) {
      case 'GRADED':
        return (
          <span className="text-2xl font-bold text-brand">{grade}</span>
        );
      case 'SUBMITTED':
        return (
          <span className="text-sm font-medium text-accent-blue">Submitted</span>
        );
      case 'PENDING':
      default:
        return (
          <span className="text-sm font-medium text-text-muted">Pending review</span>
        );
    }
  };

  /** Status badge styles */
  const statusBadge = {
    GRADED: 'bg-success-muted text-brand',
    SUBMITTED: 'bg-accent-blue-muted text-accent-blue',
    PENDING: 'bg-surface-elevated text-text-muted',
  };

  const badgeClass = statusBadge[status] || statusBadge.PENDING;

  return (
    <div className={`bg-surface border border-border rounded-md p-4 flex flex-col ${className}`}>
      {/* Header: title + status badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${badgeClass}`}>
          {status}
        </span>
      </div>

      {/* Grade / Status display */}
      <div className="mt-3">
        {renderStatus()}
      </div>

      {/* Due date */}
      {dueDate && (
        <span className="text-xs text-text-muted mt-auto pt-3">
          Due: {dueDate}
        </span>
      )}
    </div>
  );
}

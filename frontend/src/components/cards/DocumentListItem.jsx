import StatusBadge from '../ui/StatusBadge';

/**
 * DocumentListItem — Horizontal row card for document entries.
 *
 * @param {Object} props
 * @param {string} props.name - Document name.
 * @param {string} [props.format] - File format (e.g. 'PDF', 'MD', 'TXT').
 * @param {string} [props.status] - Document status label.
 * @param {() => void} [props.onDelete] - Delete callback.
 * @param {() => void} [props.onClick] - Click callback.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function DocumentListItem({ name, format, status, onDelete, onClick, className = '' }) {
  /** Badge colors per format */
  const formatColors = {
    PDF: 'bg-danger-muted text-danger',
    MD: 'bg-accent-purple-muted text-accent-purple',
    TXT: 'bg-accent-blue-muted text-accent-blue',
  };

  const getStatusType = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'ready':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const formatClass = formatColors[format?.toUpperCase()] || 'bg-surface-elevated text-text-muted';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={`
        group bg-surface border border-border rounded-md p-4
        flex items-center h-14 cursor-pointer
        transition-colors duration-150
        hover:border-border-hover
        focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2
        ${className}
      `}
    >
      {/* Format badge */}
      {format && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono font-medium flex-shrink-0 ${formatClass}`}>
          {format.toUpperCase()}
        </span>
      )}

      {/* Name */}
      <span className="text-sm font-medium text-text-primary flex-1 truncate mx-3">{name}</span>

      {/* Status badge */}
      {status && (
        <StatusBadge status={getStatusType(status)} className="mr-2 flex-shrink-0">
          {status}
        </StatusBadge>
      )}

      {/* Delete icon (visible on hover) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${name}`}
          className="
            opacity-0 group-hover:opacity-100
            w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0
            text-text-muted hover:text-danger hover:bg-danger-muted
            transition-all duration-150 cursor-pointer
            focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

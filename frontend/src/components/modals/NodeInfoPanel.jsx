import { useEffect, useCallback } from 'react';

const STATUS_STYLES = {
  completed: { dot: 'bg-brand', text: 'text-brand', label: 'Completed' },
  'in-progress': { dot: 'bg-warning', text: 'text-warning', label: 'In Progress' },
  locked: { dot: 'bg-text-disabled', text: 'text-text-disabled', label: 'Locked' },
  available: { dot: 'bg-accent-blue', text: 'text-accent-blue', label: 'Available' },
};

/**
 * NodeInfoPanel — A slide-in panel from the right edge for displaying
 * node details such as description, prerequisites, and status.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the panel is visible.
 * @param {() => void} props.onClose - Called when the panel should close.
 * @param {string} props.title - Panel title.
 * @param {string} [props.description] - Node description text.
 * @param {string[]} [props.prerequisites] - List of prerequisite names.
 * @param {string} [props.status] - Current status (completed, in-progress, locked, available).
 * @param {string} [props.className]
 */
export default function NodeInfoPanel({
  open,
  onClose,
  title,
  description,
  prerequisites = [],
  status,
  className = '',
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.available;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-surface border-l border-border shadow-modal z-50 animate-slide-in-right flex flex-col ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-panel-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2
            id="node-panel-title"
            className="text-base font-semibold text-text-primary truncate pr-2"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-lg leading-none cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm p-1 shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Status Badge */}
          {status && (
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-block w-2 h-2 rounded-full ${statusConfig.dot}`}
              />
              <span className={`text-sm font-medium ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Prerequisites
              </h3>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="bg-surface-elevated text-text-muted text-xs rounded-full px-2 py-1"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useEffect, useCallback } from 'react';

/**
 * SourceModal — A wider modal for displaying source content blocks with metadata.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible.
 * @param {() => void} props.onClose - Called when the modal should close.
 * @param {string} props.title - Modal title.
 * @param {{ content: string, metadata?: string }[]} props.sources - Array of source objects.
 * @param {string} [props.className]
 */
export default function SourceModal({
  open,
  onClose,
  title,
  sources = [],
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

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-surface border border-border rounded-lg max-w-2xl w-full mx-4 shadow-modal animate-fade-in max-h-[80vh] flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <h2
            id="source-modal-title"
            className="text-lg font-semibold text-text-primary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-lg leading-none cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {sources.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              No sources available.
            </p>
          )}

          {sources.map((source, index) => (
            <div
              key={index}
              className="bg-surface-sidebar rounded-md p-4 border-l-3 border-brand mb-3 last:mb-0"
            >
              <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap m-0">
                {source.content}
              </pre>
              {source.metadata && (
                <p className="text-xs text-text-muted mt-2 mb-0">
                  {typeof source.metadata === 'string'
                    ? source.metadata
                    : JSON.stringify(source.metadata)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

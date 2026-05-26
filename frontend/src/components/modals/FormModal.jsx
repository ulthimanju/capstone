import { useEffect, useCallback } from 'react';

/**
 * FormModal — A modal that wraps its children in a form with submit/cancel actions.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible.
 * @param {() => void} props.onClose - Called when the modal should close.
 * @param {string} props.title - Modal title.
 * @param {React.ReactNode} props.children - Form fields rendered inside the modal body.
 * @param {(e: React.FormEvent) => void} props.onSubmit - Form submit handler.
 * @param {string} [props.submitLabel='Submit'] - Label for the submit button.
 * @param {string} [props.className]
 */
export default function FormModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Submit',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-surface border border-border rounded-lg max-w-md w-full mx-4 shadow-modal animate-fade-in ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 pb-0">
            <h2
              id="form-modal-title"
              className="text-lg font-semibold text-text-primary"
            >
              {title}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          <div className="p-6 pt-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary rounded-md cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-brand hover:bg-brand-hover text-bg rounded-md cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

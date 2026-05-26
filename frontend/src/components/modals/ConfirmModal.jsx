import { useEffect, useCallback } from 'react';

const VARIANT_STYLES = {
  danger:
    'bg-danger hover:bg-danger/90 text-text-primary',
  primary:
    'bg-brand hover:bg-brand-hover text-bg',
};

/**
 * ConfirmModal — A confirmation dialog with cancel/confirm actions.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible.
 * @param {() => void} props.onClose - Called when the modal should close.
 * @param {() => void} props.onConfirm - Called when the user confirms.
 * @param {string} props.title - Modal title.
 * @param {string} props.message - Modal body message.
 * @param {string} [props.confirmLabel='Confirm'] - Label for the confirm button.
 * @param {'danger'|'primary'} [props.confirmVariant='danger'] - Visual variant for the confirm button.
 * @param {string} [props.className]
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
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
        className={`bg-surface border border-border rounded-lg max-w-md w-full mx-4 shadow-modal animate-fade-in ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-0">
          <h2
            id="confirm-modal-title"
            className="text-lg font-semibold text-text-primary"
          >
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-text-muted">{message}</p>
        </div>

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
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${VARIANT_STYLES[confirmVariant] || VARIANT_STYLES.danger}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

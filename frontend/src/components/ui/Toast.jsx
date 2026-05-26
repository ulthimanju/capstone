import { useEffect, useState } from 'react';

/**
 * Toast — Fixed bottom-right notification with auto-dismiss progress bar.
 *
 * @param {{
 *   message: string,
 *   variant?: 'success'|'warning'|'error'|'info',
 *   duration?: number,
 *   onClose?: () => void,
 *   visible?: boolean
 * }} props
 */

const variantAccent = {
  success: 'border-l-brand',
  warning: 'border-l-warning',
  error:   'border-l-danger',
  info:    'border-l-accent-blue',
};

const variantIcon = {
  success: (
    <svg className="w-5 h-5 text-brand shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-warning shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-danger shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-accent-blue shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

const progressBarColor = {
  success: 'bg-brand',
  warning: 'bg-warning',
  error:   'bg-danger',
  info:    'bg-accent-blue',
};

export default function Toast({
  message,
  variant = 'info',
  duration = 4000,
  onClose,
  visible = true,
}) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      setShow(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full bg-surface border border-border rounded-md shadow-modal overflow-hidden animate-slide-in-right border-l-3 ${variantAccent[variant] ?? variantAccent.info}`}
    >
      <div className="p-4 flex items-start gap-3">
        {variantIcon[variant]}

        <p className="text-sm text-text-primary flex-1">{message}</p>

        <button
          type="button"
          onClick={() => {
            setShow(false);
            onClose?.();
          }}
          className="shrink-0 text-text-muted hover:text-text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-0.5 w-full bg-surface-elevated">
        <div
          className={`h-full ${progressBarColor[variant] ?? progressBarColor.info} animate-shrink-width`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}

/**
 * ErrorState — Centered error view with an exclamation triangle icon and optional retry.
 *
 * @param {{
 *   title?: string,
 *   message?: string,
 *   onRetry?: () => void,
 *   className?: string
 * }} props
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {/* Red exclamation triangle icon */}
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-danger"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <h3 className="text-base font-medium text-text-primary mt-4">{title}</h3>

      {message && (
        <p className="text-sm text-text-muted mt-1 max-w-xs text-center">{message}</p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-primary bg-transparent hover:bg-surface-elevated hover:border-border-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Retry
        </button>
      )}
    </div>
  );
}

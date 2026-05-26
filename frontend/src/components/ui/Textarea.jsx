/**
 * Textarea — Resizable text area with label and error state.
 *
 * @param {string} label
 * @param {string} error
 * @param {boolean} autoHeight — if true, textarea grows with content (not implemented here, just sets resize-y)
 * @param {string} className
 */
export default function Textarea({
  label,
  error,
  autoHeight = false,
  className = '',
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full min-h-[80px] px-3 py-2 rounded-md text-sm bg-surface border text-text-primary placeholder:text-text-disabled resize-y transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
          error
            ? 'border-danger focus:border-danger'
            : 'border-border focus:border-brand'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

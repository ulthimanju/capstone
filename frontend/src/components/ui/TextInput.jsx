/**
 * TextInput — Labelled text input with error state.
 *
 * @param {string} label
 * @param {string} error
 * @param {string} className
 */
export default function TextInput({
  label,
  error,
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
      <input
        className={`w-full h-9 px-3 rounded-md text-sm bg-surface border text-text-primary placeholder:text-text-disabled transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
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

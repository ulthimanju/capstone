/**
 * TextInput — Labelled text input with error state and optional icon.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.icon] – Optional icon rendered inside the input on the left
 * @param {string} [props.className]
 */
export default function TextInput({
  label,
  error,
  icon,
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
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          className={`w-full h-9 pr-3 rounded-md text-sm bg-surface border text-text-primary placeholder:text-text-disabled transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
            icon ? 'pl-9' : 'px-3'
          } ${
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-brand'
          }`}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

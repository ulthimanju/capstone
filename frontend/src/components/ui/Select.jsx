/**
 * Select — Custom styled select dropdown.
 *
 * @param {string} label
 * @param {{ value: string, label: string }[]} options
 * @param {string} error
 * @param {string} className
 */
export default function Select({
  label,
  options = [],
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
      <div className="relative">
        <select
          className={`w-full h-9 px-3 pr-9 rounded-md text-sm bg-surface border text-text-primary appearance-none cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-brand'
          }`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

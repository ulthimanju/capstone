/**
 * URLInput — Text input with a globe/link icon on the left.
 *
 * @param {string} label
 * @param {string} error
 * @param {string} className
 */
export default function URLInput({
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
      <div className="relative">
        {/* Globe icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.5 0a6.5 6.5 0 01-5.04 6.33A9.956 9.956 0 0013.5 10c0-2.39-.84-4.58-2.04-6.33A6.5 6.5 0 0116.5 10zM10 16.5c1.83-1.71 3-4.09 3-6.5s-1.17-4.79-3-6.5C8.17 5.21 7 7.59 7 10s1.17 4.79 3 6.5zM8.54 3.67A9.956 9.956 0 006.5 10c0 2.39.84 4.58 2.04 6.33A6.5 6.5 0 013.5 10a6.5 6.5 0 015.04-6.33z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="url"
          className={`w-full h-9 pl-9 pr-3 rounded-md text-sm bg-surface border text-text-primary placeholder:text-text-disabled transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
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

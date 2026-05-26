/**
 * UploadButton — Dashed outline button with upload icon.
 *
 * @param {React.ReactNode} children
 * @param {Function} onClick
 * @param {string} className
 */
export default function UploadButton({
  children = 'Upload file',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-border px-4 h-9 text-sm font-medium text-text-muted cursor-pointer transition-colors duration-150 ease-in-out hover:text-text-primary hover:border-brand focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none ${className}`}
      {...rest}
    >
      {/* Arrow-up-tray icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.75.75v6.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V3.75A.75.75 0 0110 3z"
          clipRule="evenodd"
          transform="rotate(180 10 10)"
        />
        <path
          fillRule="evenodd"
          d="M3 17a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 17z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </button>
  );
}

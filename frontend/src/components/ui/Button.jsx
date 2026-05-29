/**
 * Button — Multi-variant button component.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading  — replaces children with a spinner
 * @param {boolean} disabled
 * @param {React.ReactNode} children
 * @param {string} className
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center font-medium text-sm rounded-md cursor-pointer transition-colors duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-brand text-bg hover:bg-brand-hover',
    secondary:
      'bg-surface border border-border text-text-primary hover:bg-surface-elevated',
    danger: 'bg-danger text-white hover:bg-red-600',
    ghost: 'bg-transparent border-none text-text-muted hover:text-text-primary hover:bg-transparent',
    outline:
      'bg-transparent border border-border text-text-primary hover:border-brand',
  };

  const sizes = {
    sm: 'h-8 px-3',
    md: 'h-9 px-4',
    lg: 'h-10 px-5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

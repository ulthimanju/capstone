/**
 * IconButton — Square icon-only button.
 *
 * @param {React.ReactNode} icon
 * @param {'sm'|'md'} size
 * @param {'ghost'|'outline'} variant
 * @param {string} className
 */
export default function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center rounded-md cursor-pointer text-text-muted hover:text-text-primary transition-colors duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

  const sizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
  };

  const variants = {
    ghost: 'bg-transparent hover:bg-surface',
    outline: 'bg-transparent border border-border hover:bg-surface',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}

/**
 * Breadcrumb — Horizontal breadcrumb trail with '>' separators.
 *
 * @param {Object} props
 * @param {{ label: string, href?: string }[]} props.items - Breadcrumb items.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-text-disabled select-none" aria-hidden="true">
                &gt;
              </span>
            )}

            {isLast ? (
              <span className="text-text-primary font-medium" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="text-text-muted hover:text-text-primary transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                className="text-text-muted hover:text-text-primary transition-colors duration-150 bg-transparent border-none cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

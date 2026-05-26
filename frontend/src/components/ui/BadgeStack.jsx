/**
 * BadgeStack — A stacked, overlapping group of circular badges or avatars.
 *
 * Commonly used to display earned achievements, participant avatars, or contributors
 * in a compact, layered presentation.
 *
 * @param {object} props
 * @param {Array<{ id: string|number, label: string, icon?: string, image?: string }>} props.items – List of badges to display
 * @param {number} [props.max=3] – Maximum number of visible items before stacking the rest into an "+X" pill
 * @param {'sm'|'md'|'lg'} [props.size='md'] – Size of the circular badges
 * @param {string} [props.className] – Additional CSS classes on the container
 */
export default function BadgeStack({
  items = [],
  max = 3,
  size = 'md',
  className = '',
}) {
  const visibleItems = items.slice(0, max);
  const overflowCount = items.length - max;

  // Size styling maps
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px] border',
    md: 'w-8 h-8 text-xs border-2',
    lg: 'w-10 h-10 text-sm border-2',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`inline-flex items-center -space-x-2 ${className}`}>
      {visibleItems.map((item, index) => (
        <div
          key={item.id ?? index}
          className={`
            relative rounded-full border-bg bg-surface flex items-center justify-center
            shadow-card hover:z-30 transition-all duration-150 group cursor-pointer
            ${currentSizeClass}
          `}
          title={item.label}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.label}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{item.icon ?? '🏆'}</span>
          )}

          {/* Simple Tooltip on Hover */}
          <span className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded
            bg-surface-elevated border border-border text-[10px] font-medium text-text-primary
            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150
            whitespace-nowrap shadow-tooltip z-40
          ">
            {item.label}
          </span>
        </div>
      ))}

      {overflowCount > 0 && (
        <div
          className={`
            rounded-full border-bg bg-surface-elevated text-text-muted font-semibold
            flex items-center justify-center shadow-card cursor-help select-none z-10
            ${currentSizeClass}
          `}
          title={`${overflowCount} more achievements`}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}

/**
 * StatusToggle — Segmented pill control for problem status.
 *
 * @param {'UNSOLVED'|'ATTEMPTED'|'SOLVED'} value
 * @param {Function} onChange — called with the new status string
 * @param {string} className
 */
export default function StatusToggle({
  value = 'UNSOLVED',
  onChange,
  className = '',
}) {
  const options = [
    {
      key: 'UNSOLVED',
      label: 'Unsolved',
      active: 'bg-surface-elevated text-text-muted',
      inactive: 'text-text-disabled',
    },
    {
      key: 'ATTEMPTED',
      label: 'Attempted',
      active: 'bg-warning/20 text-warning',
      inactive: 'text-text-disabled',
    },
    {
      key: 'SOLVED',
      label: 'Solved',
      active: 'bg-brand/20 text-brand',
      inactive: 'text-text-disabled',
    },
  ];

  return (
    <div
      className={`inline-flex items-center bg-surface border border-border rounded-full p-0.5 ${className}`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange?.(opt.key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none ${
              isActive ? opt.active : opt.inactive
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

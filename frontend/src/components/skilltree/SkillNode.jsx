/**
 * SkillNode — A single node in the skill tree.
 *
 * Renders three visual states:
 * - **locked**: dashed border, lock icon, dimmed label
 * - **in-progress**: brand-muted background with a circular SVG progress ring
 * - **unlocked**: solid brand background with a checkmark
 *
 * @param {object}  props
 * @param {string}  props.label      – Display name shown beneath the node
 * @param {'locked'|'in-progress'|'unlocked'} props.status – Current node state
 * @param {number}  [props.progress] – 0-100 progress value (in-progress only)
 * @param {React.ReactNode} [props.icon] – Optional icon rendered inside the node
 * @param {() => void} [props.onClick] – Click handler
 * @param {string}  [props.className] – Additional CSS classes
 */
export default function SkillNode({
  label,
  status = 'locked',
  progress = 0,
  icon,
  onClick,
  className = '',
}) {
  const isLocked = status === 'locked';
  const isInProgress = status === 'in-progress';
  const isUnlocked = status === 'unlocked';

  /* ── Progress ring geometry ── */
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  /* ── Container classes per state ── */
  const containerClasses = [
    'w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
    isLocked && 'bg-surface-sidebar border border-dashed border-border',
    isInProgress && 'bg-brand-muted border border-brand',
    isUnlocked && 'bg-brand',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /* ── Label classes per state ── */
  const labelClasses = [
    'text-xs mt-1 truncate max-w-[80px] text-center',
    isLocked ? 'text-text-disabled' : 'text-text-primary',
  ].join(' ');

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        className={containerClasses}
        aria-label={label}
      >
        {/* Locked state — lock icon */}
        {isLocked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-text-disabled"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        )}

        {/* In-progress state — circular progress ring */}
        {isInProgress && (
          <div className="relative flex items-center justify-center">
            <svg width="48" height="48" className="-rotate-90">
              {/* Track */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-border"
                strokeWidth={3}
              />
              {/* Progress arc */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-brand transition-all duration-500"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            {/* Icon overlay */}
            {icon && (
              <span className="absolute text-sm">{icon}</span>
            )}
          </div>
        )}

        {/* Unlocked state — checkmark */}
        {isUnlocked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-bg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={labelClasses}>{label}</span>
    </div>
  );
}

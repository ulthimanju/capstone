/**
 * BadgeIcon — Achievement/award badge container.
 * Shows earned state (full color + shadow) or locked state (grayscale + lock overlay).
 *
 * @param {{ icon: React.ReactNode, label: string, earned?: boolean, className?: string }} props
 */
export default function BadgeIcon({ icon, label, earned = false, className = '' }) {
  return (
    <div
      className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center relative ${
        earned
          ? 'bg-surface border border-border shadow-card'
          : 'bg-surface grayscale opacity-40'
      } ${className}`}
      title={label}
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>

      {!earned && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      <span className="sr-only">{label}{earned ? '' : ' (Locked)'}</span>
    </div>
  );
}

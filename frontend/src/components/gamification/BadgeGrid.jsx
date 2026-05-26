/**
 * BadgeGrid — Displays a collection of achievement badges.
 *
 * Earned badges render at full colour; locked badges are greyed-out
 * with a small lock overlay.
 *
 * @param {object} props
 * @param {Array<{ icon: string, label: string, earned: boolean }>} props.badges
 * @param {string} [props.className]
 */
export default function BadgeGrid({ badges = [], className = '' }) {
  return (
    <div className={`grid grid-cols-4 sm:grid-cols-6 gap-3 ${className}`}>
      {badges.map((badge, i) => (
        <div
          key={`${badge.label}-${i}`}
          className={`relative bg-surface border border-border rounded-xl p-3 text-center ${
            badge.earned ? '' : 'grayscale opacity-40'
          }`}
        >
          {/* Badge icon */}
          <span className="text-2xl block">{badge.icon}</span>

          {/* Label */}
          <span className="text-xs text-text-muted mt-1 block truncate">
            {badge.label}
          </span>

          {/* Lock overlay for unearned badges */}
          {!badge.earned && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-text-disabled"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

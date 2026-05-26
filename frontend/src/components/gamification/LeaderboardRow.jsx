/**
 * LeaderboardRow — A single row in the XP leaderboard.
 *
 * Highlights the current user's row and applies medal colours
 * (gold, silver, bronze) to the top three ranks.
 *
 * @param {object}  props
 * @param {number}  props.rank          – Numerical rank
 * @param {string}  props.name          – Display name
 * @param {number}  props.xp            – Experience points
 * @param {string}  [props.avatar]      – Avatar URL or initial
 * @param {boolean} [props.isCurrentUser] – Highlight row for current user
 * @param {string}  [props.className]
 */
export default function LeaderboardRow({
  rank,
  name,
  xp,
  avatar,
  isCurrentUser = false,
  className = '',
}) {
  /* ── Rank colour ── */
  const rankColorClass =
    rank === 1
      ? 'text-gold'
      : rank === 2
        ? 'text-silver'
        : rank === 3
          ? 'text-bronze'
          : 'text-text-muted';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-150 ${
        isCurrentUser ? 'bg-brand-muted' : 'hover:bg-surface'
      } ${className}`}
    >
      {/* Rank */}
      <span className={`w-8 text-center font-bold text-sm ${rankColorClass}`}>
        {rank}
      </span>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center overflow-hidden shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-text-muted font-medium">
            {name?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-text-primary flex-1 truncate">
        {name}
      </span>

      {/* XP */}
      <span className="text-sm font-mono text-brand">{xp?.toLocaleString()} XP</span>
    </div>
  );
}

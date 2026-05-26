/**
 * ChallengeCard — Displays a learning challenge with status accent.
 *
 * Left-border colour indicates status:
 * - **PENDING**: warning (orange)
 * - **ACTIVE**: brand (green) + pulsing dot
 * - **COMPLETED**: border (grey)
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {'PENDING'|'ACTIVE'|'COMPLETED'} props.status
 * @param {string} [props.deadline]  – Human-readable deadline
 * @param {string|number} [props.reward] – XP reward value
 * @param {string} [props.className]
 */
export default function ChallengeCard({
  title,
  description,
  status = 'PENDING',
  deadline,
  reward,
  className = '',
}) {
  /* ── Left-border accent per status ── */
  const borderAccent =
    status === 'PENDING'
      ? 'border-l-3 border-l-warning'
      : status === 'ACTIVE'
        ? 'border-l-3 border-l-brand'
        : 'border-l-3 border-l-border';

  /* ── Status label text ── */
  const statusLabel =
    status === 'PENDING'
      ? 'Pending'
      : status === 'ACTIVE'
        ? 'Active'
        : 'Completed';

  const statusColor =
    status === 'PENDING'
      ? 'text-warning'
      : status === 'ACTIVE'
        ? 'text-brand'
        : 'text-text-muted';

  return (
    <div
      className={`bg-surface border border-border rounded-md p-4 ${borderAccent} ${className}`}
    >
      {/* Status tag */}
      <div className={`flex items-center gap-1.5 text-xs font-medium ${statusColor} mb-1`}>
        {status === 'ACTIVE' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
        )}
        {statusLabel}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-muted mt-1">{description}</p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-3">
        {deadline ? (
          <span className="text-xs text-text-muted">{deadline}</span>
        ) : (
          <span />
        )}

        {reward != null && (
          <span className="bg-brand/10 text-brand text-xs rounded-full px-2 py-0.5 font-medium">
            +{reward} XP
          </span>
        )}
      </div>
    </div>
  );
}

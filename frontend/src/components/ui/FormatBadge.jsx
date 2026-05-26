/**
 * FormatBadge — Neutral dark pill showing a file format in monospace.
 *
 * @param {{ format: string, className?: string }} props
 */
export default function FormatBadge({ format, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold font-mono bg-surface-elevated text-text-muted ${className}`}
    >
      {format}
    </span>
  );
}

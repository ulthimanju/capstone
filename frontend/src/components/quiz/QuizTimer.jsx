/**
 * QuizTimer — Displays remaining time in MM:SS format with color-coded urgency.
 *
 * @param {Object} props
 * @param {number} props.seconds - Remaining seconds.
 * @param {string} [props.className]
 */
export default function QuizTimer({ seconds, className = '' }) {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  let colorClass = 'text-text-primary';
  let animClass = '';

  if (seconds < 10) {
    colorClass = 'text-danger';
    animClass = 'animate-pulse-brand';
  } else if (seconds <= 30) {
    colorClass = 'text-warning';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-lg font-bold ${colorClass} ${animClass} ${className}`}
    >
      {/* Clock icon */}
      <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{formatted}</span>
    </div>
  );
}

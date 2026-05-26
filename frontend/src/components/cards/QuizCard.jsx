/**
 * QuizCard — Quiz summary card with score display and hover-reveal start button.
 *
 * @param {Object} props
 * @param {string} props.title - Quiz title.
 * @param {number} [props.questionCount] - Number of questions.
 * @param {number|null} [props.score] - Score percentage (0-100) or null if not attempted.
 * @param {() => void} [props.onStart] - Start quiz callback.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function QuizCard({ title, questionCount, score = null, onStart, className = '' }) {
  /** Determine score color based on thresholds */
  const getScoreStyle = () => {
    if (score === null || score === undefined) return { text: 'Not attempted', color: 'text-text-disabled' };
    if (score >= 70) return { text: `${score}%`, color: 'text-brand' };
    if (score >= 50) return { text: `${score}%`, color: 'text-warning' };
    return { text: `${score}%`, color: 'text-danger' };
  };

  const scoreStyle = getScoreStyle();

  return (
    <div className={`group bg-surface border border-border rounded-md p-4 flex flex-col ${className}`}>
      {/* Title */}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>

      {/* Question count */}
      {questionCount !== undefined && (
        <span className="text-xs text-text-muted mt-1">
          {questionCount} question{questionCount !== 1 ? 's' : ''}
        </span>
      )}

      {/* Score display */}
      <div className="mt-3">
        <span className={`text-sm font-medium ${scoreStyle.color}`}>
          {scoreStyle.text}
        </span>
      </div>

      {/* Start button (hover-reveal) */}
      {onStart && (
        <div className="flex justify-end mt-auto pt-3">
          <button
            type="button"
            onClick={onStart}
            className="
              opacity-0 group-hover:opacity-100
              px-3 py-1.5 rounded-md text-xs font-medium
              bg-brand text-bg hover:bg-brand-hover
              transition-all duration-150 cursor-pointer
              focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2
            "
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
}

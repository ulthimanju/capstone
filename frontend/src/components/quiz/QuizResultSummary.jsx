/**
 * QuizResultSummary — Displays quiz results with an SVG donut chart,
 * score stats, and wrong topic pills.
 *
 * @param {Object} props
 * @param {number} props.score - Score percentage (0–100).
 * @param {number} props.totalQuestions - Total number of questions.
 * @param {number} props.correctCount - Number of correct answers.
 * @param {string[]} [props.wrongTopics] - Topics answered incorrectly.
 * @param {string} [props.className]
 */
export default function QuizResultSummary({
  score,
  totalQuestions,
  correctCount,
  wrongTopics = [],
  className = '',
}) {
  // SVG donut configuration
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const dashOffset = circumference - (progress / 100) * circumference;

  // Color based on score
  let strokeColor = 'var(--color-danger)';
  if (score >= 70) strokeColor = 'var(--color-brand)';
  else if (score >= 50) strokeColor = 'var(--color-warning)';

  let textColorClass = 'text-danger';
  if (score >= 70) textColorClass = 'text-brand';
  else if (score >= 50) textColorClass = 'text-warning';

  return (
    <div className={`text-center p-8 ${className}`}>
      {/* Donut ring */}
      <div className="inline-flex items-center justify-center relative w-32 h-32 mb-4">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center score */}
        <span
          className={`absolute text-2xl font-bold font-mono ${textColorClass}`}
        >
          {score}%
        </span>
      </div>

      {/* Stats line */}
      <p className="text-sm text-text-muted mb-4">
        {correctCount}/{totalQuestions} correct
      </p>

      {/* Wrong topics */}
      {wrongTopics.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {wrongTopics.map((topic, index) => (
            <span
              key={index}
              className="bg-danger-muted text-danger text-xs rounded-full px-2 py-1 inline-flex"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * QuizProgressBar — A horizontal row of dots/squares indicating quiz progress.
 *
 * @param {Object} props
 * @param {number} props.total - Total number of questions.
 * @param {number} props.current - Current question index (0-indexed).
 * @param {number[]} props.answered - Array of answered question indices.
 * @param {string} [props.className]
 */
export default function QuizProgressBar({
  total,
  current,
  answered = [],
  className = '',
}) {
  const answeredSet = new Set(answered);

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: total }, (_, i) => {
        let dotClass = 'bg-border'; // unanswered

        if (i === current) {
          dotClass = 'bg-brand animate-pulse-brand';
        } else if (answeredSet.has(i)) {
          dotClass = 'bg-brand';
        }

        return (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm transition-colors duration-150 ${dotClass}`}
          />
        );
      })}
    </div>
  );
}

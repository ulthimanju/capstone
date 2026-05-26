/**
 * WeakSpotCard — Highlights a weak topic with accuracy and suggestions.
 * Uses a warmer dark surface and danger-tinted left border.
 *
 * @param {Object} props
 * @param {string} props.topic - The weak topic name.
 * @param {number} props.accuracy - Accuracy percentage (0-100).
 * @param {string[]} [props.suggestions] - List of improvement suggestions.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function WeakSpotCard({ topic, accuracy, suggestions = [], className = '' }) {
  return (
    <div
      className={`
        bg-surface-warm border border-border border-l-3 border-l-danger
        rounded-md p-4
        ${className}
      `}
    >
      {/* Topic */}
      <h3 className="text-base font-semibold text-text-primary">{topic}</h3>

      {/* Accuracy */}
      <span className="text-danger text-sm font-mono mt-1 inline-block">
        {accuracy}% accuracy
      </span>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-1">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-xs text-text-muted flex items-start gap-1.5">
              <span className="text-text-disabled mt-0.5 flex-shrink-0">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

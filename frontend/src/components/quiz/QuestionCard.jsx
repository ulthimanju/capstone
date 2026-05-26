/**
 * QuestionCard — Displays a single quiz question with its number.
 *
 * @param {Object} props
 * @param {number} props.questionNumber - Current question number (1-indexed).
 * @param {number} props.totalQuestions - Total number of questions.
 * @param {string} props.question - The question text.
 * @param {string} [props.className]
 */
export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  className = '',
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-md p-6 ${className}`}
    >
      <span className="bg-surface-elevated text-text-muted text-xs rounded-full px-2 py-0.5 mb-3 inline-block">
        Q{questionNumber}/{totalQuestions}
      </span>
      <p className="text-base font-medium text-text-primary leading-relaxed m-0">
        {question}
      </p>
    </div>
  );
}

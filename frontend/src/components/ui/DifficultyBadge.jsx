/**
 * DifficultyBadge — Shows a question/quiz difficulty level as a color-coded pill.
 *
 * @param {{ difficulty: 'EASY'|'MEDIUM'|'HARD', className?: string }} props
 */

const difficultyConfig = {
  EASY:   { classes: 'bg-success-muted text-brand',   label: 'Easy' },
  MEDIUM: { classes: 'bg-warning-muted text-warning',  label: 'Medium' },
  HARD:   { classes: 'bg-danger-muted text-danger',    label: 'Hard' },
};

export default function DifficultyBadge({ difficulty, className = '' }) {
  const config = difficultyConfig[difficulty] ?? difficultyConfig.EASY;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}

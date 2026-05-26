const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * OptionButton — A quiz answer option with selection and correctness states.
 *
 * @param {Object} props
 * @param {string} props.label - The option text.
 * @param {number} props.index - Option index (0–3).
 * @param {boolean} props.selected - Whether this option is currently selected.
 * @param {boolean|null} [props.correct=null] - After submission: true=correct, false=wrong, null=not submitted yet.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {() => void} props.onClick - Click handler.
 * @param {string} [props.className]
 */
export default function OptionButton({
  label,
  index,
  selected,
  correct = null,
  disabled = false,
  onClick,
  className = '',
}) {
  const letter = OPTION_LETTERS[index] || String(index + 1);

  // Determine visual state
  let stateClasses = 'bg-transparent border-border';
  let hoverClasses = 'hover:bg-surface-elevated';
  let animationClass = '';
  let icon = null;

  if (correct === true) {
    stateClasses = 'bg-success-muted border-success text-success';
    hoverClasses = '';
    icon = (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
      </svg>
    );
  } else if (correct === false) {
    stateClasses = 'bg-danger-muted border-danger text-danger';
    hoverClasses = '';
    animationClass = 'animate-shake';
    icon = (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
      </svg>
    );
  } else if (selected) {
    stateClasses = 'bg-brand-muted border-brand';
  }

  if (disabled) {
    hoverClasses = '';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full border rounded-md px-4 py-3 text-sm text-left flex items-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${stateClasses} ${hoverClasses} ${animationClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="text-text-muted mr-3 font-mono shrink-0">
        {letter}.
      </span>
      <span className="flex-1">{label}</span>
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
}

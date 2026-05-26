/**
 * RatingButton — Spaced-repetition difficulty selector.
 *
 * @param {'again'|'hard'|'good'|'easy'} rating
 * @param {boolean} selected
 * @param {Function} onClick
 * @param {string} className
 */
export default function RatingButton({
  rating,
  selected = false,
  onClick,
  className = '',
}) {
  const labels = {
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
  };

  const styles = {
    again: {
      base: 'border-danger/50 text-danger',
      hover: 'hover:bg-danger/10',
      selected: 'bg-danger/20 border-danger text-danger',
    },
    hard: {
      base: 'border-warning/50 text-warning',
      hover: 'hover:bg-warning/10',
      selected: 'bg-warning/20 border-warning text-warning',
    },
    good: {
      base: 'border-brand/50 text-brand',
      hover: 'hover:bg-brand/10',
      selected: 'bg-brand/20 border-brand text-brand',
    },
    easy: {
      base: 'border-brand text-brand-hover',
      hover: 'hover:bg-brand/20',
      selected: 'bg-brand/30 border-brand-hover text-brand-hover',
    },
  };

  const s = styles[rating];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border cursor-pointer transition-colors duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none ${
        selected ? s.selected : `${s.base} ${s.hover}`
      } ${className}`}
    >
      {labels[rating]}
    </button>
  );
}

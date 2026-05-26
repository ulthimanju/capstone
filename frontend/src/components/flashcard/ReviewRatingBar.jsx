const RATINGS = [
  {
    value: 1,
    label: 'Again',
    classes: 'border-danger/40 text-danger hover:bg-danger/10',
  },
  {
    value: 2,
    label: 'Hard',
    classes: 'border-warning/40 text-warning hover:bg-warning/10',
  },
  {
    value: 3,
    label: 'Good',
    classes: 'border-brand/40 text-brand hover:bg-brand/10',
  },
  {
    value: 4,
    label: 'Easy',
    classes: 'border-brand text-brand-hover hover:bg-brand/20',
  },
];

/**
 * ReviewRatingBar — A row of four spaced-repetition rating buttons.
 *
 * @param {Object} props
 * @param {(rating: number) => void} props.onRate - Called with the rating value (1–4).
 * @param {string} [props.className]
 */
export default function ReviewRatingBar({ onRate, className = '' }) {
  return (
    <div className={`w-full flex gap-2 ${className}`}>
      {RATINGS.map((rating) => (
        <button
          key={rating.value}
          type="button"
          onClick={() => onRate?.(rating.value)}
          className={`border rounded-md flex-1 py-2 text-sm font-medium cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${rating.classes}`}
        >
          {rating.label}
        </button>
      ))}
    </div>
  );
}

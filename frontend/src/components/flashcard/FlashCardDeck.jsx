/**
 * FlashCardDeck — Wraps a FlashCard with navigation controls and a progress bar.
 *
 * @param {Object} props
 * @param {number} props.currentIndex - Current card index (0-indexed).
 * @param {number} props.totalCards - Total number of cards.
 * @param {() => void} props.onNext - Navigate to next card.
 * @param {() => void} props.onPrev - Navigate to previous card.
 * @param {React.ReactNode} props.children - The FlashCard component.
 * @param {string} [props.className]
 */
export default function FlashCardDeck({
  currentIndex,
  totalCards,
  onNext,
  onPrev,
  children,
  className = '',
}) {
  const progressWidth =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className={className}>
      {/* Session header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-text-muted">
          {currentIndex + 1} / {totalCards} cards
        </span>

        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            type="button"
            onClick={onPrev}
            disabled={currentIndex <= 0}
            className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Previous card"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={onNext}
            disabled={currentIndex >= totalCards - 1}
            className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Next card"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {/* Card */}
      {children}
    </div>
  );
}

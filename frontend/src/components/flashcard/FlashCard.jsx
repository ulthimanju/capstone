/**
 * FlashCard — A 3D flip card showing question on the front and answer on the back.
 * Relies on utility classes defined in index.css: perspective-1000, preserve-3d,
 * backface-hidden, rotate-y-180.
 *
 * @param {Object} props
 * @param {string} props.question - Front-face question text.
 * @param {string} props.answer - Back-face answer text.
 * @param {boolean} props.flipped - Whether the card is currently flipped.
 * @param {() => void} props.onFlip - Called when the card is clicked.
 * @param {string} [props.className]
 */
export default function FlashCard({
  question,
  answer,
  flipped,
  onFlip,
  className = '',
}) {
  return (
    <div
      className={`perspective-1000 min-h-[200px] w-full cursor-pointer ${className}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip?.();
        }
      }}
      aria-label={flipped ? 'Showing answer, click to show question' : 'Showing question, click to show answer'}
    >
      <div
        className={`preserve-3d relative w-full min-h-[200px] transition-transform duration-400 ${flipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front face */}
        <div className="backface-hidden absolute inset-0 bg-surface border border-border rounded-md p-6 border-t-3 border-t-brand flex flex-col">
          <div className="flex-1">
            <p className="text-base font-medium text-text-primary leading-relaxed m-0">
              {question}
            </p>
          </div>
          <p className="text-xs text-text-disabled mt-4 mb-0">
            Click to flip
          </p>
        </div>

        {/* Back face */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 bg-surface-elevated border border-border rounded-md p-6 flex flex-col">
          <div className="flex-1">
            <p className="text-base text-text-primary leading-relaxed m-0">
              {answer}
            </p>
          </div>
          <p className="text-xs text-text-disabled mt-4 mb-0">
            Click to flip
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * NotebookCard — Clickable notebook card with hover effects and delete action.
 *
 * @param {Object} props
 * @param {string} props.title - Notebook title.
 * @param {string} [props.description] - Short description.
 * @param {string} [props.updatedAt] - Last updated timestamp string.
 * @param {() => void} [props.onDelete] - Delete callback.
 * @param {() => void} [props.onClick] - Click callback for the card.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function NotebookCard({ title, description, updatedAt, onDelete, onClick, className = '' }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className={`
        group relative bg-surface border border-border rounded-md p-4
        cursor-pointer flex flex-col
        transition-all duration-150
        hover:border-brand hover:shadow-[0_0_15px_rgba(62,207,142,0.08)]
        focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2
        ${className}
      `}
    >
      {/* Delete button (top-right, visible on hover) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete notebook"
          className="
            absolute top-3 right-3
            opacity-0 group-hover:opacity-100
            w-7 h-7 flex items-center justify-center rounded-md
            text-text-muted hover:text-danger hover:bg-danger-muted
            transition-all duration-150 cursor-pointer
            focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold text-text-primary truncate pr-8">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-muted line-clamp-2 mt-1">{description}</p>
      )}

      {/* Updated timestamp */}
      {updatedAt && (
        <span className="text-xs text-text-disabled mt-auto pt-3">{updatedAt}</span>
      )}
    </div>
  );
}

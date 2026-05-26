/**
 * CourseCard — Course display card with thumbnail, progress, and enrolled badge.
 *
 * @param {Object} props
 * @param {string} props.title - Course title.
 * @param {string} [props.thumbnail] - Thumbnail image URL.
 * @param {number} [props.progress=0] - Progress percentage (0-100).
 * @param {boolean} [props.enrolled=false] - Whether the user is enrolled.
 * @param {string} [props.instructor] - Instructor name.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function CourseCard({
  title,
  thumbnail,
  progress = 0,
  enrolled = false,
  instructor,
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`bg-surface border border-border rounded-md overflow-hidden ${className}`}>
      {/* Thumbnail */}
      <div className="aspect-video rounded-t-md overflow-hidden bg-surface-elevated">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-disabled">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title + enrolled badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          {enrolled && (
            <span className="inline-flex items-center bg-brand/10 text-brand text-xs rounded-full px-2 py-0.5 flex-shrink-0">
              Enrolled
            </span>
          )}
        </div>

        {/* Instructor */}
        {instructor && (
          <span className="text-xs text-text-muted">{instructor}</span>
        )}

        {/* Progress bar (inline) */}
        {enrolled && (
          <div className="mt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Progress</span>
              <span className="text-xs text-text-primary font-medium">{Math.round(clamped)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
                style={{ width: `${clamped}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

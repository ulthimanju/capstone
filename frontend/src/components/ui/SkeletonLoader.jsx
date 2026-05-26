/**
 * SkeletonLoader — Shimmer placeholder for loading states.
 *
 * @param {{
 *   variant?: 'text'|'card'|'avatar'|'button',
 *   lines?: number,
 *   className?: string
 * }} props
 */

const lineWidths = ['w-full', 'w-4/5', 'w-3/5'];

export default function SkeletonLoader({ variant = 'text', lines = 3, className = '' }) {
  if (variant === 'card') {
    return (
      <div
        className={`skeleton-shimmer rounded-md h-40 w-full ${className}`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={`skeleton-shimmer rounded-full w-10 h-10 ${className}`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  if (variant === 'button') {
    return (
      <div
        className={`skeleton-shimmer rounded-md h-9 w-24 ${className}`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  // Default: text variant
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer rounded-md h-4 ${lineWidths[i % lineWidths.length]}`}
        />
      ))}
    </div>
  );
}

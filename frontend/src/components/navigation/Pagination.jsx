/**
 * Pagination — Page navigation with ellipsis, prev/next arrows.
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed).
 * @param {number} props.totalPages - Total number of pages.
 * @param {(page: number) => void} props.onPageChange - Page change callback.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  /**
   * Build the list of page numbers to render, inserting 'ellipsis'
   * markers when totalPages > 7.
   */
  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis-start');
    }

    // Pages around the current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis-end');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const baseBtn =
    'w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2';

  return (
    <nav aria-label="Pagination" className={`flex items-center gap-1 ${className}`}>
      {/* Prev arrow */}
      <button
        type="button"
        onClick={() => !isFirstPage && onPageChange?.(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="Previous page"
        className={`${baseBtn} border border-border bg-transparent text-text-muted ${
          isFirstPage ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-elevated'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page buttons */}
      {pages.map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span
              key={page}
              className="w-9 h-9 flex items-center justify-center text-text-disabled text-sm select-none"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            aria-current={isActive ? 'page' : undefined}
            className={`${baseBtn} ${
              isActive
                ? 'bg-brand text-bg font-bold border border-brand'
                : 'bg-transparent text-text-muted border border-border hover:bg-surface-elevated'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next arrow */}
      <button
        type="button"
        onClick={() => !isLastPage && onPageChange?.(currentPage + 1)}
        disabled={isLastPage}
        aria-label="Next page"
        className={`${baseBtn} border border-border bg-transparent text-text-muted ${
          isLastPage ? 'opacity-40 cursor-not-allowed' : 'hover:bg-surface-elevated'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

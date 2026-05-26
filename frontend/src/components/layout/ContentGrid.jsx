/**
 * ContentGrid — Pure layout utility for responsive CSS grid.
 * No visual styling, just gap and responsive columns.
 */
export default function ContentGrid({ children, cols = 1, mdCols, lgCols, gap = 4, className = '' }) {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const mdMap = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  const lgMap = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  };

  const gapMap = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div
      className={`
        grid
        ${colsMap[cols] || 'grid-cols-1'}
        ${mdCols ? mdMap[mdCols] || '' : ''}
        ${lgCols ? lgMap[lgCols] || '' : ''}
        ${gapMap[gap] || 'gap-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

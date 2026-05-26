import DataTable from './DataTable';

const DIFFICULTY_STYLES = {
  easy: 'bg-success-muted text-success',
  medium: 'bg-warning-muted text-warning',
  hard: 'bg-danger-muted text-danger',
};

const STATUS_CYCLE = ['UNSOLVED', 'ATTEMPTED', 'SOLVED'];

const STATUS_DOT_STYLES = {
  UNSOLVED: 'bg-border',
  ATTEMPTED: 'bg-warning',
  SOLVED: 'bg-success',
};

/**
 * PracticeTable — Displays a list of practice problems with difficulty badges
 * and cyclable status indicators.
 *
 * @param {Object} props
 * @param {{ id: string|number, title: string, url: string, status: string, difficulty: string }[]} props.problems
 * @param {(id: string|number, newStatus: string) => void} [props.onStatusChange]
 * @param {string} [props.className]
 */
export default function PracticeTable({ problems = [], onStatusChange, className = '' }) {
  const cycleStatus = (problem) => {
    if (!onStatusChange) return;
    const currentIndex = STATUS_CYCLE.indexOf(problem.status);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    onStatusChange(problem.id, STATUS_CYCLE[nextIndex]);
  };

  const columns = [
    {
      key: '_index',
      label: '#',
      render: (_val, _row) => {
        const idx = problems.findIndex((p) => p.id === _row.id);
        return <span className="text-text-muted">{idx + 1}</span>;
      },
    },
    {
      key: 'title',
      label: 'Title',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (val) => {
        const style = DIFFICULTY_STYLES[val?.toLowerCase()] || DIFFICULTY_STYLES.easy;
        return (
          <span
            className={`inline-block text-xs font-medium rounded-full px-2 py-0.5 ${style}`}
          >
            {val}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => {
        const dotStyle = STATUS_DOT_STYLES[val] || STATUS_DOT_STYLES.UNSOLVED;
        return (
          <button
            type="button"
            onClick={() => cycleStatus(row)}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm px-1 py-0.5"
            title={`Status: ${val} — click to cycle`}
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full transition-colors duration-150 ${dotStyle}`}
            />
            <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors duration-150">
              {val}
            </span>
          </button>
        );
      },
    },
    {
      key: 'url',
      label: 'Link',
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
          >
            Open ↗
          </a>
        ) : (
          <span className="text-text-disabled text-sm">—</span>
        ),
    },
  ];

  return <DataTable columns={columns} data={problems} className={className} />;
}

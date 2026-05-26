import DataTable from './DataTable';

/**
 * Returns the Tailwind text color class for a given grade.
 * @param {number} grade
 * @returns {string}
 */
function gradeColor(grade) {
  if (grade >= 70) return 'text-brand';
  if (grade >= 50) return 'text-warning';
  return 'text-danger';
}

/**
 * SubmissionsTable — Displays student submissions with color-coded grades
 * and a view action button.
 *
 * @param {Object} props
 * @param {{ id: string|number, title: string, grade: number, submittedAt: string, status: string }[]} props.submissions
 * @param {(id: string|number) => void} [props.onView]
 * @param {string} [props.className]
 */
export default function SubmissionsTable({ submissions = [], onView, className = '' }) {
  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (val) => (
        <span className={`font-semibold font-mono ${gradeColor(val)}`}>
          {val}%
        </span>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (val) => (
        <span className="text-text-muted text-sm">
          {val ? new Date(val).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className="text-text-muted text-sm capitalize">{val}</span>
      ),
    },
    {
      key: '_actions',
      label: '',
      render: (_val, row) => (
        <button
          type="button"
          onClick={() => onView?.(row.id)}
          className="text-text-muted hover:text-text-primary text-sm cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm px-2 py-1"
        >
          View
        </button>
      ),
    },
  ];

  return <DataTable columns={columns} data={submissions} className={className} />;
}

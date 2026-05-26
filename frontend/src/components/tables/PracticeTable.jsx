import { useState } from 'react';
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
 * PracticeTable — Displays a list of practice problems with difficulty badges,
 * status indicator cycling, and status-based column filtering.
 *
 * @param {Object} props
 * @param {{ id: string|number, title: string, url: string, status: string, difficulty: string }[]} props.problems
 * @param {(id: string|number, newStatus: string) => void} [props.onStatusChange]
 * @param {string} [props.className]
 */
export default function PracticeTable({ problems = [], onStatusChange, className = '' }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

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

  // Combined Filter logic
  const filteredProblems = problems.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status?.toUpperCase() === statusFilter;
    const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty?.toUpperCase() === difficultyFilter;
    return matchesStatus && matchesDifficulty;
  });

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Filtering header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface/30 p-2 rounded-lg border border-border/50">
        <span className="text-xs text-text-muted">
          Showing <span className="font-semibold text-text-primary">{filteredProblems.length}</span> of <span className="font-semibold">{problems.length}</span> problems
        </span>
        <div className="flex flex-wrap items-center gap-4 self-end md:self-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mr-1">Status:</span>
            <div className="flex items-center gap-0.5 bg-surface border border-border rounded-md p-0.5">
              {['ALL', ...STATUS_CYCLE].map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`
                      px-2 py-0.5 text-[9px] font-bold rounded-sm cursor-pointer
                      transition-all duration-150 uppercase tracking-wider
                      ${
                        isActive
                          ? 'bg-brand text-bg shadow-sm font-extrabold'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
                      }
                    `}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mr-1">Difficulty:</span>
            <div className="flex items-center gap-0.5 bg-surface border border-border rounded-md p-0.5">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => {
                const isActive = difficultyFilter === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className={`
                      px-2 py-0.5 text-[9px] font-bold rounded-sm cursor-pointer
                      transition-all duration-150 uppercase tracking-wider
                      ${
                        isActive
                          ? 'bg-brand text-bg shadow-sm font-extrabold'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/40'
                      }
                    `}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredProblems} />
    </div>
  );
}

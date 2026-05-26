/**
 * DataTable — A generic data table with configurable columns.
 *
 * @param {Object} props
 * @param {{ key: string, label: string, render?: (value: any, row: Object) => React.ReactNode }[]} props.columns - Column definitions.
 * @param {Object[]} props.data - Array of row objects.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function DataTable({ columns = [], data = [], className = '' }) {
  return (
    <div
      className={`bg-surface border border-border rounded-md overflow-hidden ${className}`}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-sidebar border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 text-left"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              className="border-b border-border last:border-b-0 hover:bg-surface transition-colors duration-150"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="text-sm text-text-primary px-4 py-3"
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-sm text-text-muted px-4 py-8 text-center"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

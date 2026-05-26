/**
 * CHART_THEME — Shared colour/style constants for Recharts components.
 *
 * Import this alongside ChartContainer to keep chart visuals consistent
 * with the Questly design system.
 */
export const CHART_THEME = {
  background: 'transparent',
  gridColor: '#2a2a2a',
  gridDash: '3 3',
  tooltipBg: '#1c1c1c',
  tooltipBorder: '#2a2a2a',
  primaryColor: '#3b82f6',
  secondaryColor: '#3e9acf',
  tertiaryColor: '#cf3e8e',
  axisColor: '#8c8c8c',
  axisFontSize: 12,
};

/**
 * ChartContainer — Wrapper card for Recharts visualisations.
 *
 * Provides a consistent bg-surface card with a title and renders
 * children (the chart) inside.
 *
 * @param {object}          props
 * @param {string}          [props.title]     – Chart heading
 * @param {React.ReactNode} props.children    – Recharts component(s)
 * @param {string}          [props.className]
 */
export default function ChartContainer({ title, children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-md p-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/**
 * ProgressBar — Horizontal bar with track and animated fill.
 *
 * @param {Object} props
 * @param {number} props.value - Progress value between 0 and 100.
 * @param {string} [props.label] - Optional label shown above the bar.
 * @param {boolean} [props.showValue] - Whether to show label and percentage above the bar.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'brand'|'danger'|'warning'} [props.variant='brand'] - Color variant.
 */
export default function ProgressBar({
  value = 0,
  label,
  showValue = false,
  className = '',
  variant = 'brand',
}) {
  const clamped = Math.min(100, Math.max(0, value));

  const variantColors = {
    brand: 'bg-brand',
    danger: 'bg-danger',
    warning: 'bg-warning',
  };

  const fillColor = variantColors[variant] || variantColors.brand;

  return (
    <div className={className}>
      {/* Label and percentage above bar */}
      {showValue && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-text-muted">{label}</span>}
          <span className="text-sm text-text-primary font-medium">{Math.round(clamped)}%</span>
        </div>
      )}

      {/* Track */}
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${fillColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

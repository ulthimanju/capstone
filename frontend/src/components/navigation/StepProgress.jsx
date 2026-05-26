/**
 * StepProgress — Horizontal step indicator with circles connected by lines.
 *
 * @param {Object} props
 * @param {{ label: string }[]} props.steps - Step definitions.
 * @param {number} props.currentStep - Current active step (0-indexed).
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function StepProgress({ steps = [], currentStep = 0, className = '' }) {
  return (
    <div className={`flex items-start ${className}`} role="group" aria-label="Progress steps">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex items-start flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                  ${
                    isCompleted
                      ? 'bg-brand text-bg'
                      : isActive
                        ? 'border-2 border-brand bg-transparent'
                        : 'bg-border text-text-muted'
                  }
                `}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  /* White checkmark */
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  /* Inner dot */
                  <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label below circle */}
              <span
                className={`mt-2 text-xs text-center max-w-[80px] ${
                  isCompleted || isActive ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div className="flex-1 flex items-center pt-4 px-2">
                <div
                  className={`h-0.5 w-full rounded-full ${
                    isCompleted ? 'bg-brand' : 'bg-border'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

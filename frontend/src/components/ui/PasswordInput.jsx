import { useState } from 'react';

/**
 * PasswordInput — Password field with visibility toggle and live segmented strength indicator.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.value]
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 * @param {string} [props.className]
 */
export default function PasswordInput({
  label,
  error,
  value,
  onChange,
  className = '',
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  const [localVal, setLocalVal] = useState('');

  const currentVal = value !== undefined ? value : localVal;

  const handleChange = (e) => {
    setLocalVal(e.target.value);
    onChange?.(e);
  };

  // Password strength logic
  const getStrength = (val) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 6) score += 1;
    if (/[a-zA-Z]/.test(val) && /[0-9]/.test(val)) score += 1;
    if (/[^a-zA-Z0-9]/.test(val)) score += 1;
    if (val.length >= 10) score += 1;
    return Math.max(1, score); // 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
  };

  const strength = getStrength(currentVal);

  const strengthConfigs = [
    { label: '', color: 'bg-border' },
    { label: 'Weak', color: 'bg-danger' },
    { label: 'Fair', color: 'bg-warning' },
    { label: 'Good', color: 'bg-accent-blue' },
    { label: 'Strong', color: 'bg-brand' },
  ];

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Left lock icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1v-2a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8zm2 4a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type={visible ? 'text' : 'password'}
          value={currentVal}
          onChange={handleChange}
          className={`w-full h-9 pl-9 pr-10 rounded-md text-sm bg-surface border text-text-primary placeholder:text-text-disabled transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow ${
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-brand'
          }`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:outline-none"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            /* Eye-slash icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z"
                clipRule="evenodd"
              />
              <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0110 17c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.838-4.826L6.06 7.94A4 4 0 0010.748 13.93z" />
            </svg>
          ) : (
            /* Eye icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path
                fillRule="evenodd"
                d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Strength Indicator Segmented Bar */}
      {currentVal && (
        <div className="mt-2 space-y-1 animate-fade-in">
          <div className="flex gap-1 h-1">
            {[1, 2, 3, 4].map((index) => {
              const isActive = strength >= index;
              return (
                <div
                  key={index}
                  className={`flex-1 h-full rounded-full transition-all duration-300 ${
                    isActive ? strengthConfigs[strength].color : 'bg-border/30'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-muted">Password Strength</span>
            <span
              className={`font-semibold uppercase tracking-wider ${
                strength === 1
                  ? 'text-danger'
                  : strength === 2
                  ? 'text-warning'
                  : strength === 3
                  ? 'text-accent-blue'
                  : 'text-brand'
              }`}
            >
              {strengthConfigs[strength].label}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

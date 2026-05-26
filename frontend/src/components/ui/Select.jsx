import { useState, useRef, useEffect } from 'react';

/**
 * Select — A completely custom styled premium select dropdown.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {Array<{ value: string, label: string }>} [props.options]
 * @param {string} [props.value]
 * @param {(value: string) => void} [props.onChange]
 * @param {string} [props.error]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 */
export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  placeholder = 'Select an option',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const containerRef = useRef(null);

  // Sync external value with local value
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === localValue);

  const handleSelect = (val) => {
    setLocalValue(val);
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-9 px-3 pr-9 rounded-md text-sm bg-surface border text-text-primary text-left cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-focus-glow flex items-center justify-between ${
            error
              ? 'border-danger focus:border-danger'
              : isOpen
              ? 'border-brand'
              : 'border-border hover:border-border-hover'
          }`}
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-disabled'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 text-text-muted transition-transform duration-150 ${isOpen ? 'rotate-180 text-brand' : ''}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75 0 011.06 0L10 11.94l3.72-3.72a.75 0 111.06 1.06l-4.25 4.25a.75 0 01-1.06 0L5.22 9.28a.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <ul className="absolute z-50 w-full left-0 mt-1 bg-surface-elevated border border-border shadow-modal rounded-md py-1 max-h-60 overflow-y-auto animate-fade-in focus:outline-none">
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-text-disabled italic text-center">
                No options available
              </li>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === localValue;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-brand-muted text-brand font-semibold'
                          : 'text-text-primary hover:bg-surface hover:text-text-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

/**
 * Tabs — Underline-style tab navigation.
 *
 * @param {Object} props
 * @param {{ id: string, label: string, icon?: React.ReactNode }[]} props.tabs - Tab definitions.
 * @param {string} props.activeTab - Currently active tab id.
 * @param {(id: string) => void} props.onChange - Tab change callback.
 * @param {string} [props.className] - Additional CSS classes.
 */
export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-border ${className}`} role="tablist">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(tab.id)}
              className={`
                inline-flex items-center gap-2 pb-3 px-3 text-sm cursor-pointer
                bg-transparent border-none transition-colors duration-150
                focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2
                ${
                  isActive
                    ? 'border-b-2 border-brand text-text-primary font-medium'
                    : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              {tab.icon && <span className="w-4 h-4 flex-shrink-0">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

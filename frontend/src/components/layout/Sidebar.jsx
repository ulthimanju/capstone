/**
 * Sidebar — Collapsible navigation sidebar.
 * Background #141414, active item has left 3px green border.
 */
export default function Sidebar({ collapsed, onToggle, navItems = [], activeNav, onNavChange, onLogout }) {
  return (
    <aside
      className={`
        flex flex-col h-full bg-surface-sidebar border-r border-border
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-14' : 'w-60'}
      `}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <img src="/logo.png" alt="Questly Logo" className="w-8 h-8 object-contain shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-text-primary text-base tracking-tight block truncate">Questly</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavChange?.(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                    transition-colors duration-150 cursor-pointer
                    ${isActive
                      ? 'bg-surface text-text-primary border-l-3 border-l-brand -ml-0.5 pl-2.5'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                    }
                  `}
                >
                  {item.icon && (
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto text-xs bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button */}
      <div className="border-t border-border p-2 shrink-0">
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
            transition-all duration-150 cursor-pointer
            text-text-muted hover:text-rose-400 hover:bg-rose-950/20
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? "Logout" : undefined}
        >
          <span className="w-5 h-5 shrink-0 flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
                     text-text-muted hover:text-text-primary hover:bg-surface/50
                     text-sm font-medium transition-colors cursor-pointer"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

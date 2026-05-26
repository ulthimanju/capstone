/**
 * TopBar — Horizontal top bar with user info, XP badge, and avatar.
 * Background #141414 with 1px bottom border.
 */
export default function TopBar({ user, xp, level, onToggleSidebar, breadcrumb, actions }) {
  return (
    <header className="flex items-center justify-between h-14 px-4 bg-surface-sidebar border-b border-border shrink-0">
      {/* Left: mobile hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md
                     text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {breadcrumb && <div className="hidden md:block">{breadcrumb}</div>}
      </div>

      {/* Right: XP, Level, Avatar */}
      <div className="flex items-center gap-3">
        {/* XP Badge */}
        {xp !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {xp} XP
          </span>
        )}

        {/* Level badge */}
        {level !== undefined && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface text-text-muted border border-border">
            Lv. {level}
          </span>
        )}

        {/* Action buttons slot */}
        {actions}

        {/* Avatar */}
        {user && (
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-brand flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-brand">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand border-2 border-surface-sidebar" />
          </div>
        )}
      </div>
    </header>
  );
}

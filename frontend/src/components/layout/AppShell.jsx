import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * AppShell — The root layout container for the entire application.
 * Provides the sidebar + topbar + main content area structure.
 */
export default function AppShell({ children, user, xp, level, navItems, activeNav, onNavChange }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={onNavChange}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          user={user}
          xp={xp}
          level={level}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

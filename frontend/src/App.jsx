import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ComponentShowcasePage from './pages/ComponentShowcasePage';
import LoginPage from './pages/LoginPage';
import NotebooksPage from './pages/NotebooksPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { useState, useEffect } from 'react';

/* ── Navigation items ── */
const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'notebooks',
    label: 'Notebooks',
    path: '/notebooks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    path: '/quizzes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    path: '/flashcards',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
  },
  {
    id: 'skilltree',
    label: 'Skill Tree',
    path: '/skilltree',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'AI Chat',
    path: '/chat',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    path: '/leaderboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.178-1.768.654-2.097 1.299-.329.644-.41 1.543.134 2.576l.047.089c.562 1.04 1.519 1.957 2.666 2.507M18.75 4.236c.996.178 1.768.654 2.097 1.299.329.644.41 1.543-.134 2.576l-.047.089c-.562 1.04-1.519 1.957-2.666 2.507" />
      </svg>
    ),
  },
  {
    id: 'showcase',
    label: 'Components',
    path: '/showcase',
    badge: '71',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
  },
];

/* ── Placeholder for future pages ── */
function PlaceholderPage({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.648-3.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-2.457-1.34a6.5 6.5 0 10-8.085 0" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="text-sm text-text-muted mt-1">{subtitle}</p>
      <p className="text-xs text-text-disabled mt-4">
        Coming soon — visit{' '}
        <a href="/showcase" className="text-brand hover:underline">Component Showcase</a> to see all UI components
      </p>
    </div>
  );
}

/* ── Authenticated shell wrapper — syncs nav active state with route ── */
function AuthenticatedApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  // Derive activeNav from current path
  const activeNav =
    NAV_ITEMS.find((n) => n.path !== '/' && location.pathname.startsWith(n.path))?.id ??
    (location.pathname === '/' ? 'dashboard' : 'dashboard');

  const handleNavChange = (id) => {
    const item = NAV_ITEMS.find((n) => n.id === id);
    if (item?.path) navigate(item.path);
  };

  // Derive display name: prefer user.displayName, fall back to email prefix
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const shellUser = { name: displayName, avatar: null };

  return (
    <AppShell
      user={shellUser}
      xp={2450}
      level={12}
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={handleNavChange}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notebooks" element={<NotebooksPage />} />
        <Route path="/showcase" element={<ComponentShowcasePage />} />
        {/* Placeholder routes */}
        <Route path="/quizzes" element={<PlaceholderPage title="Quizzes" subtitle="AI-generated quiz challenges" />} />
        <Route path="/flashcards" element={<PlaceholderPage title="Flashcards" subtitle="Spaced repetition study cards" />} />
        <Route path="/skilltree" element={<PlaceholderPage title="Skill Tree" subtitle="Your learning progression map" />} />
        <Route path="/chat" element={<PlaceholderPage title="AI Chat" subtitle="RAG-powered study assistant" />} />
        <Route path="/leaderboard" element={<PlaceholderPage title="Leaderboard" subtitle="Compete with fellow learners" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

/* ═══════════════════════════════════════════════
   App root
═══════════════════════════════════════════════ */
function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

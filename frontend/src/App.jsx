import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import ComponentShowcasePage from './pages/ComponentShowcasePage';
import LoginPage from './pages/LoginPage';
import NotebooksPage from './pages/NotebooksPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizzesPage from './pages/QuizzesPage';
import CoursesPage from './pages/CoursesPage';
import CourseViewerPage from './pages/CourseViewerPage';
import PracticePage from './pages/PracticePage';
import SkillTreePage from './pages/SkillTreePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { useNotificationStore } from './store/useNotificationStore';
import useNotificationSSE from './hooks/useNotificationSSE';
import Toast from './components/ui/Toast';
import AnalyticsPage from './pages/AnalyticsPage';
import TutorPanelPage from './pages/TutorPanelPage';
import AdminPanelPage from './pages/AdminPanelPage';
import axiosClient from './api/axiosClient';

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
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.625c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V9.75zM16.5 5.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V5.625z" />
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
    id: 'courses',
    label: 'Courses',
    path: '/courses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292" />
      </svg>
    ),
  },
  {
    id: 'practice',
    label: 'Practice',
    path: '/practice',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
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

  // Subscribe to real-time notification stream
  useNotificationSSE();

  const activeToast = useNotificationStore(s => s.activeToast);
  const clearToast = useNotificationStore(s => s.clearToast);

  // Build dynamic nav items based on user role
  const userNavItems = [...NAV_ITEMS];
  if (user?.role === 'TUTOR' || user?.role === 'ADMIN') {
    userNavItems.push({
      id: 'tutor',
      label: 'Tutor Workspace',
      path: '/tutor',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.37-.474 7.731-1.332.076-.257.183-.756.26-1.077l.79-3.3c.12-.5.24-1 .36-1.5m-16.882 0.05a54.898 54.898 0 012.263-8.813c.471-1.432 1.57-2.52 3.033-2.88 1.48-.363 3.012-.553 4.588-.553 1.578 0 3.11.19 4.59.553 1.462.36 2.56 1.448 3.03 2.88a54.912 54.912 0 012.26 8.814M9 10.5V6a3 3 0 016 0v4.5" />
        </svg>
      ),
    });
  }
  if (user?.role === 'ADMIN') {
    userNavItems.push({
      id: 'admin',
      label: 'Admin Panel',
      path: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.524a1.125 1.125 0 011.592.253l.773 1.337a1.125 1.125 0 01-.253 1.592l-.737.524c-.35.25-.472.707-.379 1.124.093.418.423.74.843.817l.914.17c.539.098.933.565.933 1.114v1.37c0 .548-.394 1.015-.933 1.114l-.914.17c-.42.077-.75.399-.843.817-.093.418.028.875.379 1.124l.737.524c.48.34.62 1 .253 1.592l-.773 1.337a1.125 1.125 0 01-1.592.253l-.737-.524c-.35-.25-.807-.272-1.205-.108-.396.166-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.524a1.125 1.125 0 01-1.592-.253l-.772-1.337a1.125 1.125 0 01.253-1.592l.737-.524c.351-.25.473-.707.38-1.124-.094-.418-.424-.74-.843-.817l-.914-.17a1.125 1.125 0 01-.933-1.114v-1.37c0-.548.394-1.015.933-1.114l.914-.17c.42-.077.75-.399.843-.817.093-.418-.028-.875-.379-1.124l-.737-.524a1.125 1.125 0 01-.253-1.592l.772-1.337a1.125 1.125 0 011.592-.253l.738.524c.35.25.806.272 1.204.108.397-.166.71-.506.781-.93l.148-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    });
  }

  // Derive activeNav from current path
  const activeNav =
    userNavItems.find((n) => n.path !== '/' && location.pathname.startsWith(n.path))?.id ??
    (location.pathname === '/' ? 'dashboard' : 'dashboard');

  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await axiosClient.post('/api/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const handleNavChange = (id) => {
    const item = userNavItems.find((n) => n.id === id);
    if (item?.path) navigate(item.path);
  };

  // Derive display name: prefer user.displayName, fall back to email prefix
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const shellUser = { name: displayName, avatar: null };

  return (
    <>
      <AppShell
      user={shellUser}
      xp={2450}
      level={12}
      navItems={userNavItems}
      activeNav={activeNav}
      onNavChange={handleNavChange}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/notebooks" element={<NotebooksPage />} />
        <Route path="/showcase" element={<ComponentShowcasePage />} />
        {/* Real routes */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/tutor" element={
          user?.role === 'TUTOR' || user?.role === 'ADMIN' ? (
            <TutorPanelPage />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/admin" element={
          user?.role === 'ADMIN' ? (
            <AdminPanelPage />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        {/* Placeholder routes */}
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseViewerPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/skilltree" element={<SkillTreePage />} />
        <Route path="/chat" element={<PlaceholderPage title="AI Chat" subtitle="RAG-powered study assistant" />} />
        <Route path="/leaderboard" element={<PlaceholderPage title="Leaderboard" subtitle="Compete with fellow learners" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>

      {activeToast && (
        <Toast
          message={activeToast.message}
          variant={activeToast.variant}
          visible={true}
          onClose={clearToast}
        />
      )}
    </>
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

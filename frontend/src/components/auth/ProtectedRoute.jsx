import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * ProtectedRoute — Redirects unauthenticated users to /login.
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

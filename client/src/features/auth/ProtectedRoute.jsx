import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import LoadingPage from '../../components/LoadingPage';

// Logged-out visitors go to Login, then come back here.
// Right after choosing Log out, they go Home instead (SCREENS.md §12–13).
export default function ProtectedRoute({ children }) {
  const { user, ready, loggedOut } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingPage />;
  if (!user && loggedOut) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children ?? <Outlet />;
}

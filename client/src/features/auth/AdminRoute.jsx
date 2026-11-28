import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import ProtectedRoute from './ProtectedRoute';
import NoAccessPage from './NoAccessPage';

// Logged out → Login and back. Logged in but not admin → No access screen.
export default function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminOnly>{children ?? <Outlet />}</AdminOnly>
    </ProtectedRoute>
  );
}

function AdminOnly({ children }) {
  const { user } = useAuth();
  return user.role === 'admin' ? children : <NoAccessPage />;
}

import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import ProtectedRoute from './ProtectedRoute';
import NoAccessPage from './NoAccessPage';
import useOnlineStatus from '../../hooks/useOnlineStatus';

export default function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminOnly>{children ?? <Outlet />}</AdminOnly>
    </ProtectedRoute>
  );
}

function AdminOnly({ children }) {
  const { user, offlineSession } = useAuth();
  const isOnline = useOnlineStatus();

  if (!isOnline || offlineSession) {
    return <NoAccessPage />;
  }

  return user?.role === 'admin'
    ? children
    : <NoAccessPage />;
}
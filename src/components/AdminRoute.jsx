import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';

// Must be nested inside ProtectedRoute so authentication is already
// guaranteed. Regular users hitting an admin page are sent to /dashboard
// rather than /login, since they ARE authenticated — just not authorized.
export default function AdminRoute() {
  const { user } = useAuth();

  if (!isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

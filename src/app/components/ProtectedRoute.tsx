import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'brand' | 'talent' | 'admin';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, boot to auth page
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // If logged in but role doesn't match the required one, boot to appropriate fallback
  if (requiredRole && userRole && requiredRole !== userRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

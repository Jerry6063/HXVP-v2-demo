import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const rolePortalMap = {
  production_admin: 'production',
  client: 'client',
  talent: 'talent',
  crew: 'crew',
};

export default function ProtectedRoute({ portal, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${portal}/login`} replace state={{ from: location }} />;
  }

  if (rolePortalMap[user.role] !== portal) {
    return <Navigate to={`/${portal}/login`} replace state={{ from: location }} />;
  }

  return children;
}

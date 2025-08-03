import { Navigate, Outlet } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

const ProtectedRoute = () => {
  const { userId, loading } = useSupabaseAuth();

  if (loading) return <div>Loading...</div>;
  return userId ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
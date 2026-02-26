import { Navigate } from 'react-router-dom';
import { useAdminToken } from '../../hooks/useAdminToken';

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

export default function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  const { getToken } = useAdminToken();

  if (getToken() === null) {
    return <Navigate to="/cozinha/login" replace />;
  }

  return <>{children}</>;
}

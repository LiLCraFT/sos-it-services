import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TokenHandler from '../components/TokenHandler';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <TokenHandler />
      {children}
    </>
  );
};

export default PrivateRoute; 
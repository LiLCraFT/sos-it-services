import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TokenHandler from '../components/TokenHandler';
import { Spinner } from '../components/ui/Spinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Always mount the TokenHandler to handle URL tokens
  return (
    <>
      <TokenHandler />
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      ) : isAuthenticated ? (
        children
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
};

export default PrivateRoute; 
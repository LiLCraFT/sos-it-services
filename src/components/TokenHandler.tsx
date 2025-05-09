import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      console.log('TokenHandler: Token trouvé dans l’URL, stockage dans localStorage:', token);
      localStorage.setItem('authToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      if (location.pathname !== '/mon-espace') {
        navigate('/mon-espace', { replace: true });
      } else {
        window.location.reload();
      }
    }
  }, [location, navigate]);
  return null;
};

export default TokenHandler; 
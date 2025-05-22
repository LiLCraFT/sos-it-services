import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TokenHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyToken, updateUser } = useAuth();

  useEffect(() => {
    const handleToken = async () => {
      // Vérifier uniquement le token dans l'URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        try {
          const userData = await verifyToken(token);
          if (userData) {
            // Stocker le token et les données utilisateur
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            // Mettre à jour l'état d'authentification
            updateUser(userData);
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Rediriger vers /mon-espace après vérification réussie
            navigate('/mon-espace', { replace: true });
          } else {
            throw new Error('Token invalide');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          navigate('/', { replace: true });
        }
      }
    };

    handleToken();
  }, [location.search, updateUser, navigate]);

  return null;
};

export default TokenHandler; 
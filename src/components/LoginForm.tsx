import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, API_URL } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
      navigate('/mon-espace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la connexion avec Google');
      }
      
      const data = await response.json();
      
      // Rediriger vers l'URL Google
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion avec Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-[#36393F] py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-white">
            Connectez-vous à votre compte
          </h2>
        </div>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-[#23272A] rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-400 text-white bg-[#23272A] rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="mt-4">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="mx-4 text-gray-400 text-sm">Ou continuez avec</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-200 bg-[#23272A] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              Google
            </button>
          </div>

          {onRegisterClick && (
            <div className="text-center">
              <span className="text-gray-400 text-sm">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-indigo-400 hover:underline focus:outline-none"
                >
                  Inscrivez-vous
                </button>
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 
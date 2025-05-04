import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Utiliser la fonction de connexion du contexte d'authentification
      await login(email, password);
      
      // Notifier le parent du succès
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
            placeholder="votre@email.com"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 bg-[#202225] border border-[#40444B] rounded focus:ring-[#5865F2] focus:outline-none"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
            Se souvenir de moi
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="text-[#5865F2] hover:text-[#5865F2]/90">
            Mot de passe oublié?
          </a>
        </div>
      </div>
      
      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </div>
      
      <div className="text-center text-sm text-gray-400">
        Pas encore de compte?{' '}
        <a href="#" className="text-[#5865F2] hover:text-[#5865F2]/90">
          S'inscrire
        </a>
      </div>
    </form>
  );
};

export default LoginForm; 
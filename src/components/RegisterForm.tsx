import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Mail, Lock, User, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    birthDate: '',
    city: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Vérification des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      // Appel à l'API pour créer un compte
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          phone: formData.phone,
          birthDate: formData.birthDate,
          city: formData.city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Connexion automatique après inscription réussie
      await login(formData.email, formData.password);
      
      // Notifier le parent du succès
      onSuccess();
      
      // Rediriger vers la page "Mon espace"
      navigate('/mon-espace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
            Prénom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="Prénom"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
            Nom
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="Nom"
            />
          </div>
        </div>
      </div>
      
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
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
          Adresse
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
            placeholder="Votre adresse"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
            Ville
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              required
              className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="Votre ville"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            Téléphone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="06XXXXXXXX"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-1">
          Date de naissance
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
            className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
        </Button>
      </div>
      
      <div className="text-center text-sm text-gray-400">
        Déjà inscrit?{' '}
        <button 
          type="button" 
          onClick={onLoginClick} 
          className="text-[#5865F2] hover:text-[#5865F2]/90 border-none bg-transparent p-0"
        >
          Se connecter
        </button>
      </div>
    </form>
  );
};

export default RegisterForm; 
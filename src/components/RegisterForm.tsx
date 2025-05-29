import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Mail, Lock, User, Phone, MapPin, Calendar, AlertCircle, Briefcase, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [formData, setFormData] = useState({
    clientType: 'Particulier',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    birthDate: '',
    city: '',
    postalCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Validation en temps réel des emails
  useEffect(() => {
    if (formData.email && formData.confirmEmail) {
      if (formData.email !== formData.confirmEmail) {
        setEmailError('Les adresses email ne correspondent pas');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [formData.email, formData.confirmEmail]);

  // Validation en temps réel des mots de passe
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Vérification finale avant soumission
    if (emailError || passwordError) {
      setError('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    setIsLoading(true);

    try {
      // Préparer les données selon le type de client
      const userData = {
        clientType: formData.clientType,
        firstName: formData.clientType === 'Professionnel' ? formData.companyName : formData.firstName,
        lastName: formData.clientType === 'Professionnel' ? '' : formData.lastName,
        companyName: formData.clientType === 'Professionnel' ? formData.companyName : '',
        email: formData.email,
        password: formData.password,
        address: formData.address,
        phone: formData.phone,
        birthDate: formData.clientType === 'Professionnel' ? null : formData.birthDate,
        city: formData.city,
        postalCode: formData.postalCode,
      };

      // Appel à l'API pour créer un compte
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
      
      {/* GROUPE 0: Informations de connexion */}
      <div className="space-y-4 border border-[#40444B] rounded-xl p-4">
        <h3 className="text-xl font-semibold text-[#5865F2] mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Informations de connexion
        </h3>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
            Email <span className="text-red-500">*</span>
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
              className={`bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border ${emailError ? 'border-red-500' : 'border-[#40444B]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent`}
              placeholder="votre@email.com"
            />
          </div>
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-white mb-1">
            Confirmer l'email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              value={formData.confirmEmail}
              onChange={handleChange}
              onPaste={handlePaste}
              required
              className={`bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border ${emailError ? 'border-red-500' : 'border-[#40444B]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent`}
              placeholder="Confirmez votre email"
            />
          </div>
        </div>
      </div>
      
      {/* GROUPE 1: Information personnelles/entreprise */}
      <div className="space-y-4 border border-[#40444B] rounded-xl p-4">
        <h3 className="text-xl font-semibold text-[#5865F2] mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informations personnelles
        </h3>
        
        <div>
          <label htmlFor="clientType" className="block text-sm font-medium text-white mb-1">
            Type d'utilisateur <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="clientType"
              name="clientType"
              value={formData.clientType}
              onChange={handleChange}
              required
              className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
            >
              <option value="Particulier">Particulier</option>
              <option value="Professionnel">Professionnel</option>
              <option value="Freelancer">Freelancer</option>
            </select>
          </div>
        </div>
      
        {formData.clientType === 'Professionnel' ? (
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-white mb-1">
              Nom de l'entreprise
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                placeholder="Nom de votre entreprise"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white mb-1">
                Prénom <span className="text-red-500">*</span>
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
                  className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                  placeholder="Prénom"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white mb-1">
                Nom <span className="text-red-500">*</span>
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
                  className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                  placeholder="Nom"
                />
              </div>
            </div>
          </div>
        )}
        
        {formData.clientType !== 'Professionnel' && (
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-white mb-1">
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
                required={formData.clientType !== 'Professionnel'}
                className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* GROUPE 2: Informations d'adresse */}
      <div className="space-y-4 border border-[#40444B] rounded-xl p-4">
        <h3 className="text-xl font-semibold text-[#5865F2] mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Coordonnées
        </h3>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-white mb-1">
            Adresse <span className="text-red-500">*</span>
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
              className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="Votre adresse"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-white mb-1">
              Ville <span className="text-red-500">*</span>
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
                className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                placeholder="Votre ville"
              />
            </div>
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-white mb-1">
              Code postal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                placeholder="75001"
                pattern="\d{5}"
                maxLength={5}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
              Téléphone <span className="text-red-500">*</span>
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
                className="bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border border-[#40444B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                placeholder="06XXXXXXXX"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* GROUPE 3: Mots de passe */}
      <div className="space-y-4 border border-[#40444B] rounded-xl p-4">
        <h3 className="text-xl font-semibold text-[#5865F2] mb-4 flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          Sécurité
        </h3>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
            Mot de passe <span className="text-red-500">*</span>
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
              className={`bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border ${passwordError ? 'border-red-500' : 'border-[#40444B]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent`}
              placeholder="••••••••"
            />
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-red-500">{passwordError}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
            Confirmer le mot de passe <span className="text-red-500">*</span>
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
              onPaste={handlePaste}
              required
              className={`bg-[#202225] text-white placeholder-gray-400 block w-full pl-10 pr-3 py-2 border ${passwordError ? 'border-red-500' : 'border-[#40444B]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent`}
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>
      
      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Inscription en cours...' : 'Rejoindre la communauté'}
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
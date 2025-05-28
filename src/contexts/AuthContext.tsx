import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  city?: string;
  role: string;
  profileImage?: string;
  subscriptionType?: string;
  clientType?: string;
  hasPaymentMethod?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  verifyToken: (token: string) => Promise<User | null>;
  API_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// URL de l'API backend
const API_URL = 'http://localhost:3001';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Initialisation de l\'état user avec:', storedUser);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasToken = !!localStorage.getItem('authToken');
    console.log('Initialisation de isAuthenticated avec:', hasToken);
    return hasToken;
  });
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = async (token: string): Promise<User | null> => {
    try {
      console.log('Vérification du token...');
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Réponse de l\'API:', response.status);
      const data = await response.json();
      console.log('Données reçues:', data);

      if (!response.ok) {
        console.log('Token invalide');
        return null;
      }

      // Vérifier si les données utilisateur sont présentes
      if (!data.user) {
        console.log('Pas de données utilisateur dans la réponse');
        return null;
      }

      console.log('Token valide, données utilisateur:', data.user);
      return data.user;
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Vérification de l\'authentification, token présent:', !!token);
        
        if (!token) {
          console.log('Pas de token trouvé, déconnexion');
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const userData = await verifyToken(token);
        console.log('Résultat de la vérification:', userData ? 'utilisateur trouvé' : 'utilisateur non trouvé');
        
        if (userData) {
          console.log('Mise à jour de l\'état avec les données utilisateur');
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.log('Token invalide ou pas de données utilisateur, déconnexion');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion...');
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Identifiants invalides');
      }

      const data = await response.json();
      console.log('Connexion réussie, stockage du token');
      localStorage.setItem('authToken', data.token);
      
      const userData = await verifyToken(data.token);
      if (userData) {
        console.log('Utilisateur authentifié avec succès');
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Erreur lors de la vérification du token');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Déconnexion...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: User) => {
    console.log('Mise à jour des données utilisateur');
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Log de l'état actuel
  console.log('État actuel:', {
    user: user ? 'présent' : 'absent',
    isAuthenticated,
    isLoading,
    token: localStorage.getItem('authToken') ? 'présent' : 'absent'
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        verifyToken,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
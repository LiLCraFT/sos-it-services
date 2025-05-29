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
  postalCode?: string;
  role: string;
  profileImage?: string;
  subscriptionType?: string;
  clientType?: string;
  hasPaymentMethod?: boolean;
  linkedin?: string;
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
  updatePaymentMethodStatus: (hasPaymentMethod: boolean) => void;
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
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasToken = !!localStorage.getItem('authToken');
    return hasToken;
  });
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      // Vérifier si les données utilisateur sont présentes
      if (!data.user) {
        return null;
      }

      return data.user;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const userData = await verifyToken(token);
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
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
      localStorage.setItem('authToken', data.token);
      
      const userData = await verifyToken(data.token);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Erreur lors de la vérification du token');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updatePaymentMethodStatus = (hasPaymentMethod: boolean) => {
    if (user) {
      const updatedUser = { ...user, hasPaymentMethod };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

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
        updatePaymentMethodStatus,
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
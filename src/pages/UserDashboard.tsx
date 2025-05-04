import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Settings, Mail, Key, LogOut } from 'lucide-react';

const UserDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl pt-24">
      <div className="bg-[#2F3136] rounded-lg shadow-xl overflow-hidden">
        {/* En-tête du profil */}
        <div className="bg-[#5865F2] p-6">
          <h1 className="text-2xl font-bold text-white">Mon Espace</h1>
          <p className="text-[#E3E5E8]">Gérez vos informations et vos services</p>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Barre latérale */}
          <div className="bg-[#36393F] p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-[#5865F2] rounded-full w-12 h-12 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">{user?.name}</h2>
                <span className="text-sm text-gray-400">{user?.role}</span>
              </div>
            </div>
            
            <nav className="space-y-1">
              <a href="#" className="flex items-center space-x-3 p-3 rounded-md bg-[#5865F2]/10 text-[#5865F2] font-medium">
                <User className="w-5 h-5" />
                <span>Mon profil</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-[#5865F2]/10 hover:text-[#5865F2]">
                <Settings className="w-5 h-5" />
                <span>Paramètres</span>
              </a>
              <button 
                onClick={logout}
                className="flex items-center space-x-3 p-3 rounded-md text-gray-300 hover:bg-red-500/10 hover:text-red-500 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </nav>
          </div>
          
          {/* Contenu principal */}
          <div className="col-span-3 p-6 bg-[#2F3136]">
            <h3 className="text-xl font-semibold text-white mb-6">Informations du compte</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Email</h4>
                </div>
                <p className="text-white pl-8">{user?.email}</p>
              </div>
              
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Nom</h4>
                </div>
                <p className="text-white pl-8">{user?.name}</p>
              </div>
              
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Key className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Rôle</h4>
                </div>
                <p className="text-white pl-8">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 
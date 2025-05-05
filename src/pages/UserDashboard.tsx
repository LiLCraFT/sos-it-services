import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Settings, Mail, Key, LogOut, MapPin, Phone, Calendar, Upload } from 'lucide-react';
import { useState } from 'react';

// URL de l'image par défaut
const DEFAULT_IMAGE = 'http://localhost:3001/api/default-avatar';

const UserDashboard = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  
  // Rediriger vers la page d'accueil si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string | undefined) => {
    if (!path) return DEFAULT_IMAGE;
    
    // Si l'URL commence par http, c'est déjà une URL complète
    if (path.startsWith('http')) {
      return path;
    }
    
    // Essayer plusieurs formats d'URL
    if (path.startsWith('/')) {
      // Pour les chemins qui commencent par /
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `http://localhost:3001/api/public/${cleanPath}`;
    } else {
      // Pour les autres chemins
      return `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
    }
  };

  // Formater la date de naissance
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Traduction des types de profil
  const translateRole = (role: string | undefined) => {
    if (!role) return 'Utilisateur';
    
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'fondateur': return 'Fondateur';
      case 'freelancer': return 'Freelancer';
      default: return 'Utilisateur';
    }
  };

  // Gérer le téléchargement d'image de profil
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0] || !user?._id) return;

    const file = files[0];
    
    // Vérifier si le fichier est une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`http://localhost:3001/api/users/${user._id}/profile-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      
      setProfileImage(data.profileImage);
      
      // Mettre à jour les informations utilisateur dans le contexte d'authentification
      updateUser({ profileImage: data.profileImage });
      
    } catch (error) {
      alert(`Erreur lors du téléchargement de l'image`);
    } finally {
      setUploading(false);
    }
  };

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
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4 group">
                <div className="bg-[#5865F2] rounded-full w-24 h-24 flex items-center justify-center overflow-hidden">
                  {profileImage || user?.profileImage ? (
                    <img 
                      src={getImageUrl(profileImage || user?.profileImage)} 
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <label 
                  htmlFor="profile-image-upload" 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <Upload className="w-8 h-8 text-white" />
                </label>
                <input 
                  type="file" 
                  id="profile-image-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-white">{user?.firstName} {user?.lastName}</h2>
                <span className="text-sm text-gray-400">{translateRole(user?.role)}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#36393F] rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-gray-300">Prénom</h4>
                  </div>
                  <p className="text-white pl-8">{user?.firstName}</p>
                </div>
                
                <div className="p-4 bg-[#36393F] rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-gray-300">Nom</h4>
                  </div>
                  <p className="text-white pl-8">{user?.lastName}</p>
                </div>
              </div>
              
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Email</h4>
                </div>
                <p className="text-white pl-8">{user?.email}</p>
              </div>
              
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Téléphone</h4>
                </div>
                <p className="text-white pl-8">{user?.phone}</p>
              </div>
              
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Adresse</h4>
                </div>
                <p className="text-white pl-8">{user?.address}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#36393F] rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-gray-300">Ville</h4>
                  </div>
                  <p className="text-white pl-8">{user?.city}</p>
                </div>
                
                <div className="p-4 bg-[#36393F] rounded-md">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium text-gray-300">Date de naissance</h4>
                  </div>
                  <p className="text-white pl-8">{formatDate(user?.birthDate)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-[#36393F] rounded-md">
                <div className="flex items-center space-x-3 mb-2">
                  <Key className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-gray-300">Rôle</h4>
                </div>
                <p className="text-white pl-8">{translateRole(user?.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 
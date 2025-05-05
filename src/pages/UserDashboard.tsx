import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { User, Settings, Mail, Key, LogOut, MapPin, Phone, Calendar, Upload, Ticket, Edit, Check, X, Grid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import TicketList from '../components/TicketList';
import CreateTicketForm from '../components/CreateTicketForm';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

// URL de l'image par défaut
const DEFAULT_IMAGE = 'http://localhost:3001/api/default-avatar';

type AddressOption = {
  value: {
    description: string;
    place_id: string;
  };
  label: string;
};

type EditableField = 'firstName' | 'lastName' | 'phone' | 'address' | 'city' | 'birthDate';

const UserDashboard = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    // Récupérer le mode d'affichage depuis le localStorage ou utiliser 'cards' par défaut
    const savedViewMode = localStorage.getItem('ticketViewMode');
    return (savedViewMode === 'cards' || savedViewMode === 'table') ? savedViewMode : 'cards';
  });
  
  // États pour l'édition des champs
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
  });
  const [addressOption, setAddressOption] = useState<AddressOption | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Récupérer le paramètre tab de l'URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Définir l'onglet actif en fonction du paramètre de l'URL
  const [activeTab, setActiveTab] = useState(tabParam === 'tickets' ? 'tickets' : 'profile');
  
  // Mettre à jour l'onglet actif si le paramètre d'URL change
  useEffect(() => {
    if (tabParam === 'tickets') {
      setActiveTab('tickets');
    }
  }, [tabParam]);

  // Mettre à jour les données du formulaire quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);
  
  // Mettre à jour le localStorage quand le mode d'affichage change
  useEffect(() => {
    localStorage.setItem('ticketViewMode', viewMode);
  }, [viewMode]);
  
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

  // Gérer la création de ticket
  const handleTicketCreated = () => {
    setShowCreateTicket(false);
    // Refetch tickets if needed
  };

  // Commencer l'édition d'un champ
  const startEditing = (field: EditableField) => {
    setEditingField(field);
  };

  // Annuler l'édition d'un champ
  const cancelEditing = () => {
    // Réinitialiser les valeurs du formulaire
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
      });
    }
    setEditingField(null);
    setAddressOption(null);
    setPostalCode('');
  };

  // Gérer les changements dans les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer la sélection d'adresse avec l'autocomplétion
  const handleAddressSelect = (option: any) => {
    if (!option) return;
    
    setAddressOption(option);
    setFormData(prev => ({ ...prev, address: option.label }));
    
    // Simuler l'extraction du code postal pour cette démonstration
    // Dans une implémentation réelle, vous utiliserez l'API de géocodage pour obtenir ces informations
    const addressParts = option.label.split(', ');
    if (addressParts.length > 1) {
      // Simuler l'extraction de la ville et du code postal
      const cityWithPostal = addressParts[addressParts.length - 2];
      const postalCodeMatch = cityWithPostal.match(/\d{5}/);
      
      if (postalCodeMatch) {
        const postal = postalCodeMatch[0];
        setPostalCode(postal);
        
        // Extraire la ville sans le code postal
        const cityName = cityWithPostal.replace(postal, '').trim();
        setFormData(prev => ({ ...prev, city: cityName }));
      } else {
        setFormData(prev => ({ ...prev, city: cityWithPostal }));
      }
    }
  };

  // Sauvegarder les modifications d'un champ
  const saveField = async () => {
    if (!user?._id || !editingField) return;

    try {
      setLoading(true);
      
      // Préparer les données à envoyer
      const fieldData = { [editingField]: formData[editingField] };
      
      // Si le champ est la ville et qu'il y a un code postal, l'ajouter
      if (editingField === 'city' && postalCode) {
        fieldData.city = `${formData.city} (${postalCode})`;
      }

      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: 'PUT',  // Utiliser PUT au lieu de PATCH car le backend n'implémente pas PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          // Inclure toutes les données de l'utilisateur pour éviter d'écraser les autres champs
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          birthDate: user.birthDate,
          // Écraser seulement le champ modifié
          ...fieldData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour les informations utilisateur dans le contexte d'authentification
      if (data.user) {
        updateUser(data.user);
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.error('Format de réponse inattendu:', data);
        throw new Error('Format de réponse inattendu');
      }
      
      // Réinitialiser l'état d'édition
      setEditingField(null);
      setAddressOption(null);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du champ:', error);
      alert('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  // Rendu du champ en fonction de son état (édition ou affichage)
  const renderField = (field: EditableField, label: string, icon: React.ReactNode, value: string) => {
    const isEditing = editingField === field;
    
    // Gestion spéciale pour les dates
    const displayValue = field === 'birthDate' ? formatDate(value) : value;
    
    return (
      <div className="p-4 bg-[#36393F] rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            {icon}
            <h4 className="font-medium text-gray-300">{label}</h4>
          </div>
          {!(label === 'Email' || label === 'Rôle') && !isEditing && (
            <button 
              onClick={() => startEditing(field)}
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label={`Modifier ${label.toLowerCase()}`}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {isEditing && (
            <div className="flex items-center space-x-2">
              <button
                onClick={saveField}
                disabled={loading}
                className="text-green-500 hover:text-green-400 focus:outline-none"
                aria-label="Sauvegarder"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEditing}
                className="text-red-500 hover:text-red-400 focus:outline-none"
                aria-label="Annuler"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="pl-8">
            {field === 'address' ? (
              <div className="w-full">
                <GooglePlacesAutocomplete
                  apiKey="YOUR_GOOGLE_MAPS_API_KEY"
                  selectProps={{
                    value: addressOption,
                    onChange: handleAddressSelect,
                    placeholder: formData.address || 'Rechercher une adresse...',
                    styles: {
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: '#2F3136',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        boxShadow: 'none',
                        padding: '0.125rem 0',
                      }),
                      input: (provided) => ({
                        ...provided,
                        color: 'white',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#9CA3AF',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: 'white',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? '#5865F2' : '#2F3136',
                        color: 'white',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: '#2F3136',
                        zIndex: 10,
                      }),
                    },
                  }}
                />
              </div>
            ) : field === 'birthDate' ? (
              <input
                type="date"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="bg-[#2F3136] text-white block w-full rounded-md border-0 py-2 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
              />
            ) : (
              <input
                type={field === 'phone' ? 'tel' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="bg-[#2F3136] text-white block w-full rounded-md border-0 py-2 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
              />
            )}
            {field === 'city' && postalCode && (
              <div className="mt-2 text-sm text-gray-400">
                Code postal: {postalCode}
              </div>
            )}
          </div>
        ) : (
          <p className="text-white pl-8">{displayValue}</p>
        )}
      </div>
    );
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
                <div className="flex items-center justify-center mt-1">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                    user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                    user?.role === 'fondateur' ? 'bg-red-500/20 text-red-400' :
                    user?.role === 'freelancer' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-[#5865F2]/20 text-[#5865F2]'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' :
                     user?.role === 'fondateur' ? 'Fondateur' :
                     user?.role === 'freelancer' ? 'Freelancer' :
                     'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
            
            <nav className="space-y-1">
              <a 
                href="#" 
                className={`flex items-center space-x-3 p-3 rounded-md ${activeTab === 'profile' ? 'bg-[#5865F2]/10 text-[#5865F2]' : 'text-gray-300 hover:bg-[#5865F2]/10 hover:text-[#5865F2]'} font-medium`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-5 h-5" />
                <span>Mon profil</span>
              </a>
              <a 
                href="#" 
                className={`flex items-center space-x-3 p-3 rounded-md ${activeTab === 'tickets' ? 'bg-[#5865F2]/10 text-[#5865F2]' : 'text-gray-300 hover:bg-[#5865F2]/10 hover:text-[#5865F2]'} font-medium`}
                onClick={() => setActiveTab('tickets')}
              >
                <Ticket className="w-5 h-5" />
                <span>Mes tickets</span>
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
          
          {/* Contenu principal - Différent selon l'onglet actif */}
          <div className="col-span-3 p-6 bg-[#2F3136]">
            {activeTab === 'profile' && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">Informations du compte</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('firstName', 'Prénom', <User className="w-5 h-5 text-gray-400" />, user?.firstName || '')}
                    {renderField('lastName', 'Nom', <User className="w-5 h-5 text-gray-400" />, user?.lastName || '')}
                  </div>
                  
                  {/* Email non modifiable */}
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Email</h4>
                    </div>
                    <p className="text-white pl-8">{user?.email}</p>
                  </div>
                  
                  {renderField('phone', 'Téléphone', <Phone className="w-5 h-5 text-gray-400" />, user?.phone || '')}
                  {renderField('address', 'Adresse', <MapPin className="w-5 h-5 text-gray-400" />, user?.address || '')}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('city', 'Ville', <MapPin className="w-5 h-5 text-gray-400" />, user?.city || '')}
                    {renderField('birthDate', 'Date de naissance', <Calendar className="w-5 h-5 text-gray-400" />, user?.birthDate || '')}
                  </div>
                  
                  {/* Rôle non modifiable */}
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-2">
                      <Key className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Rôle</h4>
                    </div>
                    <div className="pl-8 flex items-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                        user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                        user?.role === 'fondateur' ? 'bg-red-500/20 text-red-400' :
                        user?.role === 'freelancer' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-[#5865F2]/20 text-[#5865F2]'
                      }`}>
                        {user?.role === 'admin' ? 'Admin' :
                         user?.role === 'fondateur' ? 'Fondateur' :
                         user?.role === 'freelancer' ? 'Freelancer' :
                         'Utilisateur'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'tickets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Mes tickets</h3>
                  <div className="flex items-center space-x-3">
                    {/* Switcher pour basculer entre les modes d'affichage */}
                    <div className="inline-flex items-center bg-[#36393F] rounded-md mr-3">
                      <button 
                        onClick={() => setViewMode('cards')} 
                        className={`px-3 py-2 rounded-l-md flex items-center text-sm ${viewMode === 'cards' ? 'bg-[#5865F2] text-white' : 'text-gray-300 hover:bg-[#36393F]'}`}
                      >
                        <Grid className="w-4 h-4 mr-2" />
                        Cartes
                      </button>
                      <button 
                        onClick={() => setViewMode('table')} 
                        className={`px-3 py-2 rounded-r-md flex items-center text-sm ${viewMode === 'table' ? 'bg-[#5865F2] text-white' : 'text-gray-300 hover:bg-[#36393F]'}`}
                      >
                        <List className="w-4 h-4 mr-2" />
                        Tableau
                      </button>
                    </div>

                    <button
                      onClick={() => setShowCreateTicket(true)}
                      className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none flex items-center"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Créer un ticket
                    </button>
                  </div>
                </div>

                {showCreateTicket ? (
                  <CreateTicketForm 
                    onTicketCreated={handleTicketCreated} 
                    onCancel={() => setShowCreateTicket(false)} 
                  />
                ) : (
                  <TicketList viewMode={viewMode} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 
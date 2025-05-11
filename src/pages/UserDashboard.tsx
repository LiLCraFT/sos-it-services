import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Mail, Key, LogOut, MapPin, Phone, Calendar, Upload, Ticket, Edit, Check, X, Grid, List, CreditCard, FileText, Crown, Percent, Users, Moon, Sun, Bell, Globe, Lock, Monitor, Database, Save } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import TicketList from '../components/TicketList';
import CreateTicketForm from '../components/CreateTicketForm';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { SiVisa } from 'react-icons/si';
import FreelancerList from '../components/FreelancerList';
import UserList from '../components/UserList';
import { Modal } from '../components/ui/Modal';
import { PaymentIcon } from 'react-svg-credit-card-payment-icons';
import { Visa, Mastercard, Amex } from 'react-payment-logos/dist/flat-rounded';

// URL de l'image par défaut
const DEFAULT_IMAGE = '/images/default-profile.png';

type AddressOption = {
  value: {
    description: string;
    place_id: string;
  };
  label: string;
};

type EditableField = 'firstName' | 'lastName' | 'phone' | 'address' | 'city' | 'birthDate';

// Définition des onglets disponibles
type TabId = 'profile' | 'freelancers' | 'users' | 'tickets' | 'subscription' | 'invoices' | 'preferences' | 'ticket_database';

// Structure pour un onglet du dashboard
type TabConfig = {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  // Rôles autorisés à voir cet onglet. Si vide ou non défini, l'onglet est accessible à tous
  roles?: string[];
  // Rôles exclus de l'accès à cet onglet
  excludeRoles?: string[];
};

const UserDashboard = () => {
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
  const [imageError, setImageError] = useState(false);
  
  // Récupérer le paramètre tab de l'URL
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Utiliser le subscriptionType de l'utilisateur
  useEffect(() => {
    // Si user est chargé, initialiser le type d'abonnement
    if (user && user.subscriptionType) {
      setSubscriptionType(user.subscriptionType);
    }
  }, [user]);
  
  // État pour le type d'abonnement, initialisé avec "none" (à la carte) par défaut
  const [subscriptionType, setSubscriptionType] = useState<"none" | "solo" | "family">("none");

  // Configuration des onglets du dashboard
  const tabConfigs: TabConfig[] = [
    {
      id: 'profile',
      label: 'Mon profil',
      icon: <User className="w-5 h-5" />,
      // Accessible à tous
    },
    {
      id: 'users',
      label: 'Les utilisateurs',
      icon: <Users className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer_admin'], // Pour les fondateurs, admins et freelancer_admin
    },
    {
      id: 'freelancers',
      label: 'Les freelancers',
      icon: <Users className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer_admin'], // Ajout de freelancer_admin
    },
    {
      id: 'tickets',
      label: 'Mes tickets',
      icon: <Ticket className="w-5 h-5" />,
      excludeRoles: ['admin', 'fondateur', 'freelancer', 'freelancer_admin'], // Pour tous sauf ces rôles
    },
    {
      id: 'ticket_database',
      label: 'Base de tickets',
      icon: <Database className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer', 'freelancer_admin'], // Pour les fondateurs, admins et freelancers
    },
    {
      id: 'subscription',
      label: 'Mon abonnement',
      icon: <CreditCard className="w-5 h-5" />,
      excludeRoles: ['admin', 'fondateur', 'freelancer', 'freelancer_admin'], // Pour tous sauf ces rôles
    },
    {
      id: 'invoices',
      label: 'Mes factures',
      icon: <FileText className="w-5 h-5" />,
      excludeRoles: ['admin', 'fondateur', 'freelancer', 'freelancer_admin'], // Pour tous sauf ces rôles
    },
    {
      id: 'preferences',
      label: 'Préférences',
      icon: <Settings className="w-5 h-5" />,
      // Accessible à tous
    }
  ];
  
  // Fonction helper pour vérifier si un utilisateur a accès à un onglet
  const canAccessTab = (tab: TabConfig, userRole?: string): boolean => {
    if (!userRole) return !tab.roles && !tab.excludeRoles;
    
    if (tab.roles && tab.roles.length > 0) {
      return tab.roles.includes(userRole);
    }
    
    if (tab.excludeRoles && tab.excludeRoles.length > 0) {
      return !tab.excludeRoles.includes(userRole);
    }
    
    return true;
  };
  
  // Filtrer les onglets accessibles à l'utilisateur actuel
  const accessibleTabs = tabConfigs.filter(tab => canAccessTab(tab, user?.role));
  
  // Définir l'onglet actif en fonction du paramètre de l'URL
  const getInitialTab = (): TabId => {
    // Vérifier si le tab de l'URL est valide et accessible
    if (tabParam) {
      const tabConfig = accessibleTabs.find(tab => tab.id === tabParam);
      if (tabConfig) return tabConfig.id;
    }
    
    // Par défaut, utiliser le premier onglet accessible
    return accessibleTabs.length > 0 ? accessibleTabs[0].id : 'profile';
  };
  
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab());
  
  // Mettre à jour l'onglet actif si le paramètre d'URL change
  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [tabParam, user?.role]);

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
  
  // Initialiser l'image de profil une seule fois au chargement
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
      setImageError(false);
    }
  }, [user?.profileImage]); // Dépendance à user.profileImage pour réinitialiser en cas de changement

  // Forcer le rechargement de l'image quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setImageError(false);
    }
  }, [user]);

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

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string | null | undefined): string => {
    console.log('Image path:', path); // Log pour déboguer

    if (!path) {
      console.log('No path provided, using default image');
      return DEFAULT_IMAGE;
    }
    
    if (path.startsWith('http')) {
      console.log('Using direct URL:', path);
      return path;
    }
    
    // Si le chemin commence par /images/ ou /uploads/, c'est une image du backend
    if (path.startsWith('/images/')) {
      const cleanPath = path.substring(8); // Enlève '/images/'
      const url = `http://localhost:3001/api/images/${cleanPath}`;
      console.log('Constructed URL for /images/ path:', url);
      return url;
    }
    
    if (path.startsWith('/uploads/')) {
      const cleanPath = path.substring(1); // Enlève juste le premier /
      const url = `http://localhost:3001/api/images/${cleanPath}`;
      console.log('Constructed URL for /uploads/ path:', url);
      return url;
    }
    
    // Pour les autres chemins
    if (path.startsWith('/')) {
      const cleanPath = path.substring(1);
      const url = `http://localhost:3001/api/public/${cleanPath}`;
      console.log('Constructed URL for root path:', url);
      return url;
    } else {
      const url = `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
      console.log('Constructed URL for other path:', url);
      return url;
    }
  };

  // Gérer le téléchargement d'image de profil
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0] || !user?._id) return;

    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    try {
      setUploading(true);
      setImageError(false);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`http://localhost:3001/api/users/${user._id}/profile-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload response:', data); // Log pour déboguer
      
      if (data.profileImage) {
        setProfileImage(data.profileImage);
        updateUser({ ...user, profileImage: data.profileImage });
      }
      
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      alert('Erreur lors du téléchargement de l\'image');
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

  const getSubscriptionName = () => {
    switch(subscriptionType) {
      case "solo": return "Plan Solo";
      case "family": return "Plan Famille";
      case "none": 
      default: return "A la carte";
    }
  };

  // Rediriger vers la page d'accueil si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Si non authentifié, ne pas afficher le dashboard
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
      <div className="bg-[#2F3136] rounded-lg shadow-xl overflow-hidden">
        {/* En-tête du profil */}
        <div className="bg-[#5865F2] p-6">
          <div className="flex items-center">
            <User className="w-6 h-6 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
          </div>
          <p className="text-[#E3E5E8]">Gérez vos informations et vos services</p>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Barre latérale */}
          <div className="bg-[#36393F] p-4 md:p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4 group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#202225]">
                  <img
                    src={getImageUrl(user?.profileImage)}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image load error:', e);
                      setImageError(true);
                      const img = e.target as HTMLImageElement;
                      img.src = DEFAULT_IMAGE;
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                      setImageError(false);
                    }}
                    crossOrigin="anonymous"
                    key={`${user?.profileImage}-${Date.now()}`}
                  />
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
                <div className="flex items-center justify-center mt-1 space-x-2">
                  {user?.role === 'fondateur' ? (
                    <>
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400">
                        Fondateur
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                        Admin
                      </span>
                    </>
                  ) : user?.role === 'freelancer_admin' ? (
                    <>
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-500">
                        Freelancer
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                        Admin
                      </span>
                    </>
                  ) : (
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                      user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                      user?.role === 'freelancer' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-[#5865F2]/20 text-[#5865F2]'
                    }`}>
                      {user?.role === 'admin' ? 'Admin' :
                       user?.role === 'freelancer' ? 'Freelancer' :
                       user?.clientType || 'Utilisateur'}
                    </span>
                  )}
                  
                  {/* Tag d'abonnement - visible uniquement si l'utilisateur a un abonnement */}
                  {(!user?.role || 
                    (user?.role !== 'admin' && 
                     user?.role !== 'fondateur' && 
                     user?.role !== 'freelancer' &&
                     user?.role !== 'freelancer_admin')) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400">
                      <Crown className="w-3 h-3 mr-1" />
                      {getSubscriptionName()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {/* Générer les liens de navigation dynamiquement */}
              {accessibleTabs.map(tab => (
                <a 
                  key={tab.id}
                  href="#" 
                  className={`flex items-center space-x-3 p-3 rounded-md ${
                    activeTab === tab.id 
                      ? 'bg-[#5865F2]/10 text-[#5865F2]' 
                      : 'text-gray-300 hover:bg-[#5865F2]/10 hover:text-[#5865F2]'
                  } font-medium`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </a>
              ))}
              
              {/* Lien de déconnexion toujours présent */}
              <button 
                onClick={handleLogout}
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
                    <div className="pl-8 flex items-center space-x-2">
                      {user?.role === 'fondateur' ? (
                        <>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400">
                            Fondateur
                          </span>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                            Admin
                          </span>
                        </>
                      ) : user?.role === 'freelancer_admin' ? (
                        <>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-500">
                            Freelancer
                          </span>
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400">
                            Admin
                          </span>
                        </>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          user?.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                          user?.role === 'freelancer' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-[#5865F2]/20 text-[#5865F2]'
                        }`}>
                          {user?.role === 'admin' ? 'Admin' :
                           user?.role === 'freelancer' ? 'Freelancer' :
                           user?.clientType || 'Utilisateur'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'tickets' && (!user?.role || 
              (user?.role !== 'admin' && 
               user?.role !== 'fondateur' && 
               user?.role !== 'freelancer' &&
               user?.role !== 'freelancer_admin')) && (
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
            
            {activeTab === 'ticket_database' && (user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer' || user?.role === 'freelancer_admin') && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Base de tickets</h3>
                  <div className="flex items-center space-x-3">
                    {/* Switcher pour basculer entre les modes d'affichage */}
                    <div className="inline-flex items-center bg-[#36393F] rounded-md">
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
                  </div>
                </div>
                <TicketList viewMode={viewMode} />
              </>
            )}
            
            {activeTab === 'subscription' && (!user?.role || 
              (user?.role !== 'admin' && 
               user?.role !== 'fondateur' && 
               user?.role !== 'freelancer' &&
               user?.role !== 'freelancer_admin')) && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">Mon abonnement</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-[#36393F] rounded-md relative">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Statut de l'abonnement</h4>
                    </div>
                    {subscriptionType !== "none" && (
                      <div className="absolute top-4 right-4 text-right">
                        <div className="text-white font-medium">
                          {subscriptionType === "solo" ? "29,99€/mois" : "49,99€/mois"}
                        </div>
                        <div className="text-green-400 text-sm flex items-center justify-end mt-1">
                          <Percent className="w-3 h-3 mr-1" />
                          <span>Après crédit d'impôts: </span>
                          <span className="font-bold ml-1">{subscriptionType === "solo" ? "14,99€/mois" : "24,99€/mois"}</span>
                        </div>
                      </div>
                    )}
                    <div className="pl-8 flex items-center">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                        Actif
                      </span>
                    </div>
                    <p className="text-white pl-8 mt-2">{getSubscriptionName()}</p>
                    <p className="text-gray-400 pl-8 text-sm">
                      {subscriptionType !== "none" ? "Abonnement sans engagement" : "Pas d'abonnement en cours"}
                    </p>

                    <div className="pl-8 mt-4">
                      <button className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none mr-2">
                        Gérer mon abonnement
                      </button>
                      <button className="px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 focus:outline-none">
                        Résilier mon abonnement
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Méthode de paiement</h4>
                    </div>
                    <div className="pl-8 flex items-center">
                      <div className="bg-white p-2 rounded mr-2 flex items-center justify-center">
                        <img src="/icons/cb.svg" alt="CB" className="w-12 h-8 object-contain" />
                      </div>
                      <p className="text-white">Carte se terminant par 4242</p>
                    </div>
                    <p className="text-gray-400 pl-8 text-sm">Expire le 12/25</p>
                    
                    <div className="pl-8 mt-4">
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none"
                      >
                        Modifier le mode de paiement
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal de paiement */}
                <Modal
                  isOpen={showPaymentModal}
                  onClose={() => setShowPaymentModal(false)}
                  title="Modifier le mode de paiement"
                  maxWidth="md"
                >
                  <div className="space-y-4">
                    {/* Section des cartes acceptées */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cartes acceptées
                      </label>
                      <div className="flex items-center space-x-3">
                        <img src="/icons/cb.svg" alt="CB" className="w-12 h-8 object-contain" />
                        <Visa width={48} />
                        <Mastercard width={48} />
                        <Amex width={48} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-[#36393F] text-white rounded-md border-0 py-2 px-3 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full bg-[#36393F] text-white rounded-md border-0 py-2 px-3 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full bg-[#36393F] text-white rounded-md border-0 py-2 px-3 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-[#36393F] text-white rounded-md border-0 py-2 px-3 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-[#36393F] rounded-md hover:bg-[#40444b] transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        // Logique de mise à jour du paiement
                        setShowPaymentModal(false);
                      }}
                      className="px-4 py-2 text-sm text-white bg-[#5865F2] rounded-md hover:bg-[#4752C4] transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </button>
                  </div>
                </Modal>
              </>
            )}
            
            {activeTab === 'invoices' && (!user?.role || 
              (user?.role !== 'admin' && 
               user?.role !== 'fondateur' && 
               user?.role !== 'freelancer' &&
               user?.role !== 'freelancer_admin')) && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">Mes factures</h3>
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-md">
                    <table className="min-w-full">
                      <thead className="bg-[#36393F]">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">N° Facture</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Montant</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#36393F]">
                        <tr className="bg-[#2F3136]">
                          <td className="py-3 px-4 text-sm text-white">F-2023-0001</td>
                          <td className="py-3 px-4 text-sm text-white">15/05/2023</td>
                          <td className="py-3 px-4 text-sm text-white">29,99€</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                              Payé
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">
                            <button className="px-3 py-1 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none text-xs">
                              Télécharger
                            </button>
                          </td>
                        </tr>
                        <tr className="bg-[#2F3136]">
                          <td className="py-3 px-4 text-sm text-white">F-2023-0002</td>
                          <td className="py-3 px-4 text-sm text-white">15/04/2023</td>
                          <td className="py-3 px-4 text-sm text-white">29,99€</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                              Payé
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">
                            <button className="px-3 py-1 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none text-xs">
                              Télécharger
                            </button>
                          </td>
                        </tr>
                        <tr className="bg-[#2F3136]">
                          <td className="py-3 px-4 text-sm text-white">F-2023-0003</td>
                          <td className="py-3 px-4 text-sm text-white">15/03/2023</td>
                          <td className="py-3 px-4 text-sm text-white">29,99€</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                              Payé
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">
                            <button className="px-3 py-1 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none text-xs">
                              Télécharger
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'freelancers' && (user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer_admin') && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Les freelancers</h3>
                  <div className="flex items-center space-x-3">
                    {/* Switcher pour basculer entre les modes d'affichage */}
                    <div className="inline-flex items-center bg-[#36393F] rounded-md">
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
                  </div>
                </div>
                
                <FreelancerList viewMode={viewMode} userType="freelancer" />
              </>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Liste des utilisateurs</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-md ${viewMode === 'cards' ? 'bg-[#5865F2] text-white' : 'bg-[#2F3136] text-gray-400'}`}
                      aria-label="Affichage en cartes"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-[#5865F2] text-white' : 'bg-[#2F3136] text-gray-400'}`}
                      aria-label="Affichage en tableau"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <UserList viewMode={viewMode} userType="regular" />
              </div>
            )}

            {activeTab === 'preferences' && (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">Préférences</h3>
                <div className="space-y-6">
                  {/* Apparence */}
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-4">
                      <Monitor className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Apparence</h4>
                    </div>
                    <div className="pl-8 space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-white min-w-[120px]">Thème</span>
                        <div className="flex space-x-2">
                          <button className="flex items-center space-x-2 bg-[#2F3136] px-3 py-2 rounded-md border border-[#5865F2] text-white">
                            <Moon className="w-4 h-4" />
                            <span>Sombre</span>
                          </button>
                          <button className="flex items-center space-x-2 bg-[#2F3136] px-3 py-2 rounded-md text-gray-400 hover:bg-[#202225] transition-colors">
                            <Sun className="w-4 h-4" />
                            <span>Clair</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-white min-w-[120px]">Tickets par page</span>
                        <select className="bg-[#2F3136] text-white block rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-[#202225] focus:ring-2 focus:ring-[#5865F2] focus:outline-none">
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-4">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Notifications</h4>
                    </div>
                    <div className="pl-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Email de confirmation pour les tickets</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked />
                          <div className="relative w-11 h-6 bg-[#2F3136] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Email de mise à jour du statut</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked />
                          <div className="relative w-11 h-6 bg-[#2F3136] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Notifications push</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="relative w-11 h-6 bg-[#2F3136] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Langue et Région */}
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-4">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Langue et Région</h4>
                    </div>
                    <div className="pl-8 space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-white min-w-[120px]">Langue</span>
                        <select className="bg-[#2F3136] text-white block rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-[#202225] focus:ring-2 focus:ring-[#5865F2] focus:outline-none">
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-white min-w-[120px]">Format de date</span>
                        <select className="bg-[#2F3136] text-white block rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset ring-[#202225] focus:ring-2 focus:ring-[#5865F2] focus:outline-none">
                          <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                          <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                          <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sécurité */}
                  <div className="p-4 bg-[#36393F] rounded-md">
                    <div className="flex items-center space-x-3 mb-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-300">Sécurité</h4>
                    </div>
                    <div className="pl-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Authentification à deux facteurs</span>
                        <button className="px-3 py-1 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none">
                          Configurer
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Changer le mot de passe</span>
                        <button className="px-3 py-1 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none">
                          Modifier
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Sessions actives</span>
                        <button className="px-3 py-1 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none">
                          Gérer
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 
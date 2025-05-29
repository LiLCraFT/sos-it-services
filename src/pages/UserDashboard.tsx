import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Mail, Key, LogOut, MapPin, Phone, Calendar, Upload, Ticket, Edit, Check, X, Grid, List, CreditCard, FileText, Crown, Users, Moon, Sun, Bell, Globe, Lock, Monitor, Database, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import TicketList from '../components/TicketList';
import CreateTicketForm from '../components/CreateTicketForm';
import { useLoadScript } from '@react-google-maps/api';
import FreelancerList from '../components/FreelancerList';
import UserList from '../components/UserList';
import { Modal } from '../components/ui/Modal';
import PaymentSettings from '../pages/PaymentSettings';
import SubscriptionManager from '../components/SubscriptionManager';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { APP_CONFIG } from '../config/app';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { geocodeByAddress } from 'react-google-places-autocomplete';

// URL de l'image par défaut

type AddressOption = {
  value: {
    description: string;
    place_id: string;
  };
  label: string;
};

type EditableField = 'firstName' | 'lastName' | 'phone' | 'address' | 'city' | 'postalCode' | 'birthDate' | 'linkedin';

// Définition des onglets disponibles
type TabId = 'profile' | 'dashboard' | 'freelancers' | 'users' | 'tickets' | 'subscription' | 'invoices' | 'preferences' | 'ticket_database';

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

// Type pour les composants d'adresse
type AddressComponents = {
  street_number?: string;
  route?: string;
  locality?: string; // city
  postal_code?: string;
  country?: string;
};


// Ajout du composant réutilisable PaymentMethodCard

const UserDashboard = () => {
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  const navigate = useNavigate();
  const location = useLocation();
  const [uploading, setUploading] = useState(false);
  const [, setProfileImage] = useState<string | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
    postalCode: user?.postalCode || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    linkedin: user?.linkedin || '',
  });
  const [addressOption, setAddressOption] = useState<AddressOption | null>(null);
  const [, setAddressComponents] = useState<AddressComponents>({});
  const [loading, setLoading] = useState(false);
  const [, setImageError] = useState(false);
  
  // Récupérer le paramètre tab de l'URL
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // État pour le type d'abonnement, initialisé avec "none" (à la carte) par défaut
  const [subscriptionType, setSubscriptionType] = useState<'none' | 'solo' | 'family'>('none');
  const [, setTempSubscriptionType] = useState<"none" | "solo" | "family">("none");
  const [] = useState(false);

  const [] = useState<google.maps.places.Autocomplete | null>(null);
  const [libraries] = useState(['places']);

  useLoadScript({
    googleMapsApiKey: APP_CONFIG.googleMapsApiKey,
    libraries: libraries as any,
  });

  // Configuration des onglets du dashboard
  const tabConfigs: TabConfig[] = [
    {
      id: 'profile',
      label: 'Mon profil',
      icon: <User className="w-5 h-5" />,
      // Accessible à tous
    },
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <Grid className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer_admin'],
    },
    {
      id: 'users',
      label: 'Les utilisateurs',
      icon: <Users className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer_admin'],
    },
    {
      id: 'freelancers',
      label: 'Les freelancers',
      icon: <Users className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer_admin'],
    },
    {
      id: 'tickets',
      label: 'Mes tickets',
      icon: <Ticket className="w-5 h-5" />,
      excludeRoles: ['admin', 'fondateur', 'freelancer', 'freelancer_admin'],
    },
    {
      id: 'ticket_database',
      label: 'Base de tickets',
      icon: <Database className="w-5 h-5" />,
      roles: ['fondateur', 'admin', 'freelancer', 'freelancer_admin'],
    },
    {
      id: 'subscription',
      label: 'Mon abonnement',
      icon: <CreditCard className="w-5 h-5" />,
      excludeRoles: ['admin', 'fondateur', 'freelancer', 'freelancer_admin'],
    },
    {
      id: 'invoices',
      label: 'Mes factures',
      icon: <FileText className="w-5 h-5" />,
      excludeRoles: ['admin', 'fondateur', 'freelancer', 'freelancer_admin'],
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
    // Ajout de location.search comme dépendance pour réagir à la navigation SPA
  }, [tabParam, user?.role, location.search]);

  // Mettre à jour les données du formulaire quand l'utilisateur change
  useEffect(() => {
    if (user) {
      console.log('User data:', user); // Debug log
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        linkedin: user.linkedin || '',
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
      // Réinitialiser le formData avec les données utilisateur à jour
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        linkedin: user.linkedin || '',
      }));
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

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string | null | undefined): string => {
    if (!path) {
      return 'http://localhost:3001/api/default-image';
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `http://localhost:3001${path}`;
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
        postalCode: user.postalCode || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        linkedin: user.linkedin || '',
      });
    }
    setEditingField(null);
    setAddressOption(null);
    setAddressComponents({});
  };

  // Gérer les changements dans les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Effet pour gérer la sélection d'adresse
  useEffect(() => {
    if (addressOption) {
      handlePlaceSelect(addressOption);
    }
  }, [addressOption]);

  const handlePlaceSelect = async (option: AddressOption | null) => {
    if (!option) return;
    
    try {
      const results = await geocodeByAddress(option.label);
      const addressComponents = results[0].address_components;
      
      // Extraire les composants de l'adresse
      const streetNumber = addressComponents.find(
        (component) => component.types[0] === "street_number"
      )?.long_name;
      const route = addressComponents.find(
        (component) => component.types[0] === "route"
      )?.long_name;
      const locality = addressComponents.find(
        (component) => component.types[0] === "locality"
      )?.long_name;
      const postalCode = addressComponents.find(
        (component) => component.types[0] === "postal_code"
      )?.long_name;
      const country = addressComponents.find(
        (component) => component.types[0] === "country"
      )?.long_name;

      // Mettre à jour le formulaire avec les nouvelles valeurs
      setFormData((prev) => ({
        ...prev,
        address: `${streetNumber || ""} ${route || ""}`.trim(),
        city: locality || "",
        postalCode: postalCode || "",
      }));

      // Mettre à jour les composants d'adresse pour l'affichage
      setAddressComponents({
        street_number: streetNumber,
        route: route,
        locality: locality,
        postal_code: postalCode,
        country: country,
      });
    } catch (error) {
      console.error("Erreur lors de la géocodification:", error);
    }
  };

  // Sauvegarder les modifications d'un champ
  const saveField = async () => {
    if (!user?._id || !editingField) return;

    try {
      setLoading(true);
      
      // Préparer les données à envoyer
      let fieldData: any = {};
      
      // Si on modifie l'adresse, on envoie tous les champs d'adresse
      if (editingField === 'address') {
        fieldData = {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        };
      } else {
        fieldData = { [editingField]: formData[editingField] };
      }

      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(fieldData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour les informations utilisateur dans le contexte d'authentification
      if (data) {
        // Mettre à jour le contexte d'authentification avec toutes les données
        const updatedUser = {
          ...user,
          ...data,
          // S'assurer que le champ LinkedIn est bien inclus
          linkedin: data.linkedin || user.linkedin || ''
        };
        updateUser(updatedUser);
        
        // Mettre à jour le localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Synchroniser tout le formData avec les nouvelles données utilisateur
        setFormData({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          city: updatedUser.city || '',
          postalCode: updatedUser.postalCode || '',
          birthDate: updatedUser.birthDate ? new Date(updatedUser.birthDate).toISOString().split('T')[0] : '',
          linkedin: updatedUser.linkedin || '',
        });
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
    const isAddressField = field === 'address';
    const isReadOnlyField = field === 'city' || field === 'postalCode';
    
    // Gestion spéciale pour les dates
    const displayValue = field === 'birthDate' ? formatDate(value) : value;
    
    // Debug log pour le champ LinkedIn
    if (field === 'linkedin') {
      console.log('LinkedIn field:', {
        field,
        value,
        formDataValue: formData[field],
        userValue: user?.linkedin,
        isEditing
      });
    }
    
    return (
      <div className="p-4 bg-[#36393F] rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            {icon}
            <h4 className="font-medium text-gray-300">{label}</h4>
          </div>
          {!(label === 'Email' || label === 'Rôle') && !isEditing && !isReadOnlyField && (
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
            {isAddressField ? (
              <div className="w-full">
                <GooglePlacesAutocomplete
                  apiKey={APP_CONFIG.googleMapsApiKey}
                  selectProps={{
                    value: addressOption,
                    onChange: setAddressOption,
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
                value={formData[field] || ''}
                onChange={handleChange}
                className="bg-[#2F3136] text-white block w-full rounded-md border-0 py-2 shadow-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none"
                readOnly={isReadOnlyField}
                placeholder={field === 'linkedin' ? 'https://linkedin.com/in/votre-profil' : ''}
              />
            )}
            {isReadOnlyField && (
              <div className="mt-2 text-sm text-gray-400">
                Ce champ est automatiquement rempli à partir de l'adresse sélectionnée
              </div>
            )}
          </div>
        ) : (
          <p className="text-white pl-8">{displayValue || 'Non renseigné'}</p>
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

  // Utiliser le subscriptionType de l'utilisateur
  useEffect(() => {
    // Si user est chargé, initialiser le type d'abonnement
    if (user && user.subscriptionType) {
      const type = user.subscriptionType as 'none' | 'solo' | 'family';
      setSubscriptionType(type);
      setTempSubscriptionType(type);
    }
  }, [user]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

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
                      img.src = 'http://localhost:3001/api/default-image';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                      setImageError(false);
                    }}
                    crossOrigin="anonymous"
                    key={user?.profileImage || 'default'}
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
                <div className="space-y-8">
                  {/* Identité */}
                  <div>
                    <div className="flex items-center mb-4">
                      <User className="w-5 h-5 text-[#5865F2] mr-2" />
                      <h4 className="text-lg font-semibold text-[#5865F2]">Informations d'identité</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderField('firstName', 'Prénom', <User className="w-5 h-5 text-gray-400" />, user?.firstName || '')}
                      {renderField('lastName', 'Nom', <User className="w-5 h-5 text-gray-400" />, user?.lastName || '')}
                      {renderField('birthDate', 'Date de naissance', <Calendar className="w-5 h-5 text-gray-400" />, user?.birthDate || '')}
                    </div>
                  </div>
                  {/* Lieu */}
                  <div>
                    <div className="flex items-center mb-4">
                      <MapPin className="w-5 h-5 text-[#5865F2] mr-2" />
                      <h4 className="text-lg font-semibold text-[#5865F2]">Informations de lieu</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderField('address', 'Adresse', <MapPin className="w-5 h-5 text-gray-400" />, user?.address || '')}
                      {renderField('city', 'Ville', <MapPin className="w-5 h-5 text-gray-400" />, user?.city || '')}
                      {renderField('postalCode', 'Code postal', <MapPin className="w-5 h-5 text-gray-400" />, user?.postalCode || '')}
                    </div>
                  </div>
                  {/* Contact */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Phone className="w-5 h-5 text-[#5865F2] mr-2" />
                      <h4 className="text-lg font-semibold text-[#5865F2]">Informations de contact</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-[#36393F] rounded-md">
                        <div className="flex items-center space-x-3 mb-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <h4 className="font-medium text-gray-300">Email</h4>
                        </div>
                        <p className="text-white pl-8">{user?.email}</p>
                      </div>
                      {renderField('phone', 'Téléphone', <Phone className="w-5 h-5 text-gray-400" />, user?.phone || '')}
                    </div>
                  </div>
                  {/* Autres infos */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Key className="w-5 h-5 text-[#5865F2] mr-2" />
                      <h4 className="text-lg font-semibold text-[#5865F2]">Autres informations</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {renderField('linkedin', 'LinkedIn', <Globe className="w-5 h-5 text-gray-400" />, user?.linkedin || '')}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'dashboard' && (user?.role === 'fondateur' || user?.role === 'admin' || user?.role === 'freelancer_admin') && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-6">Tableau de bord</h3>
                
                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#36393F] p-4 rounded-lg hover:bg-[#3A3D42] transition-colors cursor-pointer group" onClick={() => setActiveTab('users')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Utilisateurs actifs</p>
                        <h4 className="text-2xl font-bold text-white mt-1">1,234</h4>
                      </div>
                      <div className="bg-[#5865F2]/10 p-3 rounded-full group-hover:bg-[#5865F2]/20 transition-colors">
                        <Users className="w-8 h-8 text-[#5865F2]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-green-400 text-sm">+12%</span>
                      <span className="text-gray-400 text-sm ml-1">vs mois dernier</span>
                    </div>
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-3 transition-all">
                      <span className="text-[#5865F2] text-sm font-medium">Gérer les utilisateurs →</span>
                    </div>
                  </div>

                  <div className="bg-[#36393F] p-4 rounded-lg hover:bg-[#3A3D42] transition-colors cursor-pointer group" onClick={() => setActiveTab('ticket_database')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Tickets en cours</p>
                        <h4 className="text-2xl font-bold text-white mt-1">42</h4>
                      </div>
                      <div className="bg-[#5865F2]/10 p-3 rounded-full group-hover:bg-[#5865F2]/20 transition-colors">
                        <Ticket className="w-8 h-8 text-[#5865F2]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-yellow-400 text-sm">+5%</span>
                      <span className="text-gray-400 text-sm ml-1">vs mois dernier</span>
                    </div>
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-3 transition-all">
                      <span className="text-[#5865F2] text-sm font-medium">Gérer les tickets →</span>
                    </div>
                  </div>

                  <div className="bg-[#36393F] p-4 rounded-lg hover:bg-[#3A3D42] transition-colors cursor-pointer group" onClick={() => setActiveTab('freelancers')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Freelancers actifs</p>
                        <h4 className="text-2xl font-bold text-white mt-1">28</h4>
                      </div>
                      <div className="bg-[#5865F2]/10 p-3 rounded-full group-hover:bg-[#5865F2]/20 transition-colors">
                        <User className="w-8 h-8 text-[#5865F2]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-green-400 text-sm">+8%</span>
                      <span className="text-gray-400 text-sm ml-1">vs mois dernier</span>
                    </div>
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-3 transition-all">
                      <span className="text-[#5865F2] text-sm font-medium">Gérer les freelancers →</span>
                    </div>
                  </div>

                  <div className="bg-[#36393F] p-4 rounded-lg hover:bg-[#3A3D42] transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Taux de résolution</p>
                        <h4 className="text-2xl font-bold text-white mt-1">95%</h4>
                      </div>
                      <div className="bg-[#5865F2]/10 p-3 rounded-full group-hover:bg-[#5865F2]/20 transition-colors">
                        <Check className="w-8 h-8 text-[#5865F2]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-green-400 text-sm">+2%</span>
                      <span className="text-gray-400 text-sm ml-1">vs mois dernier</span>
                    </div>
                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-3 transition-all">
                      <span className="text-[#5865F2] text-sm font-medium">Voir les statistiques →</span>
                    </div>
                  </div>
                </div>

                {/* Raccourcis rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-[#5865F2] to-[#7289DA] rounded-lg shadow-lg hover:from-[#4752C4] hover:to-[#5865F2] transition-colors cursor-pointer" onClick={() => setShowCreateTicket(true)}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Ticket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Créer un ticket</h3>
                        <p className="text-white/80 text-sm">Nouveau ticket de support</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-lg shadow-lg hover:from-[#FF5151] hover:to-[#FF7373] transition-colors cursor-pointer" onClick={() => setActiveTab('users')}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-3 rounded-full">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Ajouter un utilisateur</h3>
                        <p className="text-white/80 text-sm">Créer un compte utilisateur</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-[#43B581] to-[#70C08B] rounded-lg shadow-lg hover:from-[#389E6E] hover:to-[#5EAF78] transition-colors cursor-pointer" onClick={() => setActiveTab('freelancers')}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-3 rounded-full">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Ajouter un freelancer</h3>
                        <p className="text-white/80 text-sm">Recruter un nouveau support</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activité récente */}
                <div className="bg-[#36393F] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">Activité récente</h4>
                    <button className="text-[#5865F2] text-sm hover:underline">Voir tout</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#5865F2] p-1 rounded-full">
                          <Ticket className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-white font-medium">Martin Durand</p>
                          <span className="text-gray-400 text-xs">Il y a 5 min</span>
                        </div>
                        <p className="text-gray-300 text-sm">A créé un nouveau ticket <span className="text-[#5865F2]">#1234</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                      onClick={() => {
                        if (!paymentMethodsLoading && paymentMethods.length === 0) {
                          setShowPaymentModal(true);
                        } else {
                          setShowCreateTicket(true);
                        }
                      }}
                      className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none flex items-center"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Créer un ticket
                    </button>
                  </div>
                </div>

                {showPaymentModal && (
                  <Modal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    title="Méthode de paiement requise"
                  >
                    <div className="flex flex-col items-center mb-2">
                      <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
                      <span className="text-gray-400 text-sm mb-1">{user?.email}</span>
                      {(!user?.role || (user?.role !== 'admin' && user?.role !== 'fondateur' && user?.role !== 'freelancer' && user?.role !== 'freelancer_admin')) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400 mt-1 mb-2">
                          <Crown className="w-3 h-3 mr-1" />
                          {user?.subscriptionType === 'solo' ? 'Plan Solo' : user?.subscriptionType === 'family' ? 'Plan Famille' : 'A la carte'}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-300 mb-4 text-center">
                      Pour créer un ticket, vous devez d'abord ajouter une méthode de paiement à votre compte.<br />
                      <span className="text-xs text-gray-500">Aucune somme ne sera débitée tant que les différents problèmes ne seront pas résolus.</span>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="px-4 py-2 bg-[#2F3136] text-gray-300 rounded-md hover:bg-[#202225] focus:outline-none"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          setShowPaymentModal(false);
                          setActiveTab('subscription');
                        }}
                        className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none"
                      >
                        Ajouter une carte
                      </button>
                    </div>
                  </Modal>
                )}

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
                <SubscriptionManager />
                <PaymentSettings />
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
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            value="" 
                            className="sr-only peer" 
                            checked={notificationsEnabled}
                            onChange={(e) => setNotificationsEnabled(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Email de mise à jour du statut</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            value="" 
                            className="sr-only peer" 
                            checked={darkModeEnabled}
                            onChange={(e) => setDarkModeEnabled(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Notifications push</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            value="" 
                            className="sr-only peer" 
                            checked={autoSaveEnabled}
                            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
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
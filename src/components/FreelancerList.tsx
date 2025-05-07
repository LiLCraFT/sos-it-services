import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Calendar, Mail, Phone, MapPin, MoreVertical, ChevronUp, ChevronDown, Grid, List, CheckCircle, XCircle, Trash, Edit, Filter, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from './Tooltip';
import FreelancerDetailsModal from './FreelancerDetailsModal';

type FreelancerData = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  profileImage: string;
  createdAt: string;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  emailVerificationToken?: string | null;
  rating?: number;
};

type SortField = 'firstName' | 'lastName' | 'email' | 'city' | 'createdAt';

interface FreelancerListProps {
  viewMode: 'cards' | 'table';
  userType?: 'freelancer';
}

// URL de l'API backend
const API_URL = 'http://localhost:3001';

const FreelancerList: React.FC<FreelancerListProps> = ({ viewMode, userType = 'freelancer' }) => {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState<FreelancerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number} | null>(null);
  const [activeFreelancerId, setActiveFreelancerId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ userId: string; x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const isFounder = user?.role === 'fondateur';
  
  // État pour le filtre des freelancers
  const [freelancerTypeFilter, setFreelancerTypeFilter] = useState<string | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerData | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
      for (const freelancerId in dropdownOpen) {
        if (dropdownOpen[freelancerId] && !dropdownRefs.current[freelancerId]?.contains(event.target as Node)) {
          closeDropdown(freelancerId);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, contextMenu]);

  useEffect(() => {
    // Fonction pour positionner les menus déroulants
    const positionDropdowns = () => {
      for (const id in dropdownRefs.current) {
        if (dropdownRefs.current[id] && dropdownOpen[id]) {
          const button = document.getElementById(`dropdown-button-${id}`) || document.getElementById(`dropdown-button-card-${id}`);
          const dropdown = dropdownRefs.current[id];
          
          if (button && dropdown) {
            const buttonRect = button.getBoundingClientRect();
            const dropdownRect = dropdown.getBoundingClientRect();
            
            // Positionner le menu à gauche du bouton mais visible dans la fenêtre
            const viewportWidth = window.innerWidth;
            const spaceOnRight = viewportWidth - buttonRect.right;
            
            if (spaceOnRight >= dropdownRect.width) {
              // Assez d'espace à droite
              dropdown.style.left = `${buttonRect.right}px`;
              dropdown.style.top = `${buttonRect.top}px`;
            } else {
              // Pas assez d'espace à droite, afficher à gauche
              dropdown.style.left = `${Math.max(0, buttonRect.left - dropdownRect.width)}px`;
              dropdown.style.top = `${buttonRect.top}px`;
            }
          }
        }
      }
    };

    // Exécuter le positionnement après le rendu
    if (Object.keys(dropdownOpen).some(id => dropdownOpen[id])) {
      setTimeout(positionDropdowns, 0);
    }

    // Ajouter un gestionnaire pour repositionner lors du redimensionnement
    window.addEventListener('resize', positionDropdowns);
    return () => {
      window.removeEventListener('resize', positionDropdowns);
    };
  }, [dropdownOpen]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/freelancers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des freelancers');
      }
      
      const data = await response.json();
      setFreelancers(data.freelancers);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des freelancers');
      alert('Impossible de charger la liste des freelancers');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (freelancerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (dropdownOpen[freelancerId]) {
      // Si déjà ouvert, fermer
      closeDropdown(freelancerId);
      return;
    }
    
    // Calculer la position du menu à partir de l'événement
    const buttonRect = event.currentTarget.getBoundingClientRect();
    
    // Positionner le menu à droite du bouton
    setMenuPosition({
      top: buttonRect.bottom + window.scrollY,
      left: Math.max(10, buttonRect.left + window.scrollX - 220) // Décalage pour aligner le menu à gauche
    });
    
    setActiveFreelancerId(freelancerId);
    
    // Mettre à jour l'état d'ouverture du dropdown
    setDropdownOpen(prev => ({
      ...prev,
      [freelancerId]: true
    }));
  };

  const closeDropdown = (freelancerId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [freelancerId]: false
    }));
    setActiveFreelancerId(null);
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortFreelancers = (freelancersToSort: FreelancerData[]) => {
    return [...freelancersToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'firstName':
          comparison = a.firstName.localeCompare(b.firstName);
          break;
        case 'lastName':
          comparison = a.lastName.localeCompare(b.lastName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'city':
          comparison = a.city.localeCompare(b.city);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = a.lastName.localeCompare(b.lastName);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleAdminRole = async (freelancerId: string, currentRole: string) => {
    try {
      setActionInProgress({ ...actionInProgress, [freelancerId]: true });
      
      const token = localStorage.getItem('authToken');
      console.log('Token:', token); // Debug log
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const isCurrentlyAdmin = currentRole === 'freelancer_admin';
      const isAdmin = !isCurrentlyAdmin;
      
      console.log('Envoi de la requête à:', `${API_URL}/api/freelancers`); // Debug log
      console.log('Données envoyées:', { freelancerId, isAdmin }); // Debug log
      
      const response = await fetch(`${API_URL}/api/freelancers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          freelancerId,
          isAdmin 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Réponse d\'erreur:', errorData); // Debug log
        throw new Error(errorData?.message || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Mettre à jour la liste locale des freelancers
      setFreelancers(prevFreelancers => 
        prevFreelancers.map(f => 
          f._id === freelancerId 
            ? { ...f, role: isAdmin ? 'freelancer_admin' : 'freelancer' } 
            : f
        )
      );
      
      alert(`Droits d'administration ${isAdmin ? 'accordés' : 'retirés'} avec succès`);
      closeDropdown(freelancerId);
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      alert(err.message || 'Une erreur est survenue lors de la mise à jour du rôle');
    } finally {
      setActionInProgress({ ...actionInProgress, [freelancerId]: false });
    }
  };

  const deleteFreelancer = async (freelancerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce freelancer ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setActionInProgress({ ...actionInProgress, [freelancerId]: true });
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/freelancers?id=${freelancerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du freelancer');
      }
      
      // Mettre à jour la liste locale des freelancers
      setFreelancers(prevFreelancers => 
        prevFreelancers.filter(f => f._id !== freelancerId)
      );
      
      alert('Freelancer supprimé avec succès');
      closeDropdown(freelancerId);
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue');
    } finally {
      setActionInProgress({ ...actionInProgress, [freelancerId]: false });
    }
  };
  
  const editFreelancer = (freelancerId: string) => {
    // Rediriger vers la page d'édition du freelancer
    window.location.href = `/edit-freelancer/${freelancerId}`;
  };

  // Rendu du menu popup (à rendre une seule fois en dehors du tableau)
  const renderDropdownMenu = () => {
    if (!activeFreelancerId || !menuPosition) return null;
    
    const freelancer = freelancers.find(f => f._id === activeFreelancerId);
    if (!freelancer) return null;
    
    return (
      <div 
        ref={el => dropdownRefs.current[activeFreelancerId] = el}
        className="fixed z-50 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225]"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`
        }}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {isFounder && (
            <button 
              onClick={() => toggleAdminRole(activeFreelancerId, freelancer.role)}
              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
              disabled={actionInProgress[activeFreelancerId]}
            >
              {freelancer.role === 'freelancer_admin' ? (
                <>
                  <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                  <span>Retirer les droits d'admin</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>Ajouter les droits d'admin</span>
                </>
              )}
            </button>
          )}

          {isFounder && (
            <>
              <button 
                onClick={() => editFreelancer(activeFreelancerId)}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
                disabled={actionInProgress[activeFreelancerId]}
              >
                <Edit className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                <span>Modifier</span>
              </button>
              <button 
                onClick={() => deleteFreelancer(activeFreelancerId)}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
                disabled={actionInProgress[activeFreelancerId]}
              >
                <Trash className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                <span>Supprimer</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Filtrer les freelancers selon le filtre sélectionné
  const getFilteredFreelancers = () => {
    if (!freelancerTypeFilter) {
      return freelancers;
    }
    
    return freelancers.filter(freelancer => freelancer.role === freelancerTypeFilter);
  };
  
  // Afficher les filtres disponibles
  const renderFilters = () => {
    return (
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Filtrer:</span>
          <div className="flex space-x-1">
            <button
              className={`px-3 py-1 text-sm rounded-md ${!freelancerTypeFilter ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#4F545C]'}`}
              onClick={() => setFreelancerTypeFilter(null)}
            >
              Tous
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${freelancerTypeFilter === 'freelancer_admin' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#4F545C]'}`}
              onClick={() => setFreelancerTypeFilter('freelancer_admin')}
            >
              Admins
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${freelancerTypeFilter === 'freelancer' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#4F545C]'}`}
              onClick={() => setFreelancerTypeFilter('freelancer')}
            >
              Freelancers
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Trier par:</span>
          <select
            value={sortField}
            onChange={(e) => handleSortClick(e.target.value as SortField)}
            className="bg-[#36393F] text-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
          >
            <option value="lastName">Nom</option>
            <option value="email">Email</option>
            <option value="city">Ville</option>
            <option value="createdAt">Date d'inscription</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
          >
            {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  };

  // Affichage du statut de compte (CheckCircle, XCircle, Clock)
  const renderStatus = (freelancer: FreelancerData) => (
    <div className="flex items-center justify-center space-x-2">
      {freelancer.isEmailVerified ? (
        <Tooltip text="Compte activé">
          <CheckCircle className="w-4 h-4 text-green-500" />
        </Tooltip>
      ) : freelancer.emailVerificationToken ? (
        <Tooltip text="En attente d'activation">
          <Clock className="w-4 h-4 text-yellow-400" />
        </Tooltip>
      ) : (
        <Tooltip text="Compte désactivé">
          <XCircle className="w-4 h-4 text-red-500" />
        </Tooltip>
      )}
      {freelancer.isAdminVerified ? (
        <Tooltip text="Freelancer validé par l'admin">
          <CheckCircle className="w-4 h-4 text-yellow-400" />
        </Tooltip>
      ) : (
        <Tooltip text="En attente de validation admin">
          <Clock className="w-4 h-4 text-yellow-400" />
        </Tooltip>
      )}
    </div>
  );

  const handleContextMenu = (e: React.MouseEvent, freelancerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      userId: freelancerId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const toggleUserVerification = async (freelancerId: string, isEmailVerified?: boolean, isAdminVerified?: boolean) => {
    try {
      setActionInProgress({ ...actionInProgress, [freelancerId]: true });
      
      const token = localStorage.getItem('authToken');
      const freelancer = freelancers.find(f => f._id === freelancerId);
      
      if (!freelancer) {
        throw new Error('Freelancer non trouvé');
      }

      const response = await fetch(`${API_URL}/api/admin/toggle-user-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: freelancerId,
          isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : freelancer.isEmailVerified,
          isAdminVerified: isAdminVerified !== undefined ? isAdminVerified : freelancer.isAdminVerified
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      // Mettre à jour la liste locale des freelancers
      setFreelancers(prevFreelancers => 
        prevFreelancers.map(f => 
          f._id === freelancerId 
            ? { 
                ...f, 
                isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : f.isEmailVerified,
                isAdminVerified: isAdminVerified !== undefined ? isAdminVerified : f.isAdminVerified
              } 
            : f
        )
      );
      
      const action = isEmailVerified !== undefined 
        ? (isEmailVerified ? 'activé' : 'désactivé')
        : (isAdminVerified ? 'validé' : 'invalidé');
      
      alert(`Statut ${action} avec succès`);
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue');
    } finally {
      setActionInProgress({ ...actionInProgress, [freelancerId]: false });
    }
  };

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string | null | undefined, freelancerId: string): string => {
    if (!path || imageError[freelancerId]) return '/images/default-profile.png';
    
    if (path.startsWith('http')) {
      return path;
    }
    
    if (path.startsWith('/')) {
      return `http://localhost:3001${path}`;
    }
    
    return `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865F2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 text-red-400 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchFreelancers} 
          className="mt-2 px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const filteredFreelancers = getFilteredFreelancers();

  if (filteredFreelancers.length === 0) {
    return (
      <div>
        {renderFilters()}
        <div className="p-4 bg-[#36393F] rounded-md text-center">
          <p className="text-gray-300">Aucun freelancer trouvé.</p>
        </div>
      </div>
    );
  }

  // Rendu en mode tableau
  const renderTableView = () => {
    const sortedFreelancers = sortFreelancers(filteredFreelancers);
    
    // Helper pour afficher l'icône de tri
    const renderSortIcon = (field: SortField) => {
      if (sortField !== field) return null;
      return sortDirection === 'asc' ? 
        <ChevronUp className="w-4 h-4 ml-1" /> : 
        <ChevronDown className="w-4 h-4 ml-1" />;
    };

    // Helper pour afficher les tags de rôle
    const renderRoleTags = (role: string) => {
      if (role === 'freelancer_admin') {
        return (
          <div className="flex space-x-1">
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
              Freelancer
            </span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              Admin
            </span>
          </div>
        );
      } else {
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
            role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-500'
          }`}>
            {role === 'admin' ? 'Admin' : 'Freelancer'}
          </span>
        );
      }
    };

    return (
      <div>
        {renderFilters()}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#2F3136] rounded-md overflow-hidden">
            <thead className="bg-[#202225]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Photo
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                  onClick={() => handleSortClick('lastName')}
                >
                  <div className="flex items-center">
                    <span>Nom</span>
                    {renderSortIcon('lastName')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                  onClick={() => handleSortClick('email')}
                >
                  <div className="flex items-center">
                    <span>Email</span>
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                  onClick={() => handleSortClick('city')}
                >
                  <div className="flex items-center">
                    <span>Ville</span>
                    {renderSortIcon('city')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                  onClick={() => handleSortClick('createdAt')}
                >
                  <div className="flex items-center">
                    <span>Inscrit le</span>
                    {renderSortIcon('createdAt')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Statut compte</th>
              </tr>
            </thead>
            <tbody>
              {sortedFreelancers.map((freelancer) => (
                <tr 
                  key={freelancer._id} 
                  className="hover:bg-[#36393F] transition-colors cursor-pointer group"
                  onContextMenu={(e) => handleContextMenu(e, freelancer._id)}
                >
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#202225]">
                      <img 
                        src={getImageUrl(freelancer.profileImage, freelancer._id)} 
                        alt={`${freelancer.firstName} ${freelancer.lastName}`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(prev => ({ ...prev, [freelancer._id]: true }))}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {freelancer.firstName} {freelancer.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{freelancer.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{freelancer.city}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(freelancer.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderRoleTags(freelancer.role)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {renderStatus(freelancer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Rendu en mode carte
  const renderCardView = () => (
    <div>
      {renderFilters()}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortFreelancers(filteredFreelancers).map((freelancer) => (
          <div 
            key={freelancer._id} 
            className="bg-[#36393F] rounded-md overflow-hidden shadow-sm relative cursor-pointer hover:shadow-lg hover:bg-[#40444b] transition-all duration-150 group"
            onContextMenu={(e) => handleContextMenu(e, freelancer._id)}
          >
            <div className="absolute top-3 right-3 flex space-x-2">
              {renderStatus(freelancer)}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#202225]">
                    <img 
                      src={getImageUrl(freelancer.profileImage, freelancer._id)} 
                      alt={`${freelancer.firstName} ${freelancer.lastName}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(prev => ({ ...prev, [freelancer._id]: true }))}
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-medium">{freelancer.firstName} {freelancer.lastName}</h3>
                    <div className="flex space-x-1 mt-1">
                      {freelancer.role === 'freelancer_admin' ? (
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
                          freelancer.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {freelancer.role === 'admin' ? 'Admin' : 'Freelancer'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-3 h-3 text-gray-500 mr-2" />
                  <span className="truncate">{freelancer.email}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Phone className="w-3 h-3 text-gray-500 mr-2" />
                  <span>{freelancer.phone}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-3 h-3 text-gray-500 mr-2" />
                  <span>{freelancer.city}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-3 h-3 text-gray-500 mr-2" />
                  <span>Inscrit le {formatDate(freelancer.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Début du rendu du menu contextuel global ---
  const contextMenuElement = contextMenu && (() => {
    const freelancer = freelancers.find(f => f._id === contextMenu.userId);
    if (!freelancer) return null;
    const isAdmin = freelancer.role === 'freelancer_admin';
    return (
      <div
        ref={contextMenuRef}
        className="fixed z-[9999] bg-[#2F3136] border border-[#202225] rounded-md shadow-lg py-2 w-56"
        style={{ 
          top: contextMenu.y,
          left: contextMenu.x
        }}
        tabIndex={0}
        onBlur={closeContextMenu}
        onContextMenu={e => e.preventDefault()}
      >
        <button
          className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
          onClick={() => { setSelectedFreelancer(freelancer); closeContextMenu(); }}
        >
          <User className="w-4 h-4 mr-2 text-[#5865F2] flex-shrink-0" />
          Voir freelancer
        </button>
        {!freelancer.isEmailVerified && (
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
            onClick={() => { toggleUserVerification(freelancer._id, true); closeContextMenu(); }}
          >
            <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            Activer compte
          </button>
        )}
        {freelancer.isEmailVerified && (
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
            onClick={() => { toggleUserVerification(freelancer._id, false); closeContextMenu(); }}
          >
            <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
            Désactiver compte
          </button>
        )}
        {isFounder && (
          <>
            {!isAdmin ? (
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                onClick={() => { toggleAdminRole(freelancer._id, freelancer.role); closeContextMenu(); }}
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                Ajouter comme admin
              </button>
            ) : (
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                onClick={() => { toggleAdminRole(freelancer._id, freelancer.role); closeContextMenu(); }}
              >
                <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                Supprimer comme admin
              </button>
            )}
          </>
        )}
        <button
          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#36393F]"
          onClick={() => { deleteFreelancer(freelancer._id); closeContextMenu(); }}
        >
          <Trash className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
          Supprimer
        </button>
      </div>
    );
  })();

  return (
    <div onClick={() => activeFreelancerId && closeDropdown(activeFreelancerId)}>
      {viewMode === 'cards' ? renderCardView() : renderTableView()}
      {contextMenuElement}
      {renderDropdownMenu()}
      <FreelancerDetailsModal
        isOpen={!!selectedFreelancer}
        onClose={() => setSelectedFreelancer(null)}
        freelancer={selectedFreelancer}
      />
    </div>
  );
};

export default FreelancerList; 
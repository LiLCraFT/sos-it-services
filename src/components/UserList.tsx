import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Calendar, Mail, Phone, MapPin, MoreVertical, ChevronUp, ChevronDown, Grid, List, CheckCircle, XCircle, Trash, Edit, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type UserData = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  profileImage: string;
  createdAt: string;
  clientType?: string;
};

type SortField = 'firstName' | 'lastName' | 'email' | 'city' | 'createdAt';

interface UserListProps {
  viewMode: 'cards' | 'table';
  userType?: 'regular' | 'freelancer';
}

// URL de l'API backend
const API_URL = 'http://localhost:3001';

const UserList: React.FC<UserListProps> = ({ viewMode, userType = 'regular' }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number} | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const isFounder = user?.role === 'fondateur';
  
  // Nouveaux états pour les filtres
  const [clientTypeFilter, setClientTypeFilter] = useState<string | null>(null);
  const [freelancerTypeFilter, setFreelancerTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      for (const userId in dropdownOpen) {
        if (dropdownOpen[userId] && !dropdownRefs.current[userId]?.contains(event.target as Node)) {
          closeDropdown(userId);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
      alert('Impossible de charger la liste des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (dropdownOpen[userId]) {
      // Si déjà ouvert, fermer
      closeDropdown(userId);
      return;
    }
    
    // Calculer la position du menu à partir de l'événement
    const buttonRect = event.currentTarget.getBoundingClientRect();
    
    // Positionner le menu à droite du bouton
    setMenuPosition({
      top: buttonRect.bottom + window.scrollY,
      left: Math.max(10, buttonRect.left + window.scrollX - 220) // Décalage pour aligner le menu à gauche
    });
    
    setActiveUserId(userId);
    
    // Mettre à jour l'état d'ouverture du dropdown
    setDropdownOpen(prev => ({
      ...prev,
      [userId]: true
    }));
  };

  const closeDropdown = (userId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [userId]: false
    }));
    setActiveUserId(null);
  };

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortUsers = (usersToSort: UserData[]) => {
    return [...usersToSort].sort((a, b) => {
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

  const changeUserRole = async (userId: string, newRole: string) => {
    // Ne pas permettre de modifier le rôle d'un fondateur
    const userToChange = users.find(u => u._id === userId);
    if (userToChange?.role === 'fondateur') {
      alert('Impossible de modifier le rôle d\'un fondateur');
      return;
    }

    try {
      setActionInProgress({ ...actionInProgress, [userId]: true });
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du rôle');
      }
      
      // Mettre à jour la liste locale des utilisateurs
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId 
            ? { ...u, role: newRole } 
            : u
        )
      );
      
      alert(`Rôle de l'utilisateur modifié avec succès`);
      closeDropdown(userId);
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue');
    } finally {
      setActionInProgress({ ...actionInProgress, [userId]: false });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setActionInProgress({ ...actionInProgress, [userId]: true });
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
      }
      
      // Mettre à jour la liste locale des utilisateurs
      setUsers(prevUsers => 
        prevUsers.filter(u => u._id !== userId)
      );
      
      alert(`Utilisateur supprimé avec succès`);
      closeDropdown(userId);
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue');
    } finally {
      setActionInProgress({ ...actionInProgress, [userId]: false });
    }
  };

  // Filtrer les utilisateurs selon le type demandé (regular ou freelancer)
  const getFilteredUsers = () => {
    let filtered = [...users];
    
    if (userType === 'regular') {
      // Filtrer pour n'avoir que les utilisateurs normaux (non admin, non freelancers)
      filtered = users.filter(user => 
        user.role !== 'admin' && 
        user.role !== 'fondateur' && 
        user.role !== 'freelancer_admin' &&
        user.role !== 'freelancer'
      );
      
      // Appliquer le filtre par type de client si sélectionné
      if (clientTypeFilter) {
        filtered = filtered.filter(user => user.clientType === clientTypeFilter);
      }
    } else if (userType === 'freelancer') {
      // Filtrer pour n'avoir que les freelancers
      filtered = users.filter(user => 
        user.role === 'freelancer' || user.role === 'freelancer_admin'
      );
      
      // Appliquer le filtre par type de freelancer si sélectionné
      if (freelancerTypeFilter) {
        filtered = filtered.filter(user => user.role === freelancerTypeFilter);
      }
    }
    
    return filtered;
  };

  // Affiche les filtres disponibles selon le type d'utilisateurs
  const renderFilters = () => {
    if (userType === 'regular') {
      return (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Filtrer:</span>
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 text-sm rounded-md ${!clientTypeFilter ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#4F545C]'}`}
                onClick={() => setClientTypeFilter(null)}
              >
                Tous
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${clientTypeFilter === 'Particulier' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#4F545C]'}`}
                onClick={() => setClientTypeFilter('Particulier')}
              >
                Particuliers
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${clientTypeFilter === 'Professionnel' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#4F545C]'}`}
                onClick={() => setClientTypeFilter('Professionnel')}
              >
                Professionnels
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
    } else if (userType === 'freelancer') {
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
    }
    
    return null;
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
          onClick={fetchUsers} 
          className="mt-2 px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  if (filteredUsers.length === 0) {
    return (
      <div>
        {renderFilters()}
        <div className="p-4 bg-[#36393F] rounded-md text-center">
          <p className="text-gray-300">Aucun utilisateur trouvé.</p>
        </div>
      </div>
    );
  }

  // Helper pour afficher les tags de rôle
  const renderRoleTags = (role: string, user: UserData) => {
    switch(role) {
      case 'fondateur':
        return (
          <div className="flex space-x-1">
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
              Fondateur
            </span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              Admin
            </span>
          </div>
        );
      case 'admin':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
            Admin
          </span>
        );
      case 'freelancer_admin':
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
      case 'freelancer':
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
            Freelancer
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5865F2]/20 text-[#5865F2]">
            {user.clientType || 'Utilisateur'}
          </span>
        );
    }
  };

  // Rendu en mode tableau
  const renderTableView = () => {
    const sortedUsers = sortUsers(filteredUsers);
    
    // Helper pour afficher l'icône de tri
    const renderSortIcon = (field: SortField) => {
      if (sortField !== field) return null;
      return sortDirection === 'asc' ? 
        <ChevronUp className="w-4 h-4 ml-1" /> : 
        <ChevronDown className="w-4 h-4 ml-1" />;
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292b2f]">
              {sortedUsers.map((userData) => (
                <tr key={userData._id} className="hover:bg-[#36393F] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#202225]">
                      <img 
                        src={userData.profileImage || '/images/default-profile.png'} 
                        alt={`${userData.firstName} ${userData.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-profile.png';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {userData.firstName} {userData.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{userData.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{userData.city}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatDate(userData.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderRoleTags(userData.role, userData)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {userData.role !== 'fondateur' && (
                      <div className="relative flex justify-end">
                        <button 
                          onClick={(e) => toggleDropdown(userData._id, e)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                          aria-label="Plus d'options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
        {sortUsers(filteredUsers).map((user) => (
          <div key={user._id} className="bg-[#36393F] rounded-md overflow-hidden shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#202225]">
                    <img 
                      src={user.profileImage || '/images/default-profile.png'} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-profile.png';
                      }}
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-medium">{user.firstName} {user.lastName}</h3>
                    <div className="flex space-x-1 mt-1">
                      {renderRoleTags(user.role, user)}
                    </div>
                  </div>
                </div>
                {user.role !== 'fondateur' && (
                  <div className="relative flex justify-end">
                    <button 
                      onClick={(e) => toggleDropdown(user._id, e)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                      aria-label="Plus d'options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-3 h-3 text-gray-500 mr-2" />
                  <span className="truncate">{user.email}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Phone className="w-3 h-3 text-gray-500 mr-2" />
                  <span>{user.phone || 'Non renseigné'}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-3 h-3 text-gray-500 mr-2" />
                  <span>{user.city || 'Non renseigné'}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-3 h-3 text-gray-500 mr-2" />
                  <span>Inscrit le {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu du menu popup (à rendre une seule fois en dehors du tableau)
  const renderDropdownMenu = () => {
    if (!activeUserId || !menuPosition) return null;
    
    const userData = users.find(u => u._id === activeUserId);
    if (!userData) return null;
    
    // Ne pas afficher le menu pour les fondateurs
    if (userData.role === 'fondateur') return null;
    
    return (
      <div 
        ref={el => dropdownRefs.current[activeUserId] = el}
        className="fixed z-50 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225]"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`
        }}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          <button 
            onClick={() => alert('Édition non implémentée')} // À implémenter
            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
            disabled={actionInProgress[activeUserId]}
          >
            <Edit className="w-4 h-4 mr-2 text-[#5865F2] flex-shrink-0" />
            <span>Modifier l'utilisateur</span>
          </button>
          
          <button 
            onClick={() => deleteUser(activeUserId)}
            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors text-red-400"
            disabled={actionInProgress[activeUserId]}
          >
            <Trash className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
            <span>Supprimer l'utilisateur</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div onClick={() => activeUserId && closeDropdown(activeUserId)}>
      {viewMode === 'cards' ? renderCardView() : renderTableView()}
      {renderDropdownMenu()}
    </div>
  );
};

export default UserList; 
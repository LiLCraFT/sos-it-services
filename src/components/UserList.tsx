import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, Mail, MapPin, ChevronUp, ChevronDown, CheckCircle, XCircle, Trash, Edit, Filter, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FreelancerDetailsModal from './FreelancerDetailsModal';
import Pagination from './ui/Pagination';
import { getImageUrl } from '../utils/imageUtils';

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
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  emailVerificationToken?: string | null;
};

type SortField = 'firstName' | 'lastName' | 'email' | 'city' | 'createdAt';

interface UserListProps {
  viewMode: 'cards' | 'table';
  userType?: 'regular' | 'freelancer';
}

// URL de l'API backend
const API_URL = 'http://localhost:3001';

// Tooltip simple
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <span className="relative group cursor-pointer">
    {children}
    <span className="absolute z-[9999] left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-2 py-1 rounded bg-black text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
      {text}
    </span>
  </span>
);

const UserList: React.FC<UserListProps> = ({ viewMode, userType = 'regular' }) => {
  useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [menuPosition] = useState<{top: number, left: number} | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  
  // Nouveaux états pour les filtres
  const [clientTypeFilter, setClientTypeFilter] = useState<string | null>(null);
  const [freelancerTypeFilter, setFreelancerTypeFilter] = useState<string | null>(null);

  // Ajout d'un état pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; userId: string | null } | null>(null);

  // Ajout d'une ref pour le menu contextuel
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [, setImageError] = useState<Record<string, boolean>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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

  // Fermer le menu contextuel si clic en dehors
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  useEffect(() => { setCurrentPage(1); }, [sortField, sortDirection, clientTypeFilter, freelancerTypeFilter, users]);

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

  const toggleUserVerification = async (userId: string, isEmailVerified?: boolean, isAdminVerified?: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/toggle-user-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId,
          isEmailVerified,
          isAdminVerified,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut de vérification');
      }

      // Mettre à jour la liste des utilisateurs
      const updatedUsers = users.map(user => {
        if (user._id === userId) {
          return {
            ...user,
            isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : user.isEmailVerified,
            isAdminVerified: isAdminVerified !== undefined ? isAdminVerified : user.isAdminVerified,
            // Si le compte est activé, on supprime le token de vérification
            // Si le compte est désactivé, on garde le token null
            emailVerificationToken: isEmailVerified ? null : user.emailVerificationToken
          };
        }
        return user;
      });
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error toggling user verification:', error);
      alert('Erreur lors de la mise à jour du statut de vérification');
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

  // Fonction pour ouvrir le menu contextuel
  const handleContextMenu = (event: React.MouseEvent, userId: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      userId,
    });
  };

  // Fonction pour fermer le menu contextuel
  const closeContextMenu = () => setContextMenu(null);


  const renderStatus = (user: UserData) => (
    <div className="flex items-center justify-center space-x-2">
      {user.isEmailVerified ? (
        <Tooltip text="Compte activé">
          <CheckCircle className="w-4 h-4 text-green-500" />
        </Tooltip>
      ) : user.emailVerificationToken ? (
        <Tooltip text="En attente d'activation">
          <Clock className="w-4 h-4 text-yellow-400" />
        </Tooltip>
      ) : (
        <Tooltip text="Compte désactivé">
          <XCircle className="w-4 h-4 text-red-500" />
        </Tooltip>
      )}
      {user.role === 'freelancer' && (
        user.isAdminVerified ? (
          <Tooltip text="Freelancer validé par l'admin">
            <CheckCircle className="w-4 h-4 text-yellow-400" />
          </Tooltip>
        ) : (
          <Tooltip text="En attente de validation admin">
            <Clock className="w-4 h-4 text-yellow-400" />
          </Tooltip>
        )
      )}
    </div>
  );

  // Rendu en mode tableau
  const renderTableView = () => {
    const sortedUsers = sortUsers(filteredUsers);
    const totalUsers = sortedUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const paginatedUsers = sortedUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
    
    return (
      <div className="w-full">
        {renderFilters()}
        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-[#292b2f]">
            <thead className="bg-[#202225]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[20%]">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[20%]">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">
                  Ville
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[10%]">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292b2f]">
              {paginatedUsers.map((userData) => (
                <tr key={userData._id} className="hover:bg-[#36393F] transition-colors cursor-pointer" onContextMenu={(e) => handleContextMenu(e, userData._id)}>
                  <td className="px-6 py-4 text-sm text-white">
                    {userData.firstName} {userData.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{userData.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{userData.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatDate(userData.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderRoleTags(userData.role, userData)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">
                    {renderStatus(userData)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          {/* Menu contextuel */}
          {contextMenu && (() => {
            const user = users.find(u => u._id === contextMenu.userId);
            if (!user) return null;
            const isFreelancer = user.clientType === 'Freelancer';
            return (
              <div
                ref={contextMenuRef}
                className="fixed z-50 bg-[#2F3136] border border-[#202225] rounded-md shadow-lg py-2 w-56"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                tabIndex={0}
                onBlur={closeContextMenu}
                onContextMenu={e => e.preventDefault()}
              >
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                  onClick={() => { setSelectedUser(user); closeContextMenu(); }}
                >
                  <User className="w-4 h-4 mr-2 text-[#5865F2] flex-shrink-0" />
                  Voir utilisateur
                </button>
                {/* Email verification logic */}
                {!user.isEmailVerified && (
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                    onClick={() => { toggleUserVerification(user._id, true); closeContextMenu(); }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                    Activer compte
                  </button>
                )}
                {user.isEmailVerified && (
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                    onClick={() => { toggleUserVerification(user._id, false); closeContextMenu(); }}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                    Désactiver compte
                  </button>
                )}
                {/* Admin verification logic for freelancers */}
                {isFreelancer && !user.isAdminVerified && (
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                    onClick={() => { toggleUserVerification(user._id, undefined, true); closeContextMenu(); }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                    Activer admin
                  </button>
                )}
                {isFreelancer && user.isAdminVerified && (
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                    onClick={() => { toggleUserVerification(user._id, undefined, false); closeContextMenu(); }}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                    Désactiver admin
                  </button>
                )}
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#36393F]"
                  onClick={() => { deleteUser(user._id); closeContextMenu(); }}
                >
                  <Trash className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                  Supprimer
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  // Rendu en mode carte
  const renderCardView = () => {
    const sortedUsers = sortUsers(filteredUsers);
    const totalUsers = sortedUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const paginatedUsers = sortedUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
    
    return (
      <div>
        {renderFilters()}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUsers.map((user) => (
            <div
              key={user._id}
              className="bg-[#36393F] rounded-lg p-4 hover:bg-[#40444b] transition-colors relative"
              onContextMenu={(e) => handleContextMenu(e, user._id)}
            >
              <div className="absolute top-3 right-3">
                {renderStatus(user)}
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#202225]">
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(prev => ({ ...prev, [user._id]: true }))}
                    key={user.profileImage}
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="mt-1">
                    {renderRoleTags(user.role, user)}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300 text-sm truncate">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300 text-sm">{user.city || 'Non renseignée'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-300 text-sm">Inscrit le {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        {/* Menu contextuel pour la vue carte */}
        {contextMenu && (() => {
          const user = users.find(u => u._id === contextMenu.userId);
          if (!user) return null;
          const isFreelancer = user.clientType === 'Freelancer';
          return (
            <div
              ref={contextMenuRef}
              className="fixed z-50 bg-[#2F3136] border border-[#202225] rounded-md shadow-lg py-2 w-56"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              tabIndex={0}
              onBlur={closeContextMenu}
              onContextMenu={e => e.preventDefault()}
            >
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                onClick={() => { setSelectedUser(user); closeContextMenu(); }}
              >
                <User className="w-4 h-4 mr-2 text-[#5865F2] flex-shrink-0" />
                Voir utilisateur
              </button>
              {/* Email verification logic */}
              {!user.isEmailVerified && (
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                  onClick={() => { toggleUserVerification(user._id, true); closeContextMenu(); }}
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  Activer compte
                </button>
              )}
              {user.isEmailVerified && (
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                  onClick={() => { toggleUserVerification(user._id, false); closeContextMenu(); }}
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                  Désactiver compte
                </button>
              )}
              {/* Admin verification logic for freelancers */}
              {isFreelancer && !user.isAdminVerified && (
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                  onClick={() => { toggleUserVerification(user._id, undefined, true); closeContextMenu(); }}
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  Activer admin
                </button>
              )}
              {isFreelancer && user.isAdminVerified && (
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
                  onClick={() => { toggleUserVerification(user._id, undefined, false); closeContextMenu(); }}
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                  Désactiver admin
                </button>
              )}
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#36393F]"
                onClick={() => { deleteUser(user._id); closeContextMenu(); }}
              >
                <Trash className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                Supprimer
              </button>
            </div>
          );
        })()}
      </div>
    );
  };

  // Rendu du menu popup (à rendre une seule fois en dehors du tableau)
  const renderDropdownMenu = () => {
    if (!activeUserId || !menuPosition) return null;
    
    const userData = users.find(u => u._id === activeUserId);
    if (!userData) return null;
    
    // Ne pas afficher le menu pour les fondateurs
    if (userData.role === 'fondateur') return null;
    
    return (
      <div 
        ref={el => { dropdownRefs.current[activeUserId] = el; }}
        className="fixed z-50 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225]"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`
        }}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          <button 
            onClick={() => alert('Édition non implémentée')}
            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
            disabled={actionInProgress[activeUserId]}
          >
            <Edit className="w-4 h-4 mr-2 text-[#5865F2] flex-shrink-0" />
            <span>Modifier l'utilisateur</span>
          </button>
          
          <button 
            onClick={() => toggleUserVerification(activeUserId, !userData.isEmailVerified)}
            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
            disabled={actionInProgress[activeUserId]}
          >
            {userData.isEmailVerified ? (
              <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            )}
            <span>{userData.isEmailVerified ? 'Désactiver' : 'Activer'} l'email</span>
          </button>
          
          {userData.clientType === 'Freelancer' && (
            <button 
              onClick={() => toggleUserVerification(activeUserId, undefined, !userData.isAdminVerified)}
              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
              disabled={actionInProgress[activeUserId]}
            >
              {userData.isAdminVerified ? (
                <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              )}
              <span>{userData.isAdminVerified ? 'Désactiver' : 'Activer'} l'admin</span>
            </button>
          )}
          
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

  return (
    <div onClick={() => activeUserId && closeDropdown(activeUserId)}>
      {viewMode === 'cards' ? renderCardView() : renderTableView()}
      {renderDropdownMenu()}
      <FreelancerDetailsModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        freelancer={selectedUser ? {
          ...selectedUser,
          isEmailVerified: selectedUser.isEmailVerified ?? false,
          isAdminVerified: selectedUser.isAdminVerified ?? false,
        } : null}
      />
    </div>
  );
};

export default UserList; 
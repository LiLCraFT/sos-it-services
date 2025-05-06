import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Calendar, Mail, Phone, MapPin, MoreVertical, ChevronUp, ChevronDown, Grid, List, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
};

type SortField = 'firstName' | 'lastName' | 'email' | 'city' | 'createdAt';

interface FreelancerListProps {
  viewMode: 'cards' | 'table';
}

// URL de l'API backend
const API_URL = 'http://localhost:3001';

const FreelancerList: React.FC<FreelancerListProps> = ({ viewMode }) => {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState<FreelancerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const toggleDropdown = (freelancerId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [freelancerId]: !prev[freelancerId]
    }));
  };

  const closeDropdown = (freelancerId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [freelancerId]: false
    }));
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
      const isCurrentlyAdmin = currentRole === 'freelancer_admin';
      const isAdmin = !isCurrentlyAdmin;
      
      const response = await fetch(`${API_URL}/api/freelancers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ freelancerId, isAdmin })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du rôle');
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
      alert(err.message || 'Une erreur est survenue');
    } finally {
      setActionInProgress({ ...actionInProgress, [freelancerId]: false });
    }
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

  if (freelancers.length === 0) {
    return (
      <div className="p-4 bg-[#36393F] rounded-md text-center">
        <p className="text-gray-300">Aucun freelancer trouvé.</p>
      </div>
    );
  }

  // Rendu en mode tableau
  const renderTableView = () => {
    const sortedFreelancers = sortFreelancers(freelancers);
    
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
            {sortedFreelancers.map((freelancer) => (
              <tr key={freelancer._id} className="hover:bg-[#36393F] transition-colors">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#202225]">
                    <img 
                      src={freelancer.profileImage || '/images/default-profile.png'} 
                      alt={`${freelancer.firstName} ${freelancer.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-profile.png';
                      }}
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
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown(freelancer._id)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                      aria-label="Plus d'options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {dropdownOpen[freelancer._id] && (
                      <div 
                        ref={el => dropdownRefs.current[freelancer._id] = el}
                        className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225] z-10"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button 
                            onClick={() => toggleAdminRole(freelancer._id, freelancer.role)}
                            className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
                            disabled={actionInProgress[freelancer._id]}
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
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Rendu en mode carte
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {freelancers.map((freelancer) => (
        <div key={freelancer._id} className="bg-[#36393F] rounded-md overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#202225]">
                  <img 
                    src={freelancer.profileImage || '/images/default-profile.png'} 
                    alt={`${freelancer.firstName} ${freelancer.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-profile.png';
                    }}
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
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown(freelancer._id)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                  aria-label="Plus d'options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {dropdownOpen[freelancer._id] && (
                  <div 
                    ref={el => dropdownRefs.current[freelancer._id] = el}
                    className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225] z-10"
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button 
                        onClick={() => toggleAdminRole(freelancer._id, freelancer.role)}
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
                        disabled={actionInProgress[freelancer._id]}
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
                    </div>
                  </div>
                )}
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
  );

  return (
    <div>
      {viewMode === 'cards' ? renderCardView() : renderTableView()}
    </div>
  );
};

export default FreelancerList; 
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Check, Clock, AlertTriangle, FileText, MessageCircle, Folder, Calendar, User, Flag, UserCheck, Paperclip, Image, FileIcon, Download, X, CheckCircle, MoreVertical, ExternalLink, List, Grid, ChevronUp, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Attachment {
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'diagnostic' | 'online' | 'onsite' | 'failed' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  subcategory: string;
  attachments?: Attachment[];
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TicketListProps {
  viewMode: 'cards' | 'table';
}

const TicketList: React.FC<TicketListProps> = ({ viewMode }) => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<{[key: string]: boolean}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const [sortField, setSortField] = useState<keyof Ticket>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/tickets', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  const toggleDropdown = (ticketId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const closeDropdown = (ticketId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [ticketId]: false
    }));
  };

  const assignTicket = async (ticketId: string) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [ticketId]: true }));
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié');
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'in_progress' })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'assignation du ticket');
      }
      
      // Mettre à jour l'état local du ticket
      setTickets(prevTickets => 
        prevTickets.filter(ticket => ticket._id !== ticketId)
      );
      
      closeDropdown(ticketId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  // Retourner un icône basé sur la priorité
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return <AlertCircle className="w-5 h-5 text-green-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Retourner une classe CSS basée sur le statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'diagnostic':
        return 'bg-blue-100 text-blue-800';
      case 'online':
        return 'bg-cyan-100 text-cyan-800';
      case 'onsite':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Traduire le statut
  const translateStatus = (status: string) => {
    switch (status) {
      case 'diagnostic':
        return 'Diagnostic';
      case 'online':
        return 'En ligne';
      case 'onsite':
        return 'À domicile';
      case 'failed':
        return 'Échec';
      case 'resolved':
        return 'Résolu';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  };

  // Traduire la priorité
  const translatePriority = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Basse';
      case 'medium':
        return 'Moyenne';
      case 'high':
        return 'Haute';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  };

  // Renvoie l'icône appropriée selon le type de fichier
  const getAttachmentIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-400" />;
    }
    return <FileText className="w-4 h-4 text-gray-400" />;
  };
  
  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Fonction de tri des tickets
  const sortTickets = (ticketsToSort: Ticket[]): Ticket[] => {
    return [...ticketsToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          const categoryA = a.category || 'Autre';
          const categoryB = b.category || 'Autre';
          comparison = categoryA.localeCompare(categoryB);
          break;
        case 'priority': {
          const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        }
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Gérer le clic sur un en-tête de colonne
  const handleSort = (field: keyof Ticket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Gestion de la fermeture des dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownOpen).forEach(([ticketId, isOpen]) => {
        if (isOpen && dropdownRefs.current[ticketId] && !dropdownRefs.current[ticketId]?.contains(event.target as Node)) {
          closeDropdown(ticketId);
        }
      });
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Filtrage des tickets
  const getFilteredTickets = () => {
    let filteredTickets = tickets;

    if (statusFilter) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
    }
    if (priorityFilter) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
    }
    if (categoryFilter) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === categoryFilter);
    }

    return sortTickets(filteredTickets);
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-300">Chargement des tickets...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 my-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return <div className="text-center py-4 text-gray-300">Aucun ticket non assigné trouvé</div>;
  }

  // Rendu en mode tableau
  const renderTableView = () => {
    const sortedTickets = getFilteredTickets();
    
    // Helper pour afficher l'icône de tri
    const renderSortIcon = (field: keyof Ticket) => {
      if (sortField !== field) return null;
      return sortDirection === 'asc' ? 
        <ChevronUp className="w-4 h-4 ml-1" /> : 
        <ChevronDown className="w-4 h-4 ml-1" />;
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#2F3136] rounded-md overflow-hidden">
          <thead className="bg-[#202225]">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  <span>Statut</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  <span>Titre</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  <span>Catégorie</span>
                  {renderSortIcon('category')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  <span>Priorité</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  <span>Créé le</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292b2f]">
            {sortedTickets.map((ticket) => (
              <tr key={ticket._id} className="hover:bg-[#36393F] transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                    {translateStatus(ticket.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white">{ticket.title}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Folder className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">
                      {ticket.category || 'Autre'}{(ticket.subcategory && ticket.subcategory !== 'Non spécifié') ? ` > ${ticket.subcategory}` : ticket.category ? '' : ' > Non spécifié'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {getPriorityIcon(ticket.priority)}
                    <span className="ml-1 text-sm text-gray-300">{translatePriority(ticket.priority)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{formatDate(ticket.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <a
                      href={`/tickets/${ticket._id}`}
                      className="text-blue-500 hover:text-blue-400 mr-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(ticket._id)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                        aria-label="Plus d'options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {dropdownOpen[ticket._id] && (
                        <div 
                          ref={el => dropdownRefs.current[ticket._id] = el}
                          className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225] z-10"
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <a
                              href={`/tickets/${ticket._id}`}
                              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                              role="menuitem"
                            >
                              <ExternalLink className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                              <span className="truncate">Voir les détails</span>
                            </a>
                            
                            <div className="my-1 border-t border-[#202225]"></div>
                            
                            <button
                              onClick={() => assignTicket(ticket._id)}
                              disabled={updateLoading[ticket._id]}
                              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                              role="menuitem"
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                              <span className="truncate">S'assigner le ticket</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket._id} className="bg-[#36393F] rounded-md p-4 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center">
              {getPriorityIcon(ticket.priority)}
              <h3 className="text-white font-medium ml-2">{ticket.title}</h3>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                {translateStatus(ticket.status)}
              </span>
              
              <div className="relative ml-2">
                <button 
                  onClick={() => toggleDropdown(ticket._id)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                  aria-label="Plus d'options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {dropdownOpen[ticket._id] && (
                  <div 
                    ref={el => dropdownRefs.current[ticket._id] = el}
                    className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225] z-10"
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <a
                        href={`/tickets/${ticket._id}`}
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                        role="menuitem"
                        onClick={() => closeDropdown(ticket._id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">Voir les détails</span>
                      </a>
                      
                      <div className="my-1 border-t border-[#202225]"></div>
                      
                      <button
                        onClick={() => assignTicket(ticket._id)}
                        disabled={updateLoading[ticket._id]}
                        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                        role="menuitem"
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                        <span className="truncate">S'assigner le ticket</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-400 mb-3 ml-7">
            <Folder className="w-3 h-3 mr-1" />
            <span>{ticket.category || 'Autre'}{(ticket.subcategory && ticket.subcategory !== 'Non spécifié') ? ` > ${ticket.subcategory}` : ticket.category ? '' : ' > Non spécifié'}</span>
          </div>
          
          <div className="ml-7">
            <div className="flex items-center mb-2">
              <MessageCircle className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-300 text-xs font-medium">Description du problème</span>
            </div>
            <p className="text-white text-sm whitespace-pre-line">{ticket.description}</p>
            
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#202225]">
                <div className="flex items-center mb-2">
                  <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-300 text-xs font-medium">Pièces jointes ({ticket.attachments.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ticket.attachments.map((attachment, index) => (
                    <a 
                      key={index}
                      href={`http://localhost:3001${attachment.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-[#202225] p-2 rounded hover:bg-[#2D3035] transition-colors"
                    >
                      {getAttachmentIcon(attachment.mimetype)}
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="text-white text-xs truncate">{attachment.originalname}</div>
                        <div className="text-gray-400 text-[10px]">{formatFileSize(attachment.size)}</div>
                      </div>
                      <Download className="w-3 h-3 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#202225] ml-7 space-y-2">
            <div className="flex items-center">
              <User className="w-3 h-3 text-gray-500 mr-1" />
              <span className="font-medium mr-1">Créé par:</span>
              <span>{ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-3 h-3 text-gray-500 mr-1" />
              <span className="font-medium mr-1">Créé le:</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
            
            <div className="flex items-center">
              <Flag className="w-3 h-3 text-gray-500 mr-1" />
              <span className="font-medium mr-1">Priorité:</span>
              <span>{translatePriority(ticket.priority)}</span>
            </div>
            
            {ticket.targetUser && (
              <div className="flex items-center">
                <UserCheck className="w-3 h-3 text-gray-500 mr-1" />
                <span className="font-medium mr-1">Pour:</span>
                <span>{ticket.targetUser.firstName} {ticket.targetUser.lastName}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {renderTableView()}
    </div>
  );
};

export default TicketList; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Check, Clock, AlertTriangle, FileText, MessageCircle, Folder, Calendar, User, Flag, UserCheck, Paperclip, Image, FileIcon, Download, X, CheckCircle, MoreVertical, ExternalLink } from 'lucide-react';

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
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
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

const TicketList: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<{[key: string]: boolean}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});

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

  const updateTicketStatus = async (ticketId: string, status: 'closed' | 'resolved') => {
    try {
      setUpdateLoading(prev => ({ ...prev, [ticketId]: true }));
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié');
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du ticket');
      }
      
      // Mettre à jour l'état local du ticket
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? { ...ticket, status } : ticket
        )
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
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'open':
        return 'Ouvert';
      case 'in_progress':
        return 'En cours';
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
    return <div className="text-center py-4 text-gray-300">Aucun ticket trouvé</div>;
  }

  return (
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
              
              {user && ticket.createdBy._id === user._id && ticket.status !== 'closed' && (
                <div className="relative ml-2">
                  <button 
                    onClick={() => toggleDropdown(ticket._id)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-[#4F545C] rounded-full transition-colors"
                    aria-label="Plus d'options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {dropdownOpen[ticket._id] && (
                    <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-[#2F3136] border border-[#202225] z-10">
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
                          onClick={() => updateTicketStatus(ticket._id, 'resolved')}
                          disabled={updateLoading[ticket._id]}
                          className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                          role="menuitem"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                          <span className="truncate">Marquer comme résolu</span>
                        </button>
                        <button
                          onClick={() => updateTicketStatus(ticket._id, 'closed')}
                          disabled={updateLoading[ticket._id]}
                          className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                          role="menuitem"
                        >
                          <X className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                          <span className="truncate">Clôturer le ticket</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-400 mb-3 ml-7">
            <Folder className="w-3 h-3 mr-1" />
            <span>{ticket.category || 'Autre'}{(ticket.subcategory && ticket.subcategory !== 'Non spécifié') ? ` > ${ticket.subcategory}` : ticket.category ? '' : ' > Non spécifié'}</span>
          </div>
          
          <div className="bg-[#2F3136] border border-[#202225] rounded-md p-3 mb-3">
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
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-2">
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
};

export default TicketList; 
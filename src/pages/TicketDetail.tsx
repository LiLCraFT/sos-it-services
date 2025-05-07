import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Check, Clock, FileText, MessageCircle, Folder, Calendar, User, Flag, UserCheck, Paperclip, Image, Download, X, CheckCircle, ArrowLeft, History, CheckSquare, RefreshCw, List, MoreVertical, ChevronDown } from 'lucide-react';

interface Attachment {
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}

interface AuditEvent {
  date: Date;
  action: string;
  user: {
    _id: string;
    name: string;
  };
  details?: any;
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
  auditTrail?: AuditEvent[];
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

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError('Non authentifié');
          return;
        }
        
        const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du ticket');
        }
        
        const data = await response.json();
        setTicket(data.ticket);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, isAuthenticated]);

  const updateTicketStatus = async (status: 'diagnostic' | 'online' | 'onsite' | 'failed' | 'resolved' | 'closed') => {
    if (!ticket) return;
    
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié');
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
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
      
      const data = await response.json();
      setTicket(data.ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Vérifier si un utilisateur peut modifier un ticket
  const canModifyTicket = (): boolean => {
    if (!user || !ticket) return false;
    
    // L'utilisateur doit être le créateur du ticket
    return ticket.createdBy._id === user._id;
  };

  // Retourner un icône basé sur la priorité
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return <AlertTriangle className="w-6 h-6 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="w-6 h-6 text-blue-500" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'urgent':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
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

  // Renvoie l'icône appropriée selon le type de fichier
  const getAttachmentIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-400" />;
    }
    return <FileText className="w-5 h-5 text-gray-400" />;
  };
  
  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
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

  // Fonction pour obtenir une icône et une couleur pour chaque type d'action
  const getAuditActionInfo = (action: string) => {
    switch (action) {
      case 'creation':
        return { 
          icon: <CheckSquare className="w-4 h-4" />, 
          color: 'text-blue-400', 
          label: 'Création du ticket' 
        };
      case 'status_change':
        return { 
          icon: <RefreshCw className="w-4 h-4" />, 
          color: 'text-yellow-400', 
          label: 'Changement de statut' 
        };
      case 'assignment':
        return { 
          icon: <UserCheck className="w-4 h-4" />, 
          color: 'text-green-400', 
          label: 'Assignation' 
        };
      case 'update':
      default:
        return { 
          icon: <Clock className="w-4 h-4" />, 
          color: 'text-gray-400', 
          label: 'Mise à jour' 
        };
    }
  };

  // Fonction pour formater un événement d'audit en texte lisible
  const formatAuditEvent = (event: AuditEvent) => {
    const { action, details } = event;
    
    switch (action) {
      case 'creation':
        return 'Ticket créé';
      case 'status_change':
        if (details?.from && details?.to) {
          return `Statut changé de "${translateStatus(details.from)}" à "${translateStatus(details.to)}"`;
        }
        return 'Statut mis à jour';
      case 'assignment':
        if (details?.toName) {
          return `Assigné à ${details.toName}`;
        }
        return 'Assignation modifiée';
      case 'update':
      default:
        return 'Ticket mis à jour';
    }
  };

  // Fonction pour fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('action-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-300">Chargement des détails du ticket...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-6 my-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-red-500">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-300">Ticket non trouvé</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
      </div>
      
      <div className="bg-[#36393F] rounded-lg shadow-md">
        {/* En-tête du ticket */}
        <div className="border-b border-[#202225] p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {getPriorityIcon(ticket.priority)}
              <h1 className="text-2xl font-semibold text-white ml-3">{ticket.title}</h1>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${getStatusClass(ticket.status)}`}>
                {translateStatus(ticket.status)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-400 mt-2 ml-9">
            <Folder className="w-4 h-4 mr-1" />
            <span>{ticket.category || 'Autre'}{(ticket.subcategory && ticket.subcategory !== 'Non spécifié') ? ` > ${ticket.subcategory}` : ticket.category ? '' : ' > Non spécifié'}</span>
          </div>
        </div>
        
        {/* Corps du ticket */}
        <div className="p-6">
          {/* Métadonnées du ticket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#2F3136] rounded-md p-4">
              <h3 className="text-md font-medium text-gray-300 mb-3">Informations</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-300">Créé par: <span className="text-white">{ticket.createdBy.firstName} {ticket.createdBy.lastName}</span></span>
                </div>
                
                {ticket.assignedTo && (
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-300">Assigné à: <span className="text-white">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span></span>
                  </div>
                )}
                
                {ticket.targetUser && (
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-300">Pour: <span className="text-white">{ticket.targetUser.firstName} {ticket.targetUser.lastName}</span></span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Flag className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-300">Priorité: <span className="text-white">{translatePriority(ticket.priority)}</span></span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#2F3136] rounded-md p-4">
              <h3 className="text-md font-medium text-gray-300 mb-3">Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-300">Créé le: <span className="text-white">{formatDate(ticket.createdAt)}</span></span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-300">Dernière mise à jour: <span className="text-white">{formatDate(ticket.updatedAt)}</span></span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description du problème */}
          <div className="bg-[#2F3136] border border-[#202225] rounded-md p-5 mb-6">
            <div className="flex items-center mb-3">
              <MessageCircle className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-300 text-sm font-medium">Description du problème</span>
            </div>
            <p className="text-white whitespace-pre-line">{ticket.description}</p>
          </div>
          
          {/* Pièces jointes */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-[#2F3136] border border-[#202225] rounded-md p-5 mb-6">
              <div className="flex items-center mb-3">
                <Paperclip className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-300 text-sm font-medium">Pièces jointes ({ticket.attachments.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ticket.attachments.map((attachment, index) => (
                  <a 
                    key={index}
                    href={`http://localhost:3001${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-[#202225] p-3 rounded hover:bg-[#2D3035] transition-colors"
                  >
                    {getAttachmentIcon(attachment.mimetype)}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{attachment.originalname}</div>
                      <div className="text-gray-400 text-xs">{formatFileSize(attachment.size)}</div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action et retour */}
      <div className="flex justify-end mt-6 space-x-3">
        {/* Dropdown des actions */}
        {canModifyTicket() && ticket.status !== 'closed' && (
          <div className="relative" id="action-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center px-4 py-2 bg-[#424549] hover:bg-[#36393F] text-white rounded-md transition-colors shadow-md"
            >
              <MoreVertical className="w-4 h-4 mr-2" />
              Actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-[#2F3136] border border-[#202225] z-10">
                <div className="py-1" role="menu">
                  {ticket.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        updateTicketStatus('resolved');
                        setDropdownOpen(false);
                      }}
                      disabled={updateLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors whitespace-nowrap"
                      role="menuitem"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span>Marquer comme résolu</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      updateTicketStatus('closed');
                      setDropdownOpen(false);
                    }}
                    disabled={updateLoading}
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#36393F] transition-colors"
                    role="menuitem"
                  >
                    <X className="w-4 h-4 mr-2 text-red-500" />
                    <span>Clôturer le ticket</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Bouton pour revenir à la liste */}
        <button
          onClick={() => {
            // Pas besoin de passer de paramètre ici, car le mode d'affichage est stocké dans localStorage
            navigate('/mon-espace?tab=tickets');
          }}
          className="flex items-center px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md transition-colors shadow-md"
        >
          <List className="w-4 h-4 mr-2" />
          Revenir à la liste
        </button>
      </div>
      
      {/* Historique d'audit */}
      {ticket.auditTrail && ticket.auditTrail.length > 0 && (
        <div className="bg-[#36393F] border border-[#202225] rounded-md p-5 mt-6">
          <div className="flex items-center mb-4">
            <History className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-300 text-sm font-medium">Historique des actions</span>
          </div>
          
          <div className="space-y-3">
            {ticket.auditTrail.slice().reverse().map((event, index) => {
              const { icon, color, label } = getAuditActionInfo(event.action);
              const date = new Date(event.date);
              
              return (
                <div key={index} className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full bg-[#202225] flex items-center justify-center ${color}`}>
                      {icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-sm font-medium text-white">
                        {label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(date.toISOString())}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      {formatAuditEvent(event)}
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                      Par {event.user.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail; 
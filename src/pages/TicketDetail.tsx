import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Check, Clock, FileText, MessageCircle, Folder, Calendar, User, Flag, UserCheck, Paperclip, Image, Download, X, CheckCircle, ArrowLeft } from 'lucide-react';

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

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const updateTicketStatus = async (status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
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
          
          {/* Actions sur le ticket */}
          {canModifyTicket() && ticket.status !== 'closed' && (
            <div className="bg-[#2F3136] border border-[#202225] rounded-md p-5">
              <div className="flex items-center mb-3">
                <span className="text-gray-300 text-sm font-medium">Actions</span>
              </div>
              <div className="flex space-x-3">
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => updateTicketStatus('resolved')}
                    disabled={updateLoading}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer comme résolu
                  </button>
                )}
                
                <button
                  onClick={() => updateTicketStatus('closed')}
                  disabled={updateLoading}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clôturer le ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Check, Clock, AlertTriangle } from 'lucide-react';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

  // Retourner un icône basé sur le statut du ticket
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <Check className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Retourner une classe CSS basée sur la priorité
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
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
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              {getStatusIcon(ticket.status)}
              <h3 className="text-white font-medium ml-2">{ticket.title}</h3>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
              {translatePriority(ticket.priority)}
            </span>
          </div>
          
          <p className="text-gray-300 text-sm mb-3">{ticket.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
            <div>
              <span className="font-medium">Créé par:</span> {ticket.createdBy.firstName} {ticket.createdBy.lastName}
            </div>
            {ticket.targetUser && (
              <div>
                <span className="font-medium">Pour:</span> {ticket.targetUser.firstName} {ticket.targetUser.lastName}
              </div>
            )}
            <div>
              <span className="font-medium">Statut:</span> {translateStatus(ticket.status)}
            </div>
            <div>
              <span className="font-medium">Créé le:</span> {formatDate(ticket.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList; 
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Check, Clock, AlertTriangle, FileText, MessageCircle, Folder, Calendar, User, Flag, UserCheck, Paperclip, Image, FileIcon, Download, X, CheckCircle, MoreVertical, ExternalLink, List, Grid, ChevronUp, ChevronDown, Trash2, Hand, History, RefreshCw, CheckSquare, Circle, Search, Archive } from 'lucide-react';
import { Modal } from './ui/Modal';
import FreelancerDetailsModal from './FreelancerDetailsModal';

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
  status: 'libre' | 'diagnostic' | 'online' | 'onsite' | 'failed' | 'resolved' | 'closed';
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
    profileImage?: string;
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

type SortField = 'status' | 'title' | 'category' | 'priority' | 'createdAt' | 'createdBy';
type SortDirection = 'asc' | 'desc';

const TICKET_STATUSES = [
  'libre',
  'diagnostic',
  'online',
  'onsite',
  'failed',
  'resolved',
  'closed',
];

const TicketList: React.FC<TicketListProps> = ({ viewMode }) => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<{[key: string]: boolean}>({});
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; ticketId: string | null } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [modalTicket, setModalTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<string>('tous');
  const [showAdminView, setShowAdminView] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showAdminView');
      return stored === 'true';
    }
    return false;
  });
  const [viewSwitch, setViewSwitch] = useState<'cards' | 'table'>(viewMode);
  const [showFreelancerModal, setShowFreelancerModal] = useState(false);
  const [modalFreelancer, setModalFreelancer] = useState<any>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeDescription, setCloseDescription] = useState('');
  const [closeRating, setCloseRating] = useState(5);
  const [closeModalTicket, setCloseModalTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching tickets...'); // Log pour déboguer
      const response = await fetch('http://localhost:3001/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des tickets');
      }
      
      const data = await response.json();
      console.log('Tickets received:', data.tickets.length); // Log pour déboguer
      console.log('First ticket (if any):', data.tickets.length > 0 ? data.tickets[0] : 'No tickets'); // Log pour déboguer
      setTickets(data.tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err); // Log pour déboguer
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    } else {
      setError('Veuillez vous connecter pour accéder aux tickets');
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

  const updateTicketStatus = async (ticketId: string, status: 'diagnostic' | 'online' | 'onsite' | 'failed' | 'resolved' | 'closed') => {
    try {
      setUpdateLoading(prev => ({ ...prev, [ticketId]: true }));
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié');
        return;
      }
      
      console.log('Updating ticket status:', { ticketId, status }); // Debug log
      
      const response = await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du ticket');
      }
      
      const data = await response.json();
      console.log('Update response:', data); // Debug log
      
      // Mettre à jour l'état local du ticket avec les données complètes du serveur
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? data.ticket : ticket
        )
      );
      
      // Mettre à jour l'onglet actif pour afficher le nouvel état
      setActiveTab(status);
      
      closeDropdown(ticketId);
      closeContextMenu();
    } catch (err) {
      console.error('Error updating ticket:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.')) return;
    try {
      setUpdateLoading(prev => ({ ...prev, [ticketId]: true }));
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Non authentifié');
        return;
      }
      const response = await fetch(`http://localhost:3001/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du ticket');
      }
      setTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== ticketId));
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
        return status.charAt(0).toUpperCase() + status.slice(1);
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
        case 'createdBy':
          comparison = a.createdBy.firstName.localeCompare(b.createdBy.firstName);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Gérer le clic sur un en-tête de colonne
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      // Si on clique sur la même colonne, on inverse la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, on change de colonne et on remet la direction par défaut
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

  const handleContextMenu = (e: React.MouseEvent, ticketId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, ticketId });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  // Fonction pour compter les tickets par statut
  const getTicketCount = (status: string) => {
    if (!user) return 0;
    
    if (showAdminView && (user.role === 'admin' || user.role === 'fondateur')) {
      if (status === 'tous') {
        return tickets.length;
      }
      return tickets.filter(ticket => ticket.status === status).length;
    }
    
    if (status === 'tous') {
      return tickets.filter(ticket => 
        ticket.status === 'libre' || 
        (ticket.assignedTo && ticket.assignedTo._id === user._id) ||
        (ticket.createdBy && ticket.createdBy._id === user._id)
      ).length;
    }
    
    return tickets.filter(ticket => 
      ticket.status === status && 
      (
        (ticket.assignedTo && ticket.assignedTo._id === user._id) ||
        (ticket.createdBy && ticket.createdBy._id === user._id)
      )
    ).length;
  };

  // Barre d'onglets pour filtrer par statut
  const renderTabs = () => (
    <div className="flex space-x-2 mb-6 items-end">
      <div className="relative inline-block">
        <button
          className={`px-4 py-2 rounded-t-md text-sm font-bold transition-colors shadow-md border-2 ${activeTab === 'tous' ? 'bg-[#7289DA] text-white border-[#5865F2]' : 'bg-[#36393F] text-gray-200 border-[#23272A] hover:bg-[#444]'}`}
          onClick={() => { setActiveTab('tous'); closeContextMenu(); }}
        >
          <div className="flex items-center">
            <List className="w-4 h-4 mr-2" />
            Tous
          </div>
        </button>
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
          {getTicketCount('tous')}
        </span>
      </div>
      <div className="relative inline-block">
        <button
          className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${activeTab === 'libre' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#444]'}`}
          onClick={() => { setActiveTab('libre'); closeContextMenu(); }}
        >
          <div className="flex items-center">
            <Circle className="w-4 h-4 mr-2" />
            {translateStatus('libre')}
          </div>
        </button>
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
          {getTicketCount('libre')}
        </span>
      </div>
      <div className="relative inline-block">
        <button
          className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${activeTab === 'diagnostic' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#444]'}`}
          onClick={() => { setActiveTab('diagnostic'); closeContextMenu(); }}
        >
          <div className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            {translateStatus('diagnostic')}
          </div>
        </button>
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
          {getTicketCount('diagnostic')}
        </span>
      </div>
      {/* Groupe En ligne / À domicile */}
      <div className="flex rounded-t-md overflow-visible border border-[#36393F] bg-[#23272A]">
        <div className="relative inline-block">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'online' ? 'bg-[#5865F2] text-white' : 'text-gray-300 hover:bg-[#444]'}`}
            onClick={() => { setActiveTab('online'); closeContextMenu(); }}
          >
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              {translateStatus('online')}
            </div>
          </button>
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
            {getTicketCount('online')}
          </span>
        </div>
        <div className="relative inline-block">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-[#36393F] ${activeTab === 'onsite' ? 'bg-[#5865F2] text-white' : 'text-gray-300 hover:bg-[#444]'}`}
            onClick={() => { setActiveTab('onsite'); closeContextMenu(); }}
          >
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {translateStatus('onsite')}
            </div>
          </button>
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
            {getTicketCount('onsite')}
          </span>
        </div>
      </div>
      {/* Groupe Échec / Résolu */}
      <div className="flex rounded-t-md overflow-visible border border-[#36393F] bg-[#23272A] ml-2">
        <div className="relative inline-block">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'failed' ? 'bg-[#5865F2] text-white' : 'text-gray-300 hover:bg-[#444]'}`}
            onClick={() => { setActiveTab('failed'); closeContextMenu(); }}
          >
            <div className="flex items-center">
              <X className="w-4 h-4 mr-2" />
              {translateStatus('failed')}
            </div>
          </button>
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
            {getTicketCount('failed')}
          </span>
        </div>
        <div className="relative inline-block">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-l border-[#36393F] ${activeTab === 'resolved' ? 'bg-[#5865F2] text-white' : 'text-gray-300 hover:bg-[#444]'}`}
            onClick={() => { setActiveTab('resolved'); closeContextMenu(); }}
          >
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {translateStatus('resolved')}
            </div>
          </button>
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
            {getTicketCount('resolved')}
          </span>
        </div>
      </div>
      <div className="relative inline-block">
        <button
          className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${activeTab === 'closed' ? 'bg-[#5865F2] text-white' : 'bg-[#36393F] text-gray-300 hover:bg-[#444]'}`}
          onClick={() => { setActiveTab('closed'); closeContextMenu(); }}
        >
          <div className="flex items-center">
            <Archive className="w-4 h-4 mr-2" />
            {translateStatus('closed')}
          </div>
        </button>
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[#5865F2] text-white border-2 border-[#2F3136] z-[999]">
          {getTicketCount('closed')}
        </span>
      </div>
    </div>
  );

  // Filtrage des tickets selon l'onglet actif et l'assignation
  const getFilteredTickets = () => {
    if (!user) return [];
    // Mode administration : filtrage par statut mais pas par assigné
    if (showAdminView && (user.role === 'admin' || user.role === 'fondateur')) {
      if (activeTab === 'tous') {
        return tickets;
      }
      if (activeTab === 'libre') {
        return tickets.filter(ticket => ticket.status === 'libre');
      }
      return tickets.filter(ticket => ticket.status === activeTab);
    }
    // Mode normal : filtrage par statut ET par assigné
    if (activeTab === 'tous') {
      return tickets.filter(ticket => 
        ticket.status === 'libre' || 
        (ticket.assignedTo && ticket.assignedTo._id === user._id) ||
        (ticket.createdBy && ticket.createdBy._id === user._id)
      );
    }
    if (activeTab === 'libre') {
      return tickets.filter(ticket => ticket.status === 'libre');
    }
    return tickets.filter(ticket => 
      ticket.status === activeTab && 
      (
        (ticket.assignedTo && ticket.assignedTo._id === user._id) ||
        (ticket.createdBy && ticket.createdBy._id === user._id)
      )
    );
  };

  // Ajout de la fonction pour faire le diagnostic
  const doDiagnostic = async (ticket: Ticket) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [ticket._id]: true }));
      const token = localStorage.getItem('authToken');
      if (!token || !user) {
        setError('Non authentifié');
        return;
      }
      const response = await fetch(`http://localhost:3001/api/tickets/${ticket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'diagnostic', 
          assignedTo: user._id 
        })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'assignation du ticket');
      }
      const data = await response.json();
      // Mettre à jour l'état local du ticket avec les données complètes du serveur
      setTickets(prevTickets => prevTickets.map(t => t._id === ticket._id ? data.ticket : t));
      // Mettre à jour l'onglet actif pour afficher le nouvel état
      setActiveTab('diagnostic');
      closeContextMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [ticket._id]: false }));
    }
  };

  // Quand la checkbox change, je sauvegarde dans le localStorage
  const handleAdminViewChange = (checked: boolean) => {
    setShowAdminView(checked);
    localStorage.setItem('showAdminView', checked ? 'true' : 'false');
    closeContextMenu();
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

  // Rendu en mode tableau
  const renderTableView = () => {
    const sortedTickets = sortTickets(getFilteredTickets());
    
    // Helper pour afficher l'icône de tri
    const renderSortIcon = (field: SortField) => {
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]" onClick={() => handleSortClick('status')}>
                <div className="flex items-center">
                  <span>Statut</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSortClick('title')}
              >
                <div className="flex items-center">
                  <span>Titre</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSortClick('category')}
              >
                <div className="flex items-center">
                  <span>Catégorie</span>
                  {renderSortIcon('category')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSortClick('createdBy')}
              >
                <div className="flex items-center">
                  <span>Créé par</span>
                  {renderSortIcon('createdBy')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-[#36393F]"
                onClick={() => handleSortClick('createdAt')}
              >
                <div className="flex items-center">
                  <span>Créé le</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>
              {showAdminView && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Assigné à
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202225]">
            {sortedTickets.map((ticket) => (
              <tr key={ticket._id} className="hover:bg-[#36393F] transition-colors cursor-pointer" onContextMenu={e => handleContextMenu(e, ticket._id)}>
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
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    <span>{ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{formatDate(ticket.createdAt)}</td>
                {showAdminView && (
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : <span className="text-gray-500">-</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Rendu en mode carte (vue actuelle)
  const renderCardView = () => (
    <div className="space-y-4">
      {getFilteredTickets().map((ticket) => (
        <div key={ticket._id} className="bg-[#36393F] rounded-md p-4 shadow-sm hover:bg-[#444] transition-colors cursor-pointer relative" onContextMenu={e => handleContextMenu(e, ticket._id)}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center">
              {getPriorityIcon(ticket.priority)}
              <h3 className="text-white font-medium ml-2">{ticket.title}</h3>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                {translateStatus(ticket.status)}
              </span>
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

  const contextMenuElement = contextMenu && (() => {
    const ticket = tickets.find(t => t._id === contextMenu.ticketId);
    if (!ticket) return null;
    // Ajout du log pour debug
    if (user && ticket) {
      // Gestion des rôles multiples (tableau ou string)
      const roles = Array.isArray(user.role) ? user.role : (typeof user.role === 'string' ? user.role.split(',') : []);
      console.log('[DEBUG CONTEXT MENU] user.role:', user.role, 'roles:', roles, 'user._id:', user._id, 'ticket.assignedTo?._id:', ticket.assignedTo?._id, 'ticket.status:', ticket.status);
      const isFounder = roles.includes('fondateur');
      const isFreelancer = roles.some(r => r.includes('freelancer'));
      const canDiagnostic = isFounder || (isFreelancer && ticket.assignedTo && ticket.assignedTo._id === user._id);
      console.log('[DEBUG CONTEXT MENU] canDiagnostic:', canDiagnostic);
    }
    return (
      <div
        ref={contextMenuRef}
        className="fixed z-[999] bg-[#2F3136] border border-[#202225] rounded-md shadow-lg py-2 w-56"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        tabIndex={0}
        onBlur={closeContextMenu}
        onContextMenu={e => e.preventDefault()}
      >
        <a
          href="#"
          className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-[#36393F]"
          onClick={e => { e.preventDefault(); setModalTicket(ticket); setShowTicketModal(true); closeContextMenu(); }}
        >
          <ExternalLink className="w-4 h-4 mr-2 text-[#5865F2] flex-shrink-0" />
          Voir le ticket
        </a>
        {ticket.status === 'libre' && user && (() => {
          const roles = Array.isArray(user.role) ? user.role : (typeof user.role === 'string' ? user.role.split(',') : []);
          const isFounder = roles.includes('fondateur');
          const isFreelancer = roles.some(r => r.includes('freelancer'));
          return isFounder || (isFreelancer && ticket.assignedTo && ticket.assignedTo._id === user._id);
        })() && (
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-[#36393F]"
            onClick={() => { doDiagnostic(ticket); closeContextMenu(); }}
            disabled={updateLoading[ticket._id]}
          >
            <CheckCircle className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
            Faire le diagnostic
          </button>
        )}
        {ticket.status === 'diagnostic' && user && (() => {
          const roles = Array.isArray(user.role) ? user.role : (typeof user.role === 'string' ? user.role.split(',') : []);
          const isFounder = roles.includes('fondateur');
          const isFreelancer = roles.some(r => r.includes('freelancer'));
          return isFounder || (isFreelancer && ticket.assignedTo && ticket.assignedTo._id === user._id);
        })() && (
          <>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-cyan-400 hover:bg-[#36393F]"
              onClick={() => { updateTicketStatus(ticket._id, 'online'); closeContextMenu(); }}
              disabled={updateLoading[ticket._id]}
            >
              <MessageCircle className="w-4 h-4 mr-2 text-cyan-400 flex-shrink-0" />
              Intervention en ligne
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-[#36393F]"
              onClick={() => { updateTicketStatus(ticket._id, 'onsite'); closeContextMenu(); }}
              disabled={updateLoading[ticket._id]}
            >
              <User className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" />
              Intervention à domicile
            </button>
          </>
        )}
        {(ticket.status === 'online' || ticket.status === 'onsite') && user && (() => {
          const roles = Array.isArray(user.role) ? user.role : (typeof user.role === 'string' ? user.role.split(',') : []);
          const isFounder = roles.includes('fondateur');
          const isFreelancer = roles.some(r => r.includes('freelancer'));
          return isFounder || (isFreelancer && ticket.assignedTo && ticket.assignedTo._id === user._id);
        })() && (
          <>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#36393F]"
              onClick={() => { updateTicketStatus(ticket._id, 'failed'); closeContextMenu(); }}
              disabled={updateLoading[ticket._id]}
            >
              <X className="w-4 h-4 mr-2 text-red-400 flex-shrink-0" />
              Échec du ticket
            </button>
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-[#36393F]"
              onClick={() => { updateTicketStatus(ticket._id, 'resolved'); closeContextMenu(); }}
              disabled={updateLoading[ticket._id]}
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
              Ticket résolu
            </button>
          </>
        )}
        {(ticket.status === 'resolved' || ticket.status === 'failed') && user && user.role === 'user' && (activeTab === 'resolved' || activeTab === 'failed') && (
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-[#36393F]"
            onClick={() => { setCloseModalTicket(ticket); setShowCloseModal(true); closeContextMenu(); }}
          >
            <CheckCircle className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
            Fermer le ticket
          </button>
        )}
        {showAdminView && ticket.assignedTo && (
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-[#36393F]"
            onClick={() => { setModalFreelancer(ticket.assignedTo); setShowFreelancerModal(true); closeContextMenu(); }}
          >
            <UserCheck className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0" />
            Voir le freelancer
          </button>
        )}
        {showAdminView && user && (user.role === 'admin' || user.role === 'fondateur') && (
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#36393F]"
            onClick={() => { deleteTicket(ticket._id); closeContextMenu(); }}
          >
            <Trash2 className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
            Supprimer le ticket
          </button>
        )}
      </div>
    );
  })();

  // Composant modale pour afficher les détails d'un ticket
  const TicketDetailsModal: React.FC<{ ticket: Ticket | null; isOpen: boolean; onClose: () => void }> = ({ ticket, isOpen, onClose }) => {
    if (!ticket) return null;
    
    // Vérifier les permissions pour les actions
    const canDoDiagnostic = () => {
      if (!user || !ticket) return false;
      const roles = Array.isArray(user.role) ? user.role : (typeof user.role === 'string' ? user.role.split(',') : []);
      const isFounder = roles.includes('fondateur');
      const isFreelancer = roles.some(r => r.includes('freelancer'));
      return ticket.status === 'libre' && (isFounder || (isFreelancer && ticket.assignedTo && ticket.assignedTo._id === user._id));
    };
    
    const canChangeStatus = () => {
      if (!user || !ticket) return false;
      const roles = Array.isArray(user.role) ? user.role : (typeof user.role === 'string' ? user.role.split(',') : []);
      const isFounder = roles.includes('fondateur');
      const isFreelancer = roles.some(r => r.includes('freelancer'));
      return (ticket.status === 'diagnostic' || ticket.status === 'online' || ticket.status === 'onsite') && 
             (isFounder || (isFreelancer && ticket.assignedTo && ticket.assignedTo._id === user._id));
    };
    
    const canCloseTicket = () => {
      if (!user || !ticket) return false;
      return (ticket.status === 'resolved' || ticket.status === 'failed') && user.role === 'user';
    };
    
    const canDeleteTicket = () => {
      if (!user || !ticket) return false;
      return showAdminView && (user.role === 'admin' || user.role === 'fondateur');
    };
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Détails du ticket`} maxWidth="xl">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(ticket.status)}`}>{translateStatus(ticket.status)}</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200">Priorité : {translatePriority(ticket.priority)}</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200">Catégorie : {ticket.category}</span>
            {ticket.subcategory && ticket.subcategory !== 'Non spécifié' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200">Sous-catégorie : {ticket.subcategory}</span>
            )}
          </div>
          {/* Nouveau bloc designé pour la description et les infos principales */}
          <div className="bg-[#23272A] rounded-lg p-5 mb-6 shadow-sm">
            <div className="mb-4">
              <h4 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                Description
              </h4>
              <p className="text-white text-sm whitespace-pre-line">{ticket.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Créé par
                </h4>
                <p className="text-white text-base">{ticket.createdBy.firstName} {ticket.createdBy.lastName}</p>
              </div>
              {ticket.assignedTo && (
                <div>
                  <h4 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                    Assigné à
                  </h4>
                  <p className="text-white text-base">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-[#36393F] pt-4">
              <div>
                <h4 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Créé le
                </h4>
                <p className="text-white text-base">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <h4 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Dernière mise à jour
                </h4>
                <p className="text-white text-base">{formatDate(ticket.updatedAt)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Pièces jointes</h4>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachments.map((attachment, idx) => (
                    <a key={idx} href={`http://localhost:3001${attachment.path}`} target="_blank" rel="noopener noreferrer" className="flex items-center bg-[#202225] p-2 rounded hover:bg-[#2D3035] transition-colors">
                      {getAttachmentIcon(attachment.mimetype)}
                      <span className="ml-2 text-white text-sm truncate max-w-[120px]">{attachment.originalname}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Section des boutons d'action */}
          <div className="flex flex-wrap gap-2">
            {canDoDiagnostic() && (
              <button
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center text-sm"
                onClick={() => { doDiagnostic(ticket); onClose(); }}
                disabled={updateLoading[ticket._id]}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Faire le diagnostic
              </button>
            )}
            
            {ticket.status === 'diagnostic' && canChangeStatus() && (
              <>
                <button
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md flex items-center text-sm"
                  onClick={() => { updateTicketStatus(ticket._id, 'online'); onClose(); }}
                  disabled={updateLoading[ticket._id]}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Intervention en ligne
                </button>
                <button
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center text-sm"
                  onClick={() => { updateTicketStatus(ticket._id, 'onsite'); onClose(); }}
                  disabled={updateLoading[ticket._id]}
                >
                  <User className="w-4 h-4 mr-2" />
                  Intervention à domicile
                </button>
              </>
            )}
            
            {(ticket.status === 'online' || ticket.status === 'onsite') && canChangeStatus() && (
              <>
                <button
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center text-sm"
                  onClick={() => { updateTicketStatus(ticket._id, 'failed'); onClose(); }}
                  disabled={updateLoading[ticket._id]}
                >
                  <X className="w-4 h-4 mr-2" />
                  Échec du ticket
                </button>
                <button
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center text-sm"
                  onClick={() => { updateTicketStatus(ticket._id, 'resolved'); onClose(); }}
                  disabled={updateLoading[ticket._id]}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ticket résolu
                </button>
              </>
            )}
            
            {canCloseTicket() && (
              <button
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center text-sm"
                onClick={() => { setCloseModalTicket(ticket); setShowCloseModal(true); onClose(); }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Fermer le ticket
              </button>
            )}
            
            {showAdminView && ticket.assignedTo && (
              <button
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center text-sm"
                onClick={() => { setModalFreelancer(ticket.assignedTo); setShowFreelancerModal(true); onClose(); }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Voir le freelancer
              </button>
            )}
            
            {canDeleteTicket() && (
              <button
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center text-sm"
                onClick={() => { 
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.')) {
                    deleteTicket(ticket._id);
                    onClose();
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer le ticket
              </button>
            )}
          </div>
          
          {/* Section Audit Trail */}
          {ticket.auditTrail && ticket.auditTrail.length > 0 && (
            <div className="bg-[#36393F] border border-[#202225] rounded-md p-5">
              <div className="flex items-center mb-4">
                <History className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-300 text-sm font-medium">Historique des actions</span>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
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
      </Modal>
    );
  };

  if (showCloseModal && closeModalTicket) {
    return (
      <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="Clôturer le ticket" maxWidth="sm">
        <div className="space-y-4">
          {/* Affichage du statut du ticket et message de paiement */}
          <div className="bg-[#36393F] p-4 rounded-md">
            <div className="flex items-center mb-2">
              {closeModalTicket.status === 'resolved' ? (
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              ) : (
                <X className="w-5 h-5 text-red-400 mr-2" />
              )}
              <span className="text-white font-medium">
                {closeModalTicket.status === 'resolved' ? 'Ticket résolu' : 'Ticket en échec'}
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              {closeModalTicket.status === 'resolved' 
                ? 'Vous serez débité du montant correspondant à la prestation.'
                : 'Vous ne serez pas débité car le ticket est en échec.'}
            </p>
          </div>

          {/* Affichage des informations du freelancer */}
          {closeModalTicket.assignedTo && (
            <div className="flex items-center space-x-4 bg-[#36393F] p-4 rounded-md">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#23272A]">
                {closeModalTicket.assignedTo.profileImage ? (
                  <img 
                    src={closeModalTicket.assignedTo.profileImage} 
                    alt={`${closeModalTicket.assignedTo.firstName} ${closeModalTicket.assignedTo.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-white font-medium">
                  {closeModalTicket.assignedTo.firstName} {closeModalTicket.assignedTo.lastName}
                </h4>
                <p className="text-gray-400 text-sm">Freelancer</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Décrivez la prestation réalisée</label>
            <textarea
              className="w-full bg-[#23272A] text-white rounded-md p-2 min-h-[80px] border border-[#36393F]"
              value={closeDescription}
              onChange={e => setCloseDescription(e.target.value)}
              placeholder="Votre retour sur la prestation..."
            />
          </div>

          {closeModalTicket.assignedTo && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notez le freelancer</label>
              <div className="flex items-center space-x-2">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCloseRating(star)}
                    className="focus:outline-none"
                  >
                    <svg className={`w-7 h-7 ${closeRating >= star ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              onClick={() => {
                setShowCloseModal(false);
                setCloseDescription('');
                setCloseRating(5);
              }}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken');
                  if (!token) throw new Error('Non authentifié');
                  const response = await fetch(`http://localhost:3001/api/tickets/${closeModalTicket._id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                      status: 'closed',
                      skipFeedback: true
                    })
                  });
                  if (!response.ok) throw new Error('Erreur lors de la clôture du ticket');
                  setShowCloseModal(false);
                  setCloseDescription('');
                  setCloseRating(5);
                  fetchTickets();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Erreur lors de la clôture du ticket');
                }
              }}
            >
              Passer sans avis
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken');
                  if (!token) throw new Error('Non authentifié');
                  const response = await fetch(`http://localhost:3001/api/tickets/${closeModalTicket._id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                      status: 'closed',
                      description: closeDescription, 
                      rating: closeModalTicket.assignedTo ? closeRating : undefined
                    })
                  });
                  if (!response.ok) throw new Error('Erreur lors de la clôture du ticket');
                  setShowCloseModal(false);
                  setCloseDescription('');
                  setCloseRating(5);
                  fetchTickets();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Erreur lors de la clôture du ticket');
                }
              }}
            >
              Valider
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Switch cartes/tableau ici si existant */}
        </div>
      </div>
      {renderTabs()}
      {viewMode === 'cards' ? renderCardView() : renderTableView()}
      {contextMenuElement}
      <TicketDetailsModal ticket={modalTicket} isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} />
      <FreelancerDetailsModal freelancer={modalFreelancer} isOpen={showFreelancerModal} onClose={() => setShowFreelancerModal(false)} />
      {user && (user.role === 'admin' || user.role === 'fondateur') && (
        <div className="flex justify-end mt-8">
          <label className="flex items-center cursor-pointer select-none">
            <span className="mr-2 text-sm font-medium text-red-400">Administration</span>
            <input
              type="checkbox"
              checked={showAdminView}
              onChange={e => handleAdminViewChange(e.target.checked)}
              className="form-checkbox h-5 w-5 text-red-500 rounded focus:ring-0 border-gray-400 bg-[#23272A]"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default TicketList; 
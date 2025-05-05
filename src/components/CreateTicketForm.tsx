import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateTicketFormProps {
  onTicketCreated: () => void;
  onCancel: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onTicketCreated, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [targetUser, setTargetUser] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Fetch users if the current user is not of type 'user'
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || !user || user.role === 'user') return;
      
      try {
        setFetchingUsers(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError('Non authentifié');
          return;
        }
        
        const response = await fetch('http://localhost:3001/api/users?role=user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }
        
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Non authentifié');
        return;
      }
      
      const ticketData: any = {
        title,
        description,
        priority,
      };
      
      // Si ce n'est pas un utilisateur normal et qu'un utilisateur cible est sélectionné
      if (user?.role !== 'user' && targetUser) {
        ticketData.targetUser = targetUser;
      }
      
      const response = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du ticket');
      }
      
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTargetUser('');
      
      // Informer le parent que le ticket a été créé
      onTicketCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#36393F] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Créer un nouveau ticket</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Titre*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              placeholder="Entrez le titre du ticket"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2] min-h-[120px]"
              placeholder="Décrivez votre problème en détail"
              required
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
              Priorité
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          
          {/* Sélection d'utilisateur cible (uniquement pour admin, freelancer, etc.) */}
          {user?.role !== 'user' && (
            <div>
              <label htmlFor="targetUser" className="block text-sm font-medium text-gray-300 mb-1">
                Utilisateur cible
              </label>
              <select
                id="targetUser"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
                disabled={fetchingUsers}
              >
                <option value="">-- Sélectionner un utilisateur --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
              {fetchingUsers && (
                <p className="text-xs text-gray-400 mt-1">Chargement des utilisateurs...</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[#2F3136] text-gray-300 rounded-md hover:bg-[#202225] focus:outline-none"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le ticket'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketForm; 
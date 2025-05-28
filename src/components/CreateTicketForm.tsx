import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { AlertTriangle, Upload, X, Image, FileText, Paperclip, CreditCard, Crown } from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  hasPaymentMethod?: boolean;
  role?: string;
  clientType?: string;
  phone?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  profileImage?: string;
  subscriptionType?: "none" | "solo" | "family";
}

interface CreateTicketFormProps {
  onTicketCreated: () => void;
  onCancel: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onTicketCreated, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const { paymentMethods, loading: paymentMethodsLoading, refreshPaymentMethods } = usePaymentMethods();
  const hasPaymentMethod = paymentMethods.length > 0;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [targetUser, setTargetUser] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Catégories principales de dépannage informatique
  const categories = [
    'Matériel (Hardware)',
    'Logiciel (Software)',
    'Réseau',
    'Sécurité',
    'Mobile',
    'Cloud et Serveurs',
    'Maintenance Préventive',
    'Autre'
  ];

  // Sous-catégories en fonction de la catégorie principale
  const subcategories: Record<string, string[]> = {
    'Matériel (Hardware)': [
      'PC/Ordinateurs fixes',
      'Ordinateurs portables',
      'Périphériques (imprimantes, scanners)',
      'Serveurs',
      'Réseaux physiques',
      'Autre'
    ],
    'Logiciel (Software)': [
      'Systèmes d\'exploitation',
      'Applications/logiciels',
      'Malwares/virus',
      'Mises à jour et pilotes',
      'Autre'
    ],
    'Réseau': [
      'Connexion internet',
      'Configuration réseau local',
      'Wi-Fi/sans fil',
      'VPN/connexions distantes',
      'Autre'
    ],
    'Sécurité': [
      'Virus/malwares',
      'Sécurisation des comptes',
      'Pare-feu et antivirus',
      'Récupération de données',
      'Autre'
    ],
    'Mobile': [
      'Smartphones',
      'Tablettes',
      'Systèmes iOS/Android',
      'Autre'
    ],
    'Cloud et Serveurs': [
      'Services cloud',
      'Hébergement web',
      'Serveurs d\'entreprise',
      'Autre'
    ],
    'Maintenance Préventive': [
      'Sauvegardes',
      'Nettoyage',
      'Mises à jour',
      'Autre'
    ],
    'Autre': ['Non spécifié']
  };

  // Réinitialiser la sous-catégorie lorsque la catégorie change
  useEffect(() => {
    setSubcategory('');
  }, [category]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Vérifier la taille totale (limite à 10MB total)
      const totalSize = [...attachments, ...newFiles].reduce((total, file) => total + file.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        setError('La taille totale des fichiers ne doit pas dépasser 10MB.');
        return;
      }
      
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fonction pour obtenir l'icône appropriée selon le type de fichier
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-400" />;
    }
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rafraîchir les méthodes de paiement avant la vérification
    await refreshPaymentMethods();

    if (!hasPaymentMethod) {
      setShowPaymentModal(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('priority', priority);
      if (targetUser) {
        formData.append('targetUser', targetUser);
      }
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la création du ticket');
      }

      onTicketCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Helper pour afficher le nom lisible de l'abonnement
  const getSubscriptionName = () => {
    if (!user?.subscriptionType) return '';
    switch(user.subscriptionType) {
      case 'solo': return 'Plan Solo';
      case 'family': return 'Plan Famille';
      case 'none':
      default: return 'A la carte';
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

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#36393F] rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-[#5865F2] mr-2" />
              <h3 className="text-xl font-semibold text-white">Méthode de paiement requise</h3>
            </div>
            <p className="text-gray-300 mb-2">
              Pour créer un ticket, vous devez d'abord ajouter une méthode de paiement à votre compte.
            </p>
            {/* Tag d'abonnement harmonisé */}
            {(!user?.role || (user?.role !== 'admin' && user?.role !== 'fondateur' && user?.role !== 'freelancer' && user?.role !== 'freelancer_admin')) && (
              <div className="flex justify-center my-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400">
                  <Crown className="w-3 h-3 mr-1" />
                  {getSubscriptionName() || (user?.subscriptionType === 'solo' ? 'Plan Solo' : user?.subscriptionType === 'family' ? 'Plan Famille' : 'A la carte')}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 mb-4">
              Aucune somme ne sera débitée tant que les différents problèmes ne seront pas résolus.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-[#2F3136] text-gray-300 rounded-md hover:bg-[#202225] focus:outline-none"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  window.location.href = '/dashboard?tab=subscription';
                }}
                className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none"
              >
                Ajouter une carte
              </button>
            </div>
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Catégorie*
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              required
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {category && (
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-300 mb-1">
                Sous-catégorie
              </label>
              <select
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              >
                <option value="">-- Sélectionner une sous-catégorie --</option>
                {subcategories[category]?.map((subcat) => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          )}
          
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Pièces jointes
            </label>
            <div className="flex items-center mb-2">
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center px-3 py-2 bg-[#4F545C] hover:bg-[#40444B] text-white text-sm rounded-md transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un fichier
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <span className="text-xs text-gray-400 ml-2">
                Captures d'écran ou documents (.pdf, .doc, .txt) &lt; 10MB
              </span>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#2F3136] p-2 rounded-md text-sm">
                    <div className="flex items-center">
                      {getFileIcon(file)}
                      <span className="ml-2 text-white truncate max-w-[200px]">{file.name}</span>
                      <span className="ml-2 text-gray-400 text-xs">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
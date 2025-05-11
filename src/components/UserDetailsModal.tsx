import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Edit } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
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
  } | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const isAdmin = user.role === 'admin' || user.role === 'fondateur' || user.role === 'freelancer_admin';

  useEffect(() => {
    if (user.profileImage) {
      if (user.profileImage.startsWith('http')) {
        setImageUrl(user.profileImage);
      } else {
        setImageUrl(`http://localhost:3001${user.profileImage}`);
      }
    } else {
      setImageUrl('http://localhost:3001/api/default-image');
    }
    setImageError(false);
  }, [user.profileImage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageUrl('http://localhost:3001/api/default-image');
    }
  };

  // Helper pour afficher les tags de rôle
  const renderRoleTags = (role: string, user: UserDetailsModalProps['user']) => {
    if (!user) return null;
    
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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          phone: editedUser.phone,
          city: editedUser.city
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setIsEditing(false);
      // Mettre à jour l'utilisateur local
      Object.assign(user, editedUser);
    } catch (error) {
      alert('Erreur lors de la mise à jour des informations');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de l'utilisateur`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Photo de profil et nom */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#202225]">
            <img
              src={imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
              crossOrigin="anonymous"
              key={imageUrl}
            />
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedUser.firstName}
                  onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Prénom"
                />
                <input
                  type="text"
                  value={editedUser.lastName}
                  onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Nom"
                />
              </div>
            ) : (
              <h3 className="text-xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </h3>
            )}
            <div className="mt-1">
              {renderRoleTags(user.role, user)}
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Téléphone</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedUser.phone}
                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Téléphone"
                />
              ) : (
                <p className="text-white">{user.phone || 'Non renseigné'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Ville</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.city}
                  onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Ville"
                />
              ) : (
                <p className="text-white">{user.city || 'Non renseignée'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Date d'inscription</p>
              <p className="text-white">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Statut du compte</p>
              <p className="text-white">
                {user.isEmailVerified ? (
                  <span className="text-green-400">Compte activé</span>
                ) : (
                  <span className="text-red-400">Compte désactivé</span>
                )}
              </p>
            </div>
          </div>

          {user.clientType === 'Freelancer' && (
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Validation admin</p>
                <p className="text-white">
                  {user.isAdminVerified ? (
                    <span className="text-green-400">Validé</span>
                  ) : (
                    <span className="text-yellow-400">En attente</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        {!isAdmin && (
          <div className="flex justify-end space-x-2 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedUser(user);
                  }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-[#36393F] rounded-md hover:bg-[#40444b] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm text-white bg-[#5865F2] rounded-md hover:bg-[#4752C4] transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm text-white bg-[#5865F2] rounded-md hover:bg-[#4752C4] transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailsModal; 
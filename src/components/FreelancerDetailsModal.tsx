import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { User, Mail, Phone, MapPin, Calendar, Shield, Briefcase, Star, Save, Edit } from 'lucide-react';

interface FreelancerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    role: string;
    profileImage: string;
    createdAt: string;
    isEmailVerified: boolean;
    isAdminVerified: boolean;
    skills?: string[];
    experience?: string;
    hourlyRate?: number;
    rating?: number;
  } | null;
}

const FreelancerDetailsModal: React.FC<FreelancerDetailsModalProps> = ({ isOpen, onClose, freelancer }) => {
  if (!freelancer) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedFreelancer, setEditedFreelancer] = useState(freelancer);
  const isAdmin = freelancer.role === 'freelancer_admin' || freelancer.role === 'admin' || freelancer.role === 'fondateur';
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string | null | undefined): string => {
    if (!path || imageError) return '/images/default-profile.png';
    
    if (path.startsWith('http')) {
      return path;
    }
    
    if (path.startsWith('/')) {
      return `http://localhost:3001${path}`;
    }
    
    return `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
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
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
          Freelancer
        </span>
      );
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/freelancers/${freelancer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: editedFreelancer.firstName,
          lastName: editedFreelancer.lastName,
          phone: editedFreelancer.phone,
          city: editedFreelancer.city,
          hourlyRate: editedFreelancer.hourlyRate,
          experience: editedFreelancer.experience,
          skills: editedFreelancer.skills
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setIsEditing(false);
      // Mettre à jour le freelancer local
      Object.assign(freelancer, editedFreelancer);
    } catch (error) {
      alert('Erreur lors de la mise à jour des informations');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails du freelancer`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Photo de profil et nom */}
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#202225]">
            <img
              src={getImageUrl(freelancer.profileImage)}
              alt={`${freelancer.firstName} ${freelancer.lastName}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedFreelancer.firstName}
                  onChange={(e) => setEditedFreelancer({ ...editedFreelancer, firstName: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Prénom"
                />
                <input
                  type="text"
                  value={editedFreelancer.lastName}
                  onChange={(e) => setEditedFreelancer({ ...editedFreelancer, lastName: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Nom"
                />
              </div>
            ) : (
              <h3 className="text-xl font-semibold text-white">
                {freelancer.firstName} {freelancer.lastName}
              </h3>
            )}
            <div className="mt-1">
              {renderRoleTags(freelancer.role)}
            </div>
            {freelancer.rating && (
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-yellow-400">{freelancer.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">{freelancer.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Téléphone</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedFreelancer.phone}
                  onChange={(e) => setEditedFreelancer({ ...editedFreelancer, phone: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Téléphone"
                />
              ) : (
                <p className="text-white">{freelancer.phone || 'Non renseigné'}</p>
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
                  value={editedFreelancer.city}
                  onChange={(e) => setEditedFreelancer({ ...editedFreelancer, city: e.target.value })}
                  className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                  placeholder="Ville"
                />
              ) : (
                <p className="text-white">{freelancer.city || 'Non renseignée'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Date d'inscription</p>
              <p className="text-white">{formatDate(freelancer.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Statut du compte</p>
              <p className="text-white">
                {!freelancer.isEmailVerified ? (
                  <span className="text-red-400">En attente de validation email</span>
                ) : !freelancer.isAdminVerified ? (
                  <span className="text-yellow-400">En attente de validation admin</span>
                ) : (
                  <span className="text-green-400">Compte validé</span>
                )}
              </p>
            </div>
          </div>

          {isEditing ? (
            <>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Taux horaire</p>
                  <input
                    type="number"
                    value={editedFreelancer.hourlyRate}
                    onChange={(e) => setEditedFreelancer({ ...editedFreelancer, hourlyRate: Number(e.target.value) })}
                    className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                    placeholder="Taux horaire"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Expérience</p>
                  <input
                    type="text"
                    value={editedFreelancer.experience}
                    onChange={(e) => setEditedFreelancer({ ...editedFreelancer, experience: e.target.value })}
                    className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                    placeholder="Expérience"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {freelancer.hourlyRate && (
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Taux horaire</p>
                    <p className="text-white">{freelancer.hourlyRate}€/h</p>
                  </div>
                </div>
              )}

              {freelancer.experience && (
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Expérience</p>
                    <p className="text-white">{freelancer.experience}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Compétences */}
        {isEditing ? (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={editedFreelancer.skills?.join(', ') || ''}
                onChange={(e) => setEditedFreelancer({ 
                  ...editedFreelancer, 
                  skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                })}
                className="bg-[#36393F] text-white px-3 py-1 rounded-md w-full"
                placeholder="Compétences (séparées par des virgules)"
              />
            </div>
          </div>
        ) : (
          freelancer.skills && freelancer.skills.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Compétences</h4>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#5865F2] bg-opacity-20 text-[#5865F2] rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        {/* Boutons d'action */}
        {isAdmin && (
          <div className="flex justify-end space-x-2 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedFreelancer(freelancer);
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

export default FreelancerDetailsModal; 
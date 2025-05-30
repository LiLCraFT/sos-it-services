import React, { useState, useEffect } from 'react';
import { Linkedin, Twitter, Github, MapPin } from 'lucide-react';
import { getImageUrl, DEFAULT_IMAGE } from '../utils/imageUtils';
import { ExpertRating } from './ExpertRating';
import { useAuth } from '../contexts/AuthContext';
import { useChatbot } from '../contexts/ChatbotContext';
import FreelancerDetailsModal from './FreelancerDetailsModal';

export interface ExpertCardProps {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage: string;
  rating?: number;
  city?: string;
  linkedin?: string;
  social?: {
    twitter?: string;
    github?: string;
  };
  email?: string;
  phone?: string;
  clientType?: string;
  createdAt?: string;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  firstName,
  lastName,
  role,
  profileImage,
  social = {},
  rating,
  city,
  linkedin,
  email,
  phone,
  clientType,
  createdAt,
  ...rest
}) => {
  const { user } = useAuth();
  const { showMessage } = useChatbot();
  const [, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(() => {
    const url = getImageUrl(profileImage);
    return url;
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    if (profileImage) {
      const newUrl = getImageUrl(profileImage);
      setImageUrl(newUrl);
      setImageError(false);
    }
  }, [profileImage]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(`${DEFAULT_IMAGE}?v=${Date.now()}`);
  };

  const handleImageLoad = () => {
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      showMessage('Vous devez être connecté pour accéder au profil Freelancer', 'warning');
    } else {
      setIsUserModalOpen(true);
    }
  };

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      showMessage('Vous devez être connecté pour accéder au profil Freelancer', 'warning');
      return;
    }
    
    if (!linkedin) {
      showMessage('Le profil LinkedIn n\'est pas disponible', 'error');
      return;
    }

    window.open(linkedin, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className={"bg-[#2F3136] rounded-lg overflow-hidden hover:translate-y-[-5px] transition-transform duration-300 cursor-pointer"}
        onClick={handleCardClick}
      >
        <div className="aspect-square bg-gray-800 relative">
          <img 
            key={imageUrl}
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
          {linkedin && (
            <button 
              onClick={handleLinkedInClick}
              className="absolute bottom-4 left-4 bg-[#0077B5]/50 hover:bg-[#0077B5] p-1.5 rounded-full transition-all duration-300 z-10"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <Linkedin size={18} className="text-white/80 hover:text-white transition-colors duration-300" />
            </button>
          )}
          {/* Badge note ou Nouveau */}
          {rating && rating > 0 ? (
            <ExpertRating rating={rating} className="absolute bottom-4 right-4" />
          ) : (
            <span className="absolute bottom-4 right-4 bg-[#5865F2] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">Nouveau</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#36393F] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <div className="flex justify-center space-x-3">
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#5865F2] transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
                {social.github && (
                  <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#5865F2] transition-colors">
                    <Github size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white">{firstName} {lastName}</h3>
          <p className="text-[#5865F2] mb-2">
            {role === 'fondateur' ? 'Fondateur' : (role === 'freelancer' || role === 'freelancer_admin' ? 'Freelancer' : 'Expert')}
          </p>
          {city && (
            <div className="flex items-center mt-2 text-gray-400">
              <MapPin size={16} className="mr-1" />
              <span>{city}</span>
            </div>
          )}
        </div>
      </div>
      <FreelancerDetailsModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        freelancer={{
          _id: rest._id,
          firstName,
          lastName,
          email: email || '',
          phone: phone || (rest as any).phone || '',
          city: city || '',
          role: role || '',
          profileImage: profileImage || '',
          createdAt: (rest as any).createdAt || '',
          isEmailVerified: false,
          isAdminVerified: false,
          rating: rating,
        }}
      />
    </>
  );
}; 
import React, { useState, useEffect } from 'react';
import { Star, Linkedin, Twitter, Github, MapPin } from 'lucide-react';
import { getImageUrl, DEFAULT_IMAGE } from '../utils/imageUtils';
import { ExpertRating } from './ExpertRating';

export interface ExpertCardProps {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage: string;
  rating?: number;
  city?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  firstName,
  lastName,
  role,
  profileImage,
  social = {},
  rating,
  city
}) => {
  // État pour gérer l'erreur de chargement de l'image
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(() => {
    const url = getImageUrl(profileImage);
    console.log('URL initiale de l\'image:', url);
    return url;
  });

  // Mettre à jour l'URL de l'image si profileImage change
  useEffect(() => {
    if (profileImage) {
      const newUrl = getImageUrl(profileImage);
      console.log('Mise à jour de l\'URL de l\'image:', newUrl);
      setImageUrl(newUrl);
      setImageError(false);
    }
  }, [profileImage]);

  // Gestionnaire d'erreur d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Erreur de chargement de l\'image:', e);
    console.log('URL qui a échoué:', imageUrl);
    setImageError(true);
    setImageUrl(`${DEFAULT_IMAGE}?v=${Date.now()}`);
  };

  // Gestionnaire de succès de chargement d'image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image chargée avec succès:', e);
    console.log('URL de l\'image chargée:', imageUrl);
  };

  return (
    <div className="bg-[#2F3136] rounded-lg overflow-hidden hover:translate-y-[-5px] transition-transform duration-300">
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
        {social.linkedin && (
          <a 
            href={social.linkedin} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="absolute bottom-4 left-4 bg-[#0077B5] p-2 rounded-full hover:bg-[#005582] transition-colors z-10"
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          >
            <Linkedin size={24} className="text-white" />
          </a>
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
  );
}; 
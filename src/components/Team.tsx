import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Github, Linkedin, Twitter, User, Users, Award, BadgeCheck, Star } from 'lucide-react';

// URL de l'image par défaut
const DEFAULT_IMAGE = 'http://localhost:3001/api/default-image';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage: string;
  email: string;
  rating?: number;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const TeamCard: React.FC<TeamMember> = ({ firstName, lastName, role, profileImage, social = {}, rating }) => {
  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string) => {
    console.log('getImageUrl appelé avec path:', path);
    
    if (!path) {
      console.log('Pas de chemin fourni, retourne image par défaut');
      return DEFAULT_IMAGE;
    }
    
    // Si l'URL commence par http, c'est déjà une URL complète
    if (path.startsWith('http')) {
      console.log('URL complète détectée:', path);
      return path;
    }
    
    // Si le chemin commence par /images/ ou /uploads/, c'est une image du backend
    if (path.startsWith('/images/')) {
      // Pour les chemins /images/, on enlève le /images/ initial
      const cleanPath = path.substring(8); // Enlève '/images/'
      const url = `http://localhost:3001/api/images/${cleanPath}`;
      console.log('Image du backend détectée (images), URL construite:', url);
      return url;
    }
    
    if (path.startsWith('/uploads/')) {
      // Pour les chemins /uploads/, on garde le chemin complet
      const cleanPath = path.substring(1); // Enlève juste le premier /
      const url = `http://localhost:3001/api/images/${cleanPath}`;
      console.log('Image du backend détectée (uploads), URL construite:', url);
      return url;
    }
    
    // Pour les autres chemins
    if (path.startsWith('/')) {
      // Pour les chemins qui commencent par /
      const cleanPath = path.substring(1);
      const url = `http://localhost:3001/api/public/${cleanPath}`;
      console.log('Chemin avec / détecté, URL construite:', url);
      return url;
    } else {
      // Pour les autres chemins
      const url = `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
      console.log('Autre chemin détecté, URL construite:', url);
      return url;
    }
  };

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
    <Card className="h-full cursor-pointer">
      <CardContent className="p-0">
        <div className="w-full aspect-square bg-gray-800 relative">
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
              className="absolute bottom-4 right-4 bg-[#0077B5] p-2 rounded-full hover:bg-[#005582] transition-colors z-10"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              <Linkedin size={24} className="text-white" />
            </a>
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
          <p className="text-[#5865F2] mb-2">{role === 'fondateur' ? 'Fondateur' : 
                                            role === 'freelancer' || role === 'freelancer_admin' ? 'Freelancer' : 
                                            role === 'admin' ? 'Administrateur' : 'Expert'}</p>
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-400'} ${star === 1 ? '' : 'ml-1'}`}
                    fill={star <= Math.round(rating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-yellow-400 ml-2">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Récupérer tous les utilisateurs avec les rôles fondateur ou freelancer
        const response = await fetch('http://localhost:3001/api/users?role=fondateur,freelancer,freelancer_admin', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erreur de réponse:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Données brutes reçues:', data);
        
        let members: TeamMember[] = [];
        if (Array.isArray(data)) {
          console.log('Données reçues sous forme de tableau');
          members = data;
        } else if (data.users) {
          console.log('Données reçues sous forme d\'objet avec users');
          members = data.users;
        } else {
          console.warn('Format de données inattendu:', data);
          members = [];
        }

        // Mettre à jour les notes des freelancers
        for (const member of members) {
          if (member.role === 'freelancer' || member.role === 'freelancer_admin') {
            try {
              console.log(`Récupération de la note pour ${member.firstName} ${member.lastName} (${member._id})`);
              const ratingResponse = await fetch(`http://localhost:3001/api/users/${member._id}/rating`, {
                headers: {
                  'Authorization': token ? `Bearer ${token}` : '',
                  'Content-Type': 'application/json'
                }
              });
              
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                console.log(`Note reçue pour ${member.firstName} ${member.lastName}:`, ratingData);
                member.rating = ratingData.rating;
              } else {
                console.error(`Erreur lors de la récupération de la note pour ${member.firstName} ${member.lastName}:`, await ratingResponse.text());
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération de la note pour ${member.firstName} ${member.lastName}:`, error);
            }
          }
        }

        // Log détaillé de chaque membre
        members.forEach((member, index) => {
          console.log(`Membre ${index + 1}:`, {
            id: member._id,
            nom: `${member.firstName} ${member.lastName}`,
            role: member.role,
            profileImage: member.profileImage,
            rating: member.rating
          });
        });

        setTeamMembers(members);
      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err);
        setError(`Impossible de charger les experts: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // En cas de chargement
  if (loading) {
    return (
      <section id="team" className="section-spacing bg-[#2F3136]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Notre équipe d'experts</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Chargement...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="section-spacing bg-[#2F3136]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5865F2]/20 text-[#5865F2] mb-4">
            <BadgeCheck size={16} className="mr-1.5" />
            <span className="text-sm font-medium">Des professionnels certifiés</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Users className="mr-2 text-[#5865F2]" size={32} /> Notre équipe&nbsp;<span className="text-[#5865F2]">d'experts</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Nos techniciens certifiés ont des années d'expérience dans la résolution des problèmes techniques les plus complexes.
            Confiez vos appareils aux meilleurs du métier.
          </p>
        </div>
        
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => {
              console.log('Rendu du membre:', member);
              return <TeamCard key={member._id} {...member} />;
            })}
          </div>
        ) : (
          <div className="text-center text-gray-300">
            <p>Aucun expert n'est disponible pour le moment.</p>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export default Team;
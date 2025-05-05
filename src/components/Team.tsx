import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Github, Linkedin, Twitter, User, Users, Award, BadgeCheck } from 'lucide-react';

// URL de l'image par défaut
const DEFAULT_IMAGE = 'http://localhost:3001/api/default-avatar';

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage: string;
  email: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const TeamCard: React.FC<TeamMember> = ({ firstName, lastName, role, profileImage, social = {} }) => {
  // Fonction pour construire l'URL de l'image
  const getImageUrl = (path: string) => {
    if (!path) return DEFAULT_IMAGE;
    
    // Si l'URL commence par http, c'est déjà une URL complète
    if (path.startsWith('http')) {
      return path;
    }
    
    // Essayer plusieurs formats d'URL
    if (path.startsWith('/')) {
      // Pour les chemins qui commencent par /
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `http://localhost:3001/api/public/${cleanPath}`;
    } else {
      // Pour les autres chemins
      return `http://localhost:3001/api/static?path=${encodeURIComponent(path)}`;
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative overflow-hidden aspect-square bg-gray-800">
          {profileImage ? (
            <img 
              src={getImageUrl(profileImage)} 
              alt={`${firstName} ${lastName}`} 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={60} className="text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#36393F] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <div className="flex justify-center space-x-3">
                {social.twitter && (
                  <a href={social.twitter} className="text-white hover:text-[#5865F2] transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
                {social.linkedin && (
                  <a href={social.linkedin} className="text-white hover:text-[#5865F2] transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {social.github && (
                  <a href={social.github} className="text-white hover:text-[#5865F2] transition-colors">
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
                                            role === 'freelancer' ? 'Freelancer' : 
                                            role === 'admin' ? 'Administrateur' : 'Expert'}</p>
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
        // Récupérer tous les utilisateurs avec les rôles fondateur ou freelancer
        const response = await fetch('http://localhost:3001/api/users?role=fondateur,freelancer');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTeamMembers(data);
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        setError(`Impossible de charger les experts`);
        
        // Utiliser des données de test en cas d'échec de l'API
        const testData: TeamMember[] = [
          {
            _id: '1',
            firstName: 'Pierre',
            lastName: 'Dubois',
            role: 'fondateur',
            profileImage: '',
            email: 'fondateur@example.com',
            social: {
              linkedin: 'https://linkedin.com',
              twitter: 'https://twitter.com'
            }
          },
          {
            _id: '2',
            firstName: 'Sophie',
            lastName: 'Martin',
            role: 'freelancer',
            profileImage: '',
            email: 'freelancer@example.com',
            social: {
              linkedin: 'https://linkedin.com',
              github: 'https://github.com'
            }
          }
        ];
        setTeamMembers(testData);
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
            {teamMembers.map((member) => (
              <TeamCard key={member._id} {...member} />
            ))}
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
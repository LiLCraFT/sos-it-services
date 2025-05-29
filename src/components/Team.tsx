import React, { useEffect, useState } from 'react';
import { Users, BadgeCheck, MapPin } from 'lucide-react';
import { Spinner } from './ui/Spinner';
import { ExpertCard } from './ExpertCard';

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
          throw new Error(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        
        let members: TeamMember[] = [];
        if (Array.isArray(data)) {
          members = data;
        } else if (data.users) {
          members = data.users;
        } else {
          members = [];
        }

        // Mettre à jour les notes des freelancers
        for (const member of members) {
          if (member.role === 'freelancer' || member.role === 'freelancer_admin') {
            try {
              const ratingResponse = await fetch(`http://localhost:3001/api/users/${member._id}/rating`, {
                headers: {
                  'Authorization': token ? `Bearer ${token}` : '',
                  'Content-Type': 'application/json'
                }
              });
              
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                member.rating = ratingData.rating;
              }
            } catch (error) {
            }
          }
        }

        setTeamMembers(members);
      } catch (err) {
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
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
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
              return <ExpertCard key={member._id} {...member} />;
            })}
          </div>
        ) : (
          <div className="text-center text-gray-300">
            <p>Aucun expert n'est disponible pour le moment.</p>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <a
            href="/experts-map"
            className="inline-flex items-center text-[#5865F2] hover:text-[#4752C4] transition-colors"
          >
            <MapPin className="mr-2" size={20} />
            Trouver un expert près de chez vous
          </a>
        </div>
      </div>
    </section>
  );
};

export default Team;
import React from 'react';
import { MessageSquare, Star, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

const TrustpilotWidget: React.FC = () => {
  // URL de votre profil Trustpilot
  const trustpilotUrl = "https://www.trustpilot.com/review/sos-it-services.com"; // Remplacez par votre URL réelle
  
  return (
    <section className="py-4 bg-gradient-to-b from-[#36393F] to-[#2F3136]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2F3136] border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5865F2] opacity-5 rounded-full blur-[50px]"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#5865F2] opacity-5 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-lg">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#5865F2]/20 text-[#5865F2] mb-4">
                <Star size={14} className="mr-1.5" fill="#5865F2" />
                <span className="text-xs font-medium">Vos expériences comptent</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Votre avis nous aide à nous <span className="text-[#5865F2]">améliorer</span>
              </h2>
              
              <p className="text-gray-300 text-sm mb-4">
                Soyez parmi les premiers à partager votre expérience. Votre témoignage aidera d'autres personnes à trouver une solution à leurs problèmes informatiques.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              {/* Logo Trustpilot style noir */}
              <div className="mb-4">
                <div className="bg-black px-4 py-2 rounded-md flex items-center">
                  <Star size={18} className="mr-2 text-[#00b67a]" fill="#00b67a" />
                  <span className="text-white font-bold text-base">Trustpilot</span>
                </div>
              </div>
              
              {/* Étoiles vides (pas encore d'avis) */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    className="text-gray-500 mx-0.5"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-3">
                  Nouveau sur Trustpilot
                </p>
                <Button 
                  variant="primary" 
                  className="flex items-center" 
                  onClick={() => window.open(trustpilotUrl, '_blank')}
                >
                  <MessageSquare size={16} className="mr-2" />
                  <span>Donner votre avis</span>
                  <ExternalLink size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustpilotWidget; 
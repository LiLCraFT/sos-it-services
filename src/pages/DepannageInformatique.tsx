import React, { useEffect } from 'react';
import Services from '../components/Services';
import Faq from '../components/Faq';
import { User, Users, Wrench, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DepannageInformatique: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Update page title
    document.title = 'SOS IT Services - Dépannage Informatique';
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Puis défilement vers l'ancre si présente
    const hash = location.hash;
    if (hash) {
      // Petit délai pour laisser la page se charger complètement
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const headerOffset = 80; // Hauteur approximative du header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="pt-16">
      <div className="bg-[#2F3136] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Dépannage <span className="text-[#5865F2]">Informatique</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Notre équipe d'experts est à votre service pour résoudre tous vos problèmes informatiques rapidement et efficacement.
            </p>
          </div>
        </div>
      </div>
      
      {/* Section pour les particuliers */}
      <section id="particuliers" className="py-16 bg-[#36393F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-[#5865F2] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Pour les <span className="text-[#5865F2]">particuliers</span>
              </h2>
            </div>
            <p className="text-gray-300 max-w-3xl">
              Des solutions adaptées aux besoins des particuliers. Nous intervenons à domicile ou à distance pour résoudre vos problèmes informatiques du quotidien.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-white font-medium mb-2">Dépannage à domicile</h3>
                <p className="text-gray-300 text-sm mb-4">Intervention directement chez vous avec prise en charge complète de vos problèmes informatiques.</p>
                <p className="text-[#5865F2] text-sm flex items-center">À partir de 119€ <ArrowRight size={14} className="ml-1" /></p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-white font-medium mb-2">Dépannage à distance</h3>
                <p className="text-gray-300 text-sm mb-4">Résolution rapide de vos problèmes sans déplacement via une prise en main à distance sécurisée.</p>
                <p className="text-[#5865F2] text-sm flex items-center">À partir de 49€ <ArrowRight size={14} className="ml-1" /></p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section pour les professionnels */}
      <section id="professionnels" className="py-16 bg-[#2F3136]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-[#5865F2] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Pour les <span className="text-[#5865F2]">professionnels</span>
              </h2>
            </div>
            <p className="text-gray-300 max-w-3xl">
              Des solutions complètes pour les entreprises de toutes tailles. Notre équipe d'experts vous accompagne dans la gestion de votre parc informatique et la résolution des incidents.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-white font-medium mb-2">Interventions sur site</h3>
                <p className="text-gray-300 text-sm mb-4">Nous nous déplaçons dans vos locaux pour résoudre rapidement vos incidents informatiques.</p>
                <p className="text-[#5865F2] text-sm flex items-center">Tarifs adaptés selon le volume <ArrowRight size={14} className="ml-1" /></p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                <h3 className="text-white font-medium mb-2">Contrats de maintenance</h3>
                <p className="text-gray-300 text-sm mb-4">Solutions d'infogérance complètes avec monitoring, support et interventions régulières.</p>
                <p className="text-[#5865F2] text-sm flex items-center">Sur devis <ArrowRight size={14} className="ml-1" /></p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Services />
      <Faq showLink={false} showAllQuestions={true} />
    </div>
  );
};

export default DepannageInformatique; 
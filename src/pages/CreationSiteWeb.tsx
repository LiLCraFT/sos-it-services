import React, { useEffect } from 'react';
import Faq from '../components/Faq';
import { Monitor, ShoppingBag, Globe, ArrowRight, Code, Smartphone, Search, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const CreationSiteWeb: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Update page title
    document.title = 'SOS IT Services - Création de Sites Web';
    
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
              Création de <span className="text-[#5865F2]">Sites Web</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Des solutions web sur mesure pour mettre en valeur votre activité et développer votre présence en ligne.
            </p>
          </div>
        </div>
      </div>
      
      {/* Section pour les sites vitrine */}
      <section id="web-vitrine" className="py-16 bg-[#36393F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <Monitor className="h-6 w-6 text-[#5865F2] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Site <span className="text-[#5865F2]">Vitrine</span>
              </h2>
            </div>
            <p className="text-gray-300 max-w-3xl">
              Valorisez votre image et présentez votre activité avec un site vitrine professionnel, personnalisé et optimisé pour le référencement.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col">
                <div className="bg-[#5865F2]/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Code className="h-5 w-5 text-[#5865F2]" />
                </div>
                <h3 className="text-white font-medium mb-2">Design sur mesure</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">Création graphique entièrement personnalisée selon votre charte et votre identité visuelle.</p>
                <p className="text-[#5865F2] text-sm flex items-center mt-auto">En savoir plus <ArrowRight size={14} className="ml-1" /></p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col">
                <div className="bg-[#5865F2]/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Smartphone className="h-5 w-5 text-[#5865F2]" />
                </div>
                <h3 className="text-white font-medium mb-2">Responsive design</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">Adaptation parfaite à tous les appareils : ordinateurs, tablettes et smartphones.</p>
                <p className="text-[#5865F2] text-sm flex items-center mt-auto">En savoir plus <ArrowRight size={14} className="ml-1" /></p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col">
                <div className="bg-[#5865F2]/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Search className="h-5 w-5 text-[#5865F2]" />
                </div>
                <h3 className="text-white font-medium mb-2">SEO optimisé</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">Optimisation pour les moteurs de recherche afin d'améliorer votre visibilité en ligne.</p>
                <p className="text-[#5865F2] text-sm flex items-center mt-auto">En savoir plus <ArrowRight size={14} className="ml-1" /></p>
              </div>
            </div>
            
            <div className="mt-10 bg-[#5865F2]/10 rounded-lg p-6 border border-[#5865F2]/20">
              <h3 className="text-white font-medium mb-3">Forfaits site vitrine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2"><span className="text-[#5865F2] font-medium">Essentiel</span> - À partir de 990€</p>
                  <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
                    <li>Design personnalisé</li>
                    <li>Jusqu'à 5 pages</li>
                    <li>Responsive design</li>
                    <li>Optimisation SEO basique</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-2"><span className="text-[#5865F2] font-medium">Premium</span> - À partir de 1490€</p>
                  <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
                    <li>Design sur mesure exclusif</li>
                    <li>Jusqu'à 10 pages</li>
                    <li>Animations et interactions</li>
                    <li>SEO avancé</li>
                    <li>Maintenance 1 an incluse</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section pour les sites e-commerce */}
      <section id="web-ecommerce" className="py-16 bg-[#2F3136]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-6 w-6 text-[#5865F2] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Site <span className="text-[#5865F2]">E-commerce</span>
              </h2>
            </div>
            <p className="text-gray-300 max-w-3xl">
              Vendez vos produits en ligne avec une boutique e-commerce performante, sécurisée et facile à administrer.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col">
                <div className="bg-[#5865F2]/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-5 w-5 text-[#5865F2]" />
                </div>
                <h3 className="text-white font-medium mb-2">Gestion de produits</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">Interface d'administration intuitive pour gérer vos produits, stocks et catégories.</p>
                <p className="text-[#5865F2] text-sm flex items-center mt-auto">En savoir plus <ArrowRight size={14} className="ml-1" /></p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col">
                <div className="bg-[#5865F2]/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5 text-[#5865F2]" />
                </div>
                <h3 className="text-white font-medium mb-2">Paiement sécurisé</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">Intégration de solutions de paiement sécurisées (Stripe, PayPal, CB) conformes aux normes.</p>
                <p className="text-[#5865F2] text-sm flex items-center mt-auto">En savoir plus <ArrowRight size={14} className="ml-1" /></p>
              </div>
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col">
                <div className="bg-[#5865F2]/20 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5 text-[#5865F2]" />
                </div>
                <h3 className="text-white font-medium mb-2">Marketing intégré</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow">Outils marketing intégrés pour promotions, codes promo et fidélisation client.</p>
                <p className="text-[#5865F2] text-sm flex items-center mt-auto">En savoir plus <ArrowRight size={14} className="ml-1" /></p>
              </div>
            </div>
            
            <div className="mt-10 bg-[#5865F2]/10 rounded-lg p-6 border border-[#5865F2]/20">
              <h3 className="text-white font-medium mb-3">Forfaits e-commerce</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2"><span className="text-[#5865F2] font-medium">Standard</span> - À partir de 2490€</p>
                  <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
                    <li>Jusqu'à 100 produits</li>
                    <li>Paiement CB, PayPal</li>
                    <li>Gestion des stocks</li>
                    <li>Responsive design</li>
                    <li>Formation de base</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-2"><span className="text-[#5865F2] font-medium">Business</span> - À partir de 3990€</p>
                  <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
                    <li>Produits illimités</li>
                    <li>Multi-devises, multi-langues</li>
                    <li>Intégration API (transporteurs, ERP)</li>
                    <li>Marketing avancé (abandon panier, etc.)</li>
                    <li>Maintenance et support premium</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section FAQ */}
      <Faq showLink={false} showAllQuestions={false} />
    </div>
  );
};

export default CreationSiteWeb; 
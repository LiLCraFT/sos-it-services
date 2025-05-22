import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Check, Wifi, Monitor, Home, Zap, Clock, BadgeCheck, Shield, Award, User, Users, Wrench, Settings, Package, Search, UserCheck, Percent, Calendar, MessageSquare } from 'lucide-react';

interface ServicePlan {
  name: string;
  price: string;
  duration?: string;
  description?: string;
  badge?: string;
  features?: string[];
  highlight?: boolean;
  icon?: React.ReactNode;
}

interface ServiceGroup {
  title: string;
  description: string;
  icon: React.ReactNode;
  plans: ServicePlan[];
}

interface AbonnementOption {
  name: string;
  price: string;
  duration: string;
  description: string;
  badge?: string;
  highlight?: boolean;
  icon: React.ReactNode;
  features: string[];
}

interface DepannageOption {
  name: string;
  price: string;
  priceSubtext?: string;
  duration?: string;
  description?: string;
  badge?: string;
  highlight?: boolean;
  icon: React.ReactNode;
  features: string[];
}

const DiscordIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 71 55"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.4562 70.6943 45.3914C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
  </svg>
);

const Pricing: React.FC = () => {
  const [abonnementType, setAbonnementType] = useState<'solo' | 'famille'>('solo');
  const [depannageType, setDepannageType] = useState<'distance' | 'domicile'>('distance');
  
  const whatsappNumber = "33695358625"; // Remplacez par votre numéro WhatsApp
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  const abonnements: Record<'solo' | 'famille', AbonnementOption> = {
    solo: {
      name: "Solo",
      price: "49.90",
      duration: "/mois",
      description: "1 personne",
      icon: <User className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "1 personne",
        "Interventions à distance illimitées",
        "1 intervention à domicile par mois inclus (sinon ne payer que le déplacement)",
        "Assistance prioritaire",
        "Sans engagement",
        "50% de crédit d'impôt pour particuliers",
        "Accès exclusif au groupe d'entraide Discord"
      ]
    },
    famille: {
      name: "Famille",
      price: "149.90",
      duration: "/mois",
      description: "Le forfait pour toute la famille",
      badge: "Économique",
      highlight: true,
      icon: <Users className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "Jusqu'à 5 personnes (meme famille)",
        "Interventions à distance illimitées",
        "3 interventions à domicile par mois incluses (sinon ne payer que le déplacement)",
        "Assistance prioritaire",
        "Sans engagement",
        "50% de crédit d'impôt pour particuliers",
        "Accès exclusif au groupe d'entraide Discord"
      ]
    }
  };

  const depannages: Record<'distance' | 'domicile', DepannageOption> = {
    distance: {
      name: "Dépannage à distance",
      price: "49.90",
      priceSubtext: "intervention simple",
      duration: "",
      highlight: true,
      badge: "Populaire",
      icon: <Wifi className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "Diagnostic gratuit inclus",
        "Un expert dédié à votre écoute",
        "Intervention simple (30 min) : 49,90€",
        "Intervention complexe (60 min) : 79,90€",
        "Ne payez que si problème est résolu",
        "50% de crédit d'impôt pour particuliers"
      ]
    },
    domicile: {
      name: "Intervention à domicile",
      price: "149.90",
      priceSubtext: "déplacement inclus",
      description: "1h max incluse",
      icon: <Home className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "Diagnostic gratuit inclus",
        "Un expert dédié à votre écoute",
        "Jusqu'à 1h d'intervention (au delà sur devis)",
        "Frais de déplacement : 49,90€",
        "Possibilité d'intervention le jour-même",
        "50% de crédit d'impôt pour particuliers"
      ]
    }
  };

  const selectedDepannage = depannages[depannageType];
  const selectedAbonnement = abonnements[abonnementType];

  const serviceGroups: ServiceGroup[] = [
    {
      title: "Dépannages",
      description: "Solutions ponctuelles pour résoudre vos problèmes",
      icon: <Wrench className="h-6 w-6 text-[#5865F2]" />,
      plans: []  // Vide car on gère différemment
    },
    {
      title: "Abonnements",
      description: "Assistance illimitée pour une tranquillité permanente",
      icon: <Zap className="h-6 w-6 text-[#5865F2]" />,
      plans: []  // Vide car on gère différemment
    }
  ];

  return (
    <section id="pricing" className="section-spacing bg-gradient-to-b from-[#2F3136] to-[#36393F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center section-title-spacing">
          <div className="section-subtitle-badge">
            <BadgeCheck size={16} className="mr-1.5" />
            <span className="text-sm font-medium">Tarifs transparents</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center">
            <Package className="mr-2 text-[#5865F2]" size={32} /> Nos offres de&nbsp;<span className="text-[#5865F2]">services</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Des solutions adaptées à vos besoins avec diagnostic gratuit et sans engagement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Dépannages section */}
          <div className="flex justify-center">
            <Card className="h-full relative w-full max-w-md border-2 border-[#5865F2] flex flex-col">
              {selectedDepannage.badge && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-[#5865F2] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {selectedDepannage.badge}
                  </div>
                </div>
              )}
              
              <CardHeader className="bg-[#5865F2]/10 pt-6 pb-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center mb-3">
                    <div className="bg-[#5865F2]/20 rounded-full p-2 mr-2">
                      {serviceGroups[0].icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{serviceGroups[0].title}</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{serviceGroups[0].description}</p>
                  
                  <div className="inline-flex flex-wrap items-center justify-center bg-[#2F3136] rounded-lg p-1 mb-3">
                    <button 
                      onClick={() => setDepannageType('distance')}
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-all duration-300 ${depannageType === 'distance' ? 'bg-gradient-to-r from-[#5865F2] via-[#4752C4] to-[#5865F2] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <Wifi className="h-4 w-4 mr-1.5" />
                      <span>À distance</span>
                    </button>
                    <button 
                      onClick={() => setDepannageType('domicile')}
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-all duration-300 ${depannageType === 'domicile' ? 'bg-gradient-to-r from-[#5865F2] via-[#4752C4] to-[#5865F2] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <Home className="h-4 w-4 mr-1.5" />
                      <span>À domicile</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center w-full">
                    <div className="flex flex-col items-center">
                      {'priceSubtext' in selectedDepannage && selectedDepannage.priceSubtext && (
                        <span className="text-green-400 text-xs font-medium uppercase tracking-wider mb-1">
                          {selectedDepannage.priceSubtext}
                        </span>
                      )}
                      
                      <div className="flex justify-center items-center mb-1">
                        <div className="flex items-center">
                          <div className="bg-gray-800/50 rounded p-1.5 border border-gray-700">
                            <span className="text-gray-400 text-sm line-through">{selectedDepannage.price} €</span>
                          </div>
                          <div className="bg-green-400/10 rounded p-2 border border-green-400/30 ml-3">
                            <div className="flex flex-col items-center">
                              <span className="text-green-400 text-2xl font-bold">
                                {(parseFloat(selectedDepannage.price) / 2).toFixed(2)} €
                              </span>
                              <span className="text-xs text-gray-300">après crédit d'impôt</span>
                              {selectedDepannage.duration && (
                                <span className="text-xs text-gray-300 mt-1">{selectedDepannage.duration}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {selectedDepannage.features?.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="bg-green-400/10 rounded-full p-1 mr-2 mt-0.5">
                        {featureIndex === 0 ? <Search className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 1 ? <UserCheck className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 2 ? <Clock className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 3 ? <Clock className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 4 ? <Shield className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         <Percent className="text-green-400 h-3 w-3 flex-shrink-0" />}
                      </div>
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="mt-auto">
                <Button 
                  variant="primary"
                  className="w-full group"
                >
                  Sélectionner
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Abonnements section */}
          <div className="flex justify-center">
            <Card className="h-full relative w-full max-w-md border-2 border-[#5865F2] flex flex-col">
              {selectedAbonnement.badge && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <div className="bg-[#5865F2] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {selectedAbonnement.badge}
                  </div>
                </div>
              )}
              
              <CardHeader className="bg-[#5865F2]/10 pt-4 pb-5">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#5865F2]/20 rounded-full p-2 mr-2">
                      {serviceGroups[1].icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{serviceGroups[1].title}</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{serviceGroups[1].description}</p>
                  
                  <div className="inline-flex items-center justify-center bg-[#2F3136] rounded-lg p-1 mb-3">
                    <button 
                      onClick={() => setAbonnementType('solo')}
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-all duration-300 ${abonnementType === 'solo' ? 'bg-gradient-to-r from-[#5865F2] via-[#4752C4] to-[#5865F2] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <User className="h-4 w-4 mr-1.5" />
                      <span>Solo</span>
                    </button>
                    <button 
                      onClick={() => setAbonnementType('famille')}
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-all duration-300 ${abonnementType === 'famille' ? 'bg-gradient-to-r from-[#5865F2] via-[#4752C4] to-[#5865F2] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      <Users className="h-4 w-4 mr-1.5" />
                      <span>Famille</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center w-full">
                    <div className="flex flex-col items-center">
                      <div className="flex justify-center items-center mb-1">
                        <div className="flex items-center">
                          <div className="bg-gray-800/50 rounded p-1.5 border border-gray-700">
                            <span className="text-gray-400 text-sm line-through">{selectedAbonnement.price} €</span>
                          </div>
                          <div className="bg-green-400/10 rounded p-2 border border-green-400/30 ml-3">
                            <div className="flex flex-col items-center">
                              <span className="text-green-400 text-2xl font-bold">
                                {(parseFloat(selectedAbonnement.price) / 2).toFixed(2)} € <span className="text-sm font-normal">{selectedAbonnement.duration}</span>
                              </span>
                              <span className="text-xs text-gray-300">après crédit d'impôt</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {selectedAbonnement.features?.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className={`${featureIndex === 6 ? 'bg-[#5865F2]/20' : 'bg-green-400/10'} rounded-full p-1 mr-2 mt-0.5`}>
                        {featureIndex === 0 ? <Users className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 1 ? <Wifi className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 2 ? <Home className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 3 ? <Zap className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 4 ? <Calendar className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         featureIndex === 5 ? <Percent className="text-green-400 h-3 w-3 flex-shrink-0" /> :
                         <DiscordIcon />}
                      </div>
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                <Button 
                  variant="primary"
                  className="w-full group"
                >
                  Sélectionner
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="mt-16 text-center bg-[#2F3136] p-8 rounded-xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <Shield className="text-[#5865F2] h-8 w-8 mr-3" />
            <h3 className="text-2xl font-bold text-white">Besoin d'un service <span className="text-[#5865F2]">personnalisé ?</span></h3>
          </div>
          <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
            Nous proposons des solutions sur mesure adaptées à vos besoins spécifiques. Contactez-nous pour un devis gratuit.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-[#36393F] p-4 rounded-lg border border-gray-700 flex flex-col items-center text-center h-32">
              <div className="bg-[#5865F2]/20 rounded-full p-3 mb-2">
                <Clock className="text-[#5865F2] h-5 w-5" />
              </div>
              <span className="text-white text-sm font-medium">Intervention +60min</span>
            </div>
            <div className="bg-[#36393F] p-4 rounded-lg border border-gray-700 flex flex-col items-center text-center h-32">
              <div className="bg-[#5865F2]/20 rounded-full p-3 mb-2">
                <Home className="text-[#5865F2] h-5 w-5" />
              </div>
              <span className="text-white text-sm font-medium">Domicile non couvert par un expert</span>
            </div>
            <div className="bg-[#36393F] p-4 rounded-lg border border-gray-700 flex flex-col items-center text-center h-32">
              <div className="bg-[#5865F2]/20 rounded-full p-3 mb-2">
                <Settings className="text-[#5865F2] h-5 w-5" />
              </div>
              <span className="text-white text-sm font-medium">Configuration pour les professionnels</span>
            </div>
            <div className="bg-[#36393F] p-4 rounded-lg border border-gray-700 flex flex-col items-center text-center h-32">
              <div className="bg-[#5865F2]/20 rounded-full p-3 mb-2">
                <Monitor className="text-[#5865F2] h-5 w-5" />
              </div>
              <span className="text-white text-sm font-medium">Matériel spécifique</span>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            className="px-8"
            onClick={() => window.open(whatsappUrl, '_blank')}
          >
            Demander un devis
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
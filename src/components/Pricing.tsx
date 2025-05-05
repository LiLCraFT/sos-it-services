import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Check, Wifi, Monitor, Home, Zap, Clock, BadgeCheck, Shield, Award, User, Users, Wrench, Settings, Package } from 'lucide-react';

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

const Pricing: React.FC = () => {
  const [abonnementType, setAbonnementType] = useState<'solo' | 'famille'>('solo');
  const [depannageType, setDepannageType] = useState<'distance' | 'domicile'>('distance');
  
  const whatsappNumber = "33695358625"; // Remplacez par votre numéro WhatsApp
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  const abonnements: Record<'solo' | 'famille', AbonnementOption> = {
    solo: {
      name: "Solo",
      price: "29",
      duration: "/mois",
      description: "1 personne",
      icon: <User className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "1 personne",
        "Interventions à distance illimitées",
        "Assistance prioritaire",
        "Sans engagement",
        "Frais réduit si intervention à domicile",
        "50% de crédit d'impôt pour particuliers"
      ]
    },
    famille: {
      name: "Famille",
      price: "69",
      duration: "/mois",
      description: "Jusqu'à 5 personnes",
      badge: "Économique",
      highlight: true,
      icon: <Users className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "Jusqu'à 5 personnes",
        "Interventions à distance illimitées",
        "Assistance prioritaire",
        "Sans engagement",
        "Frais réduit si intervention à domicile",
        "50% de crédit d'impôt pour particuliers"
      ]
    }
  };

  const depannages: Record<'distance' | 'domicile', DepannageOption> = {
    distance: {
      name: "Dépannage à distance",
      price: "49",
      priceSubtext: "à partir de",
      duration: "",
      highlight: true,
      badge: "Populaire",
      icon: <Wifi className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "Intervention jusqu'à 60 min",
        "Diagnostic gratuit inclus",
        "Sans engagement",
        "Paiement uniquement si problème résolu",
        "50% de crédit d'impôt pour particuliers"
      ]
    },
    domicile: {
      name: "Intervention à domicile",
      price: "119",
      priceSubtext: "déplacement inclus",
      description: "1h max incluse",
      badge: "Service Premium",
      icon: <Home className="h-5 w-5 text-[#5865F2]" />,
      features: [
        "1h d'intervention incluse",
        "Frais de déplacement : 25 € (jusqu'à 30 km)",
        "Intervention possible le jour-même",
        "Satisfait ou remboursé",
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
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-colors ${depannageType === 'distance' ? 'bg-[#5865F2] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Wifi className="h-4 w-4 mr-1.5" />
                      <span>À distance</span>
                    </button>
                    <button 
                      onClick={() => setDepannageType('domicile')}
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-colors ${depannageType === 'domicile' ? 'bg-[#5865F2] text-white' : 'text-gray-400 hover:text-white'}`}
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
                                {Math.round(parseInt(selectedDepannage.price) / 2)} €
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
                        <Check className="text-green-400 h-3 w-3 flex-shrink-0" />
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
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-colors ${abonnementType === 'solo' ? 'bg-[#5865F2] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <User className="h-4 w-4 mr-1.5" />
                      <span>Solo</span>
                    </button>
                    <button 
                      onClick={() => setAbonnementType('famille')}
                      className={`flex items-center px-3.5 py-1.5 text-sm rounded-md transition-colors ${abonnementType === 'famille' ? 'bg-[#5865F2] text-white' : 'text-gray-400 hover:text-white'}`}
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
                                {Math.round(parseInt(selectedAbonnement.price) / 2)} € <span className="text-sm font-normal">{selectedAbonnement.duration}</span>
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
                      <div className="bg-green-400/10 rounded-full p-1 mr-2 mt-0.5">
                        <Check className="text-green-400 h-3 w-3 flex-shrink-0" />
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
                  Souscrire
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
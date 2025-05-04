import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Check } from 'lucide-react';

interface PricingSection {
  title: string;
  description: string;
  plans: Array<{
    name: string;
    price: string;
    duration?: string;
    description?: string;
    features?: string[];
  }>;
}

const Pricing: React.FC = () => {
  const sections: PricingSection[] = [
    {
      title: "Dépannage à distance",
      description: "Service disponible dans toute la France avec diagnostic gratuit",
      plans: [
        {
          name: "Dépannage léger",
          price: "49 €",
          duration: "0 à 30 min",
          features: [
            "Diagnostic gratuit inclus",
            "Sans engagement",
            "Paiement uniquement si problème résolu",
            "50% de crédit d'impôt pour particuliers"
          ]
        },
        {
          name: "Dépannage complexe",
          price: "99 €",
          duration: "30 à 60 min",
          features: [
            "Diagnostic gratuit inclus",
            "Sans engagement",
            "Paiement uniquement si problème résolu",
            "50% de crédit d'impôt pour particuliers"
          ]
        },
        {
          name: "Dépannage avancé",
          price: "Sur devis",
          duration: "> 60 min",
          features: [
            "Diagnostic gratuit inclus",
            "Sans engagement",
            "Paiement uniquement si problème résolu",
            "50% de crédit d'impôt pour particuliers"
          ]
        }
      ]
    },
    {
      title: "Assistance illimitée",
      description: "Abonnement mensuel avec interventions à distance illimitées",
      plans: [
        {
          name: "Solo",
          price: "29 €",
          duration: "par mois",
          description: "1 personne",
          features: [
            "Interventions à distance illimitées",
            "Assistance prioritaire",
            "Sans engagement",
            "50% de crédit d'impôt pour particuliers"
          ]
        },
        {
          name: "Famille",
          price: "69 €",
          duration: "par mois",
          description: "Jusqu'à 5 personnes",
          features: [
            "Interventions à distance illimitées",
            "Assistance prioritaire",
            "Sans engagement",
            "50% de crédit d'impôt pour particuliers"
          ]
        }
      ]
    },
    {
      title: "Dépannage à domicile",
      description: "Service personnalisé avec intervention sur place",
      plans: [
        {
          name: "Intervention standard",
          price: "119 €",
          description: "1h max incluse",
          features: [
            "Frais de déplacement : 25 € (jusqu'à 30 km)",
            "Intervention possible le jour-même",
            "Satisfait ou remboursé",
            "50% de crédit d'impôt pour particuliers"
          ]
        }
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-[#36393F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nos offres de services</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Des solutions adaptées à vos besoins avec diagnostic gratuit et sans engagement
          </p>
        </div>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{section.title}</h3>
              <p className="text-gray-300">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {section.plans.map((plan, planIndex) => (
                <Card key={planIndex} className="h-full">
                  <CardHeader>
                    <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      {plan.duration && (
                        <span className="text-gray-400 ml-2">{plan.duration}</span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-gray-300 mt-2">{plan.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features?.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="text-green-400 mr-2 h-5 w-5 flex-shrink-0" />
                          <span className="text-gray-200">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="primary"
                      className="w-full"
                    >
                      Contactez-nous
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Besoin d'un devis personnalisé ? <a href="#contact" className="text-[#5865F2] underline">Contactez-nous</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
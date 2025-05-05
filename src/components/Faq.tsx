import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Link as RouterLink } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItem> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 last:border-0">
      <button
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-white">{question}</h3>
        {isOpen ? (
          <ChevronUp className="text-[#5865F2] h-5 w-5 flex-shrink-0" />
        ) : (
          <ChevronDown className="text-[#5865F2] h-5 w-5 flex-shrink-0" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-300">{answer}</p>
      </div>
    </div>
  );
};

interface FaqProps {
  showLink?: boolean;
  showAllQuestions?: boolean;
}

const Faq: React.FC<FaqProps> = ({ showLink = true, showAllQuestions = false }) => {
  const whatsappNumber = "33695358625";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  
  const allFaqItems: FaqItem[] = [
    {
      question: 'Combien de temps prend une réparation informatique typique ?',
      answer: 'La plupart des réparations basiques peuvent être effectuées en 24-48 heures. Les problèmes plus complexes peuvent prendre 3-5 jours ouvrables. Nous fournissons toujours une estimation de temps avant de commencer tout travail et offrons une garantie "résolution en 30 minutes ou remboursé" pour certains services à distance.'
    },
    {
      question: 'Proposez-vous des services de dépannage à domicile ?',
      answer: 'Oui, nous offrons des services à domicile pour les particuliers et les entreprises. Les frais de déplacement sont de 25€ pour un rayon jusqu\'à 30 km. Pour les interventions à distance, nous proposons un tarif à partir de 49€ avec diagnostic gratuit inclus et paiement uniquement si le problème est résolu.'
    },
    {
      question: 'Quels types de problèmes informatiques pouvez-vous résoudre ?',
      answer: 'Notre équipe d\'experts peut résoudre une large gamme de problèmes : dépannage logiciel, problèmes de réseau, configuration WiFi, gestion des emails, optimisation des performances PC, support pour applications web, récupération de données, sécurité informatique (suppression de virus) et support d\'imprimantes. Nous intervenons aussi bien pour les particuliers que pour les professionnels.'
    },
    {
      question: 'Offrez-vous une garantie sur vos réparations ?',
      answer: 'Toutes nos réparations sont couvertes par une garantie de 90 jours sur les pièces et la main-d\'œuvre. Nous proposons également une politique "satisfait ou remboursé" pour nos interventions à domicile et un paiement uniquement en cas de résolution pour nos services à distance.'
    },
    {
      question: 'Mon ordinateur est très lent, pouvez-vous l\'accélérer ?',
      answer: 'Oui, l\'optimisation des performances est l\'une de nos spécialités. Nous identifions les causes de la lenteur (logiciels malveillants, trop d\'applications au démarrage, disque dur saturé, mémoire insuffisante) et appliquons des solutions adaptées. Dans la plupart des cas, nous pouvons considérablement améliorer les performances de votre ordinateur sans nécessiter d\'investissement matériel supplémentaire.'
    },
    {
      question: 'Proposez-vous des abonnements pour une assistance régulière ?',
      answer: 'Oui, nous proposons des abonnements d\'assistance illimitée pour une tranquillité permanente. Nos forfaits d\'abonnement incluent des interventions prioritaires, un support téléphonique dédié, et des vérifications régulières de sécurité et de performance. C\'est la solution idéale pour les particuliers qui ont besoin d\'une assistance fréquente ou les entreprises qui souhaitent externaliser leur support informatique.'
    },
    {
      question: 'Pouvez-vous récupérer des données d\'un disque dur défaillant ?',
      answer: 'Dans la plupart des cas, oui. Notre taux de réussite pour la récupération de données est supérieur à 90% pour les disques qui n\'ont pas subi de dommages physiques. Pour les disques physiquement endommagés, nous collaborons avec des services de récupération spécialisés pour maximiser vos chances de récupérer vos données précieuses.'
    },
    {
      question: 'Quelles méthodes de paiement acceptez-vous ?',
      answer: 'Nous acceptons toutes les principales cartes de crédit, PayPal, Apple Pay, Google Pay et les espèces. Pour les clients professionnels, nous proposons également des modalités de paiement adaptées. De plus, nos services sont éligibles à un crédit d\'impôt de 50% pour les particuliers.'
    },
    {
      question: 'Proposez-vous des services pour les entreprises ?',
      answer: 'Absolument. Nous offrons des services spécialisés pour les entreprises, y compris l\'infogérance, la configuration réseau professionnelle, le support pour les solutions cloud (M365, Google Workspace), et des interventions rapides pour minimiser l\'impact sur votre activité. Des forfaits sur mesure sont disponibles pour répondre aux besoins spécifiques de votre entreprise.'
    },
    {
      question: 'Comment puis-je prendre rendez-vous pour une intervention ?',
      answer: 'Vous pouvez facilement prendre rendez-vous en nous contactant par WhatsApp, par téléphone ou via notre formulaire de contact en ligne. Pour les problèmes urgents, nous proposons souvent des interventions le jour même. Les diagnostics rapides et les réparations mineures peuvent être effectués sans rendez-vous pour les services à distance.'
    }
  ];
  
  // Liste réduite de 6 questions pour la page d'accueil
  const shortFaqItems: FaqItem[] = allFaqItems.slice(0, 6);
  
  // Choisir quelle liste afficher
  const faqItems = showAllQuestions ? allFaqItems : shortFaqItems;

  return (
    <section id="faq" className="py-20 pt-10 pb-20 bg-[#2F3136]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Foire Aux Questions</h2>
          <p className="text-gray-300">
            Retrouvez les réponses à nos questions les plus fréquentes. Si vous ne trouvez pas ce que vous cherchez,
            n'hésitez pas à nous contacter directement.
          </p>
        </div>
        
        <div className="bg-[#36393F] rounded-lg overflow-hidden shadow-lg">
          <div className="p-6 space-y-0">
            {faqItems.map((item, index) => (
              <FaqItem 
                key={index} 
                question={item.question} 
                answer={item.answer} 
              />
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-300 mb-4">
            {showLink ? (
              <><RouterLink to="/depannage-informatique" className="text-[#5865F2] hover:underline">D'autres questions ?</RouterLink> Contactez-nous directement :</>
            ) : (
              <>D'autres questions ? Contactez-nous directement :</>
            )}
          </p>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] hover:bg-opacity-90 text-white inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  );
};

export default Faq;
import React from 'react';
import { Modal } from './ui/Modal';
import { User, Users, Home } from 'lucide-react';

interface ConfirmSubscriptionChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentType: 'none' | 'solo' | 'family';
  nextType: 'none' | 'solo' | 'family';
  isLoading?: boolean;
}

interface SubscriptionDetails {
  label: string;
  price: string;
  icon: React.ReactNode;
  features: React.ReactNode[];
}

const subscriptionDetails: Record<'none' | 'solo' | 'family', SubscriptionDetails> = {
  none: {
    label: 'A la carte',
    price: '0€ / mois',
    icon: <Home className="h-6 w-6 text-[#5865F2]" />,
    features: [
      'Sans engagement',
      'Paiement à la demande',
      <span key="domicile">Chaque intervention à domicile est facturée séparément</span>,
    ],
  },
  solo: {
    label: 'Solo',
    price: '49,90€ / mois',
    icon: <User className="h-6 w-6 text-[#5865F2]" />,
    features: [
      '1 personne',
      'Interventions à distance illimitées',
      <span key="domicile"><b>1 intervention à domicile/mois incluse</b> <span className="text-gray-400">(sinon déplacement seul à payer)</span></span>,
      'Assistance prioritaire',
      'Sans engagement',
      <span key="credit">50% de crédit d'impôt pour particuliers</span>,
      'Accès exclusif au groupe Discord',
    ],
  },
  family: {
    label: 'Famille',
    price: '149,90€ / mois',
    icon: <Users className="h-6 w-6 text-[#5865F2]" />,
    features: [
      "Jusqu'à 5 personnes (même famille)",
      'Interventions à distance illimitées',
      <span key="domicile"><b>3 interventions à domicile/mois incluses</b> <span className="text-gray-400">(sinon déplacement seul à payer)</span></span>,
      'Assistance prioritaire',
      'Sans engagement',
      <span key="credit">50% de crédit d'impôt pour particuliers</span>,
      'Accès exclusif au groupe Discord',
    ],
  },
};

const getLabel = (type: 'none' | 'solo' | 'family') => {
  return subscriptionDetails[type]?.label || type;
};

export const ConfirmSubscriptionChangeModal: React.FC<ConfirmSubscriptionChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentType,
  nextType,
  isLoading,
}) => {
  const isDowngrade =
    (currentType === 'family' && (nextType === 'solo' || nextType === 'none')) ||
    (currentType === 'solo' && nextType === 'none');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<span>Confirmer le changement d'abonnement</span>} maxWidth="xl">
      <div className="text-white text-base mb-4">
        Êtes-vous sûr de vouloir passer de <b>{getLabel(currentType)}</b> à <b>{getLabel(nextType)}</b> ?
      </div>
      <div className="flex flex-col md:flex-row gap-6 mb-4">
        {[{type: currentType, title: 'Abonnement actuel'}, {type: nextType, title: 'Nouvel abonnement'}].map(({type, title}, idx) => (
          <div
            key={type}
            className="flex-1 bg-[#2F3136] rounded-2xl p-6 border-2 border-[#5865F2]/30 shadow-lg flex flex-col min-w-[270px] max-w-[400px] mx-auto"
          >
            <div className="flex items-center mb-2">
              <div className="bg-[#5865F2]/20 rounded-full p-2 mr-2">
                {subscriptionDetails[type].icon}
              </div>
              <div className="font-semibold text-white text-base">{title}</div>
            </div>
            <div className="text-[#5865F2] font-bold text-xl mb-1">{subscriptionDetails[type].label}</div>
            <div className="text-white font-semibold text-lg mb-3">{subscriptionDetails[type].price}</div>
            <ul className="list-disc list-inside text-gray-200 text-sm space-y-1 pl-2">
              {subscriptionDetails[type].features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {isDowngrade && (
        <div className="mb-4 text-yellow-400 font-medium">
          Votre abonnement actuel sera résilié, mais vous bénéficierez du service jusqu'à la fin du mois en cours.
        </div>
      )}
      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 focus:outline-none"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-[#5865F2] text-white hover:bg-[#4752C4] focus:outline-none disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Changement en cours...' : 'Confirmer'}
        </button>
      </div>
    </Modal>
  );
}; 
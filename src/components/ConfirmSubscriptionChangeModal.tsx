import React from 'react';
import { Home, User, Users } from 'lucide-react';

interface ConfirmSubscriptionChangeModalProps {
  currentType: 'none' | 'solo' | 'family';
  newType: 'none' | 'solo' | 'family';
  onConfirm: () => void;
  onCancel: () => void;
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

export const ConfirmSubscriptionChangeModal: React.FC<ConfirmSubscriptionChangeModalProps> = ({
  currentType,
  newType,
  onConfirm,
  onCancel,
}) => {
  const currentDetails = subscriptionDetails[currentType];
  const newDetails = subscriptionDetails[newType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#36393F] rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-xl font-semibold text-white mb-4">Confirmation du changement d'abonnement</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#2F3136] rounded-lg p-4">
            <div className="flex items-center mb-4">
              {currentDetails.icon}
              <div className="ml-3">
                <h4 className="text-white font-medium">{currentDetails.label}</h4>
                <p className="text-gray-400 text-sm">{currentDetails.price}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {currentDetails.features.map((feature, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start">
                  <span className="text-[#5865F2] mr-2">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#2F3136] rounded-lg p-4">
            <div className="flex items-center mb-4">
              {newDetails.icon}
              <div className="ml-3">
                <h4 className="text-white font-medium">{newDetails.label}</h4>
                <p className="text-gray-400 text-sm">{newDetails.price}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {newDetails.features.map((feature, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start">
                  <span className="text-[#5865F2] mr-2">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#2F3136] text-gray-300 rounded-md hover:bg-[#202225] focus:outline-none"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none"
          >
            Confirmer le changement
          </button>
        </div>
      </div>
    </div>
  );
}; 
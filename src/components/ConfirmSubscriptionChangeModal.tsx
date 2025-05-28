import React from 'react';
import { Modal } from './ui/Modal';

interface ConfirmSubscriptionChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentType: 'none' | 'solo' | 'family';
  nextType: 'none' | 'solo' | 'family';
  isLoading?: boolean;
}

const getLabel = (type: 'none' | 'solo' | 'family') => {
  switch (type) {
    case 'solo': return 'Solo';
    case 'family': return 'Famille';
    case 'none': return 'A la carte';
    default: return type;
  }
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
    <Modal isOpen={isOpen} onClose={onClose} title={<span>Confirmer le changement d'abonnement</span>} maxWidth="sm">
      <div className="text-white text-base mb-4">
        Êtes-vous sûr de vouloir passer de <b>{getLabel(currentType)}</b> à <b>{getLabel(nextType)}</b> ?
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
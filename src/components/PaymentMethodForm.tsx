import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, CreditCard } from 'lucide-react';

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/payment/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cardNumber,
          expiryDate,
          cvc,
          cardholderName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'ajout de la méthode de paiement');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#36393F] rounded-lg p-6">
      <div className="flex items-center mb-4">
        <CreditCard className="w-6 h-6 text-[#5865F2] mr-2" />
        <h3 className="text-xl font-semibold text-white">Ajouter une méthode de paiement</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-300 mb-1">
            Nom sur la carte*
          </label>
          <input
            type="text"
            id="cardholderName"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            placeholder="Jean Dupont"
            required
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">
            Numéro de carte*
          </label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            placeholder="4242 4242 4242 4242"
            required
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">
              Date d'expiration*
            </label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              placeholder="MM/AA"
              required
              maxLength={5}
            />
          </div>

          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-300 mb-1">
              CVC*
            </label>
            <input
              type="text"
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="w-full bg-[#2F3136] text-white rounded-md border border-[#202225] p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              placeholder="123"
              required
              maxLength={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#2F3136] text-gray-300 rounded-md hover:bg-[#202225] focus:outline-none"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter la carte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm; 
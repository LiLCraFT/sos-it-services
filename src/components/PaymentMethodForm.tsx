/// <reference types="vite/client" />

import React, { useState } from 'react';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Utiliser la clé publique depuis les variables d'environnement
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');
console.log('Stripe Public Key:', import.meta.env.VITE_STRIPE_PUBLIC_KEY); // Debug log

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ onSuccess, onCancel }: PaymentMethodFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  // Validation du nom
  const validateName = (name: string) => {
    if (!name.trim()) return "Le nom sur la carte est requis.";
    return null;
  };

  // Validation du champ carte (Stripe gère la plupart des cas)
  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation manuelle
    const nameErr = validateName(cardholderName);
    setNameError(nameErr);
    if (nameErr || cardError) return;

    setLoading(true);

    if (!stripe || !elements) {
      setError('Erreur de configuration Stripe');
      setLoading(false);
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Élément de carte non trouvé');
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      const response = await fetch('http://localhost:3001/api/payments/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
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
        <h3 className="text-xl font-semibold text-white">Modifier le mode de paiement</h3>
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
            className={`w-full bg-[#2F3136] text-white rounded-md border ${nameError ? 'border-red-500' : 'border-[#202225]'} p-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2]`}
            placeholder="Jean Dupont"
            required
          />
          {nameError && <div className="text-red-500 text-xs mt-1">{nameError}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Détails de la carte*
          </label>
          <div className={`w-full bg-[#2F3136] text-white rounded-md border ${cardError ? 'border-red-500' : 'border-[#202225]'} p-2`}>
            <CardElement
              onChange={handleCardChange}
              options={{
                style: {
                  base: {
                    color: '#fff',
                    fontFamily: '"Inter", sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                  },
                },
              }}
            />
          </div>
          {cardError && <div className="text-red-500 text-xs mt-1">{cardError}</div>}
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
            disabled={loading || !stripe || !!nameError || !!cardError}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentMethodForm; 
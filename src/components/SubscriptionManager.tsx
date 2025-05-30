import { useState, useEffect, useCallback } from 'react';
import { Crown, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { ConfirmSubscriptionChangeModal } from './ConfirmSubscriptionChangeModal';

const SubscriptionManager = () => {
  const { user } = useAuth();
  const { paymentMethods, refreshPaymentMethods } = usePaymentMethods();
  const [subscriptionType, setSubscriptionType] = useState<"none" | "solo" | "family">("none");
  const [tempSubscriptionType, setTempSubscriptionType] = useState<"none" | "solo" | "family">("none");
  const [isChangingSubscription, setIsChangingSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.subscriptionType) {
      const allowedTypes = ['none', 'solo', 'family'] as const;
      const safeType = allowedTypes.includes(user.subscriptionType as any)
        ? (user.subscriptionType as typeof allowedTypes[number])
        : 'none';
      setSubscriptionType(safeType);
      setTempSubscriptionType(safeType);
    }
  }, [user]);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3001/api/subscription/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubscriptionStatus(data.status);
        }
      } catch {}
    };
    fetchStatus();
  }, []);

  const getSubscriptionName = () => {
    switch(subscriptionType) {
      case "solo": return "Plan Solo";
      case "family": return "Plan Famille";
      case "none": 
      default: return "A la carte";
    }
  };

  const handleSubscriptionChange = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (tempSubscriptionType === 'solo' || tempSubscriptionType === 'family') {
        await refreshPaymentMethods();
        if (paymentMethods.length === 0) {
          setError("Vous devez ajouter une méthode de paiement avant de souscrire à un abonnement");
          return;
        }
      }

      const response = await fetch('http://localhost:3001/api/subscription/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subscriptionType: tempSubscriptionType
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors du changement d\'abonnement');
      }

      setSubscriptionType(tempSubscriptionType);
      setIsChangingSubscription(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [tempSubscriptionType, paymentMethods.length, refreshPaymentMethods]);

  const handleValidateClick = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleConfirmChange = useCallback(async () => {
    setShowConfirmModal(false);
    await handleSubscriptionChange();
  }, [handleSubscriptionChange]);

  const handleSubscriptionTypeChange = useCallback(async (value: 'none' | 'solo' | 'family') => {
    if (value === 'solo' || value === 'family') {
      await refreshPaymentMethods();
      if (paymentMethods.length === 0) {
        setError("Vous devez ajouter une méthode de paiement avant de souscrire à un abonnement");
        return;
      }
    }
    setError(null);
    setTempSubscriptionType(value);
    setIsChangingSubscription(value !== subscriptionType);
  }, [subscriptionType, paymentMethods.length, refreshPaymentMethods]);

  const isActivationPending = subscriptionStatus === 'incomplete';
  const isActionDisabled = isLoading || isActivationPending;

  return (
    <div className="space-y-6">
      <div className={`p-4 bg-[#36393F] rounded-md relative ${isActivationPending ? 'pointer-events-none opacity-50' : ''}`}>
        <div className="flex items-center space-x-3 mb-2">
          <Wrench className="w-5 h-5 text-gray-400" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400 mr-2">
            <Crown className="w-3 h-3 mr-1" />
            {getSubscriptionName()}
          </span>
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
            Actif
          </span>
          {isActivationPending && (
            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-500/20 text-yellow-500 ml-2">
              Activation en cours (paiement à finaliser)
            </span>
          )}
        </div>
        <p className="text-gray-400 pl-8 text-sm">
          {subscriptionType !== "none" ? "Abonnement sans engagement" : "Pas d'abonnement en cours"}
        </p>
        {error && (
          <div className="pl-8 mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="pl-8 mt-4">
          <select
            className="px-4 py-2 bg-[#36393F] text-white rounded-md border border-[#5865F2] focus:outline-none mr-2"
            value={tempSubscriptionType}
            onChange={(e) => handleSubscriptionTypeChange(e.target.value as 'none' | 'solo' | 'family')}
            disabled={isActionDisabled}
          >
            <option value="none">A la carte - 0€ / mois</option>
            <option value="solo">Solo - 29,99€ / mois (1 personne)</option>
            <option value="family">Famille - 49,99€ / mois (jusqu'à 5 personnes)</option>
          </select>
          {(() => {
            const isNone = subscriptionType === 'none';
            if (isChangingSubscription && tempSubscriptionType !== subscriptionType) {
              return (
                <div className="inline-flex space-x-2">
                  <button 
                    onClick={handleValidateClick}
                    disabled={isActionDisabled}
                    className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Chargement...' : 'Valider'}
                  </button>
                  <button 
                    onClick={() => {
                      setTempSubscriptionType(subscriptionType);
                      setIsChangingSubscription(false);
                      setError(null);
                    }}
                    disabled={isActionDisabled}
                    className="px-4 py-2 bg-transparent border border-gray-500 text-gray-500 rounded-md hover:bg-gray-500/10 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
              );
            }
            return !isNone && (
              <button 
                className={`px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 focus:outline-none ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isActionDisabled}
                onClick={() => {
                  setTempSubscriptionType('none');
                  setIsChangingSubscription(true);
                  setShowConfirmModal(true);
                }}
              >
                Résilier mon abonnement
              </button>
            );
          })()}
        </div>
        <div className="absolute bottom-4 right-4">
          <a
            href="/depannage-informatique"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-[#5865F2] hover:underline hover:text-[#4752C4] font-medium"
          >
            Voir le détail des packages
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-10 10m0 0h7m-7 0V7" /></svg>
          </a>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmSubscriptionChangeModal
          currentType={subscriptionType}
          newType={tempSubscriptionType}
          onConfirm={handleConfirmChange}
          onCancel={() => {
            setShowConfirmModal(false);
            setTempSubscriptionType(subscriptionType);
            setIsChangingSubscription(false);
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionManager; 
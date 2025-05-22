import { useState, useEffect } from 'react';
import { Crown, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionManager = () => {
  const { user } = useAuth();
  const [subscriptionType, setSubscriptionType] = useState<"none" | "solo" | "family">("none");
  const [tempSubscriptionType, setTempSubscriptionType] = useState<"none" | "solo" | "family">("none");
  const [isChangingSubscription, setIsChangingSubscription] = useState(false);

  useEffect(() => {
    if (user && user.subscriptionType) {
      setSubscriptionType(user.subscriptionType);
      setTempSubscriptionType(user.subscriptionType);
    }
  }, [user]);

  const getSubscriptionName = () => {
    switch(subscriptionType) {
      case "solo": return "Plan Solo";
      case "family": return "Plan Famille";
      case "none": 
      default: return "A la carte";
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-[#36393F] rounded-md relative">
        <div className="flex items-center space-x-3 mb-2">
          <Wrench className="w-5 h-5 text-gray-400" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400 mr-2">
            <Crown className="w-3 h-3 mr-1" />
            {getSubscriptionName()}
          </span>
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
            Actif
          </span>
        </div>
        <p className="text-gray-400 pl-8 text-sm">
          {subscriptionType !== "none" ? "Abonnement sans engagement" : "Pas d'abonnement en cours"}
        </p>
        <div className="pl-8 mt-4">
          <select
            className="px-4 py-2 bg-[#36393F] text-white rounded-md border border-[#5865F2] focus:outline-none mr-2"
            value={tempSubscriptionType}
            onChange={e => {
              const value = e.target.value as 'none' | 'solo' | 'family';
              if ((value === 'solo' || value === 'family') && !user?.hasPaymentMethod) {
                // setShowPaymentModal(true); // à activer si tu veux un modal
                return;
              }
              setTempSubscriptionType(value);
              setIsChangingSubscription(value !== subscriptionType);
            }}
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
                    onClick={() => {
                      setSubscriptionType(tempSubscriptionType);
                      setIsChangingSubscription(false);
                    }}
                    className="px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none"
                  >
                    Valider
                  </button>
                  <button 
                    onClick={() => {
                      setTempSubscriptionType(subscriptionType);
                      setIsChangingSubscription(false);
                    }}
                    className="px-4 py-2 bg-transparent border border-gray-500 text-gray-500 rounded-md hover:bg-gray-500/10 focus:outline-none"
                  >
                    Annuler
                  </button>
                </div>
              );
            }
            return !isNone && (
              <button className="px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 focus:outline-none">
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
    </div>
  );
};

export default SubscriptionManager; 
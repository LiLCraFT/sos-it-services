import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import PaymentMethodForm from '../components/PaymentMethodForm';
import { Visa, Mastercard, Amex } from 'react-payment-logos/dist/flat';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const PaymentSettings: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const { updateUser, user } = useAuth();

  const fetchPaymentMethods = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des méthodes de paiement');
      }

      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const refreshUserHasPaymentMethod = async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token || !user) return;
    const response = await fetch('http://localhost:3001/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const userData = await response.json();
      if (userData && typeof userData.hasPaymentMethod !== 'undefined') {
        updateUser({ ...user, hasPaymentMethod: userData.hasPaymentMethod });
      } else if (userData && userData.user && typeof userData.user.hasPaymentMethod !== 'undefined') {
        updateUser({ ...user, hasPaymentMethod: userData.user.hasPaymentMethod });
      }
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?')) {
      return;
    }

    try {
      setIsDeleting(methodId);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/payments/methods?id=${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la méthode de paiement');
      }

      setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
      setSuccess('Méthode de paiement supprimée avec succès');
      await refreshUserHasPaymentMethod();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      setIsSettingDefault(methodId);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payments/methods', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ methodId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de la méthode par défaut');
      }

      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        }))
      );
      setSuccess('Méthode de paiement par défaut mise à jour');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handlePaymentMethodAdded = async () => {
    setShowAddForm(false);
    setSuccess('Nouvelle méthode de paiement ajoutée avec succès');
    await fetchPaymentMethods();
    await refreshUserHasPaymentMethod();
  };

  // Effacer les messages de succès après 5 secondes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Trier les cartes pour mettre la carte par défaut en premier
  const sortedPaymentMethods = [...paymentMethods].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  // Fonction pour retourner l'icône de la carte
  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <Visa style={{ width: 32, height: 32 }} />;
      case 'mastercard':
        return <Mastercard style={{ width: 32, height: 32 }} />;
      case 'amex':
      case 'american express':
        return <Amex style={{ width: 32, height: 32 }} />;
      default:
        return <CreditCard className="w-6 h-6 text-[#5865F2] mr-3" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-[200px]">
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Méthodes de paiement</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-[#5865F2] text-white rounded-md hover:bg-[#4752C4] focus:outline-none transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une carte
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-500 text-sm">{success}</span>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6">
          <PaymentMethodForm
            onSuccess={handlePaymentMethodAdded}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {sortedPaymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-[#36393F] rounded-lg p-4 flex items-center justify-between hover:bg-[#40444B] transition-colors${method.isDefault ? ' border-2 border-[#5865F2]' : ''}`}
          >
            <div className="flex items-center">
              <span className="mr-3">{getCardIcon(method.brand)}</span>
              <div>
                <div className="text-white font-medium">
                  {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                </div>
                <div className="text-gray-400 text-sm">
                  Expire {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!method.isDefault && (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="text-[#5865F2] hover:text-[#4752C4] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSettingDefault === method.id}
                >
                  {isSettingDefault === method.id ? 'Mise à jour...' : 'Définir par défaut'}
                </button>
              )}
              {method.isDefault && (
                <span className="ml-2 px-2 py-1 bg-[#5865F2] text-white text-xs rounded">Par défaut</span>
              )}
              <button
                onClick={() => handleDeleteMethod(method.id)}
                className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={method.isDefault || isDeleting === method.id}
                title={method.isDefault ? "Impossible de supprimer la carte par défaut" : "Supprimer cette carte"}
              >
                {isDeleting === method.id ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}

        {paymentMethods.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucune méthode de paiement enregistrée</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-[#5865F2] hover:text-[#4752C4] transition-colors"
            >
              Ajouter votre première carte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSettings; 
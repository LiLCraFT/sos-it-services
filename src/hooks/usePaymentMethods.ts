import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const { updatePaymentMethodStatus } = useAuth();
  const isInitialized = useRef(false);

  const fetchPaymentMethods = useCallback(async () => {
    if (loading) return; // Évite les appels multiples pendant le chargement
    setLoading(true);
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/payments/methods', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const methods = await response.json();
      setPaymentMethods(methods);
      updatePaymentMethodStatus(methods.length > 0);
    }
    setLoading(false);
  }, [updatePaymentMethodStatus, loading]);

  // Chargement initial uniquement
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchPaymentMethods();
    }
  }, [fetchPaymentMethods]);

  return { 
    paymentMethods, 
    loading,
    refreshPaymentMethods: fetchPaymentMethods 
  };
} 
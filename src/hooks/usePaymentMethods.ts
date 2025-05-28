import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/payments/methods', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPaymentMethods(await response.json());
      }
      setLoading(false);
    };
    fetchPaymentMethods();
  }, []);

  return { paymentMethods, loading };
} 
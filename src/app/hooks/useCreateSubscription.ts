import { useState } from 'react';
import { useAuth } from "@/lib/auth";

interface CreateSubscriptionParams {
  planToken: string;
  amount: number;
  planName: string;
}

interface SubscriptionResponse {
  checkoutUrl: string;
  subscriptionId: string;
}

export const useCreateSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const createSubscription = async ({
    planToken,
    amount,
    planName,
  }: CreateSubscriptionParams): Promise<SubscriptionResponse | null> => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Token de autenticación no encontrado');
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`https://botopia-whatsapp-api-production.up.railway.app/api/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planToken,
          amount,
          planName
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear la suscripción');
      }

      const data = await response.json();
      return data;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createSubscription,
    loading,
    error,
  };
};
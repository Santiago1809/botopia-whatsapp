import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface SubscriptionDetails {
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  nextPaymentDate: string;
  lastPaymentDate: string;
  status: string;
  details: {
    clientName: string;
    documentType: string;
    documentNumber: string;
  };
}

interface Limits {
  maxWhatsappNumbers: number;
  maxMessages: number;
  aiEnabled: boolean;
}

interface Features {
  canAddWhatsapp: boolean;
  canSendMessages: boolean;
  canUseAI: boolean;
  canCreateTemplates: boolean;
}

interface SubscriptionInfo {
  currentPlan: string;
  lastUpdated: string;
  subscription: SubscriptionDetails | null;
  limits: Limits;
  features: Features;
}

export const useSubscriptionInfo = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/info`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener la información de la suscripción');
        }

        const data = await response.json();
        setSubscriptionInfo(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [token]); // Agregamos token como única dependencia

  return { subscriptionInfo, loading, error };
};
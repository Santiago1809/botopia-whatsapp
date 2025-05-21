import { useAuth } from "@/lib/auth";
import { useState } from "react";

// Define the payment request interface
interface PaymentRequest {
  planToken: string;
  amount: number;
  planName: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

// Define the payment response interface
interface PaymentResponse {
  redirect_url: string;
  payment_id: string;
  status: string;
  message?: string; // Add optional message for error responses
}

export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const createPayment = async (body: PaymentRequest) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const data: PaymentResponse = await res.json();
      setLoading(false);

      if (!res.ok) {
        const errorMessage = data.message || "Error al crear el pago";
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  return { createPayment, loading, error };
}

import { useState } from "react";

export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (body: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Error al crear el pago");
        throw new Error(data.message);
      }

      return data; // debe incluir redirect_url
    } catch (err: any) {
      setError(err.message || "Error desconocido");
      setLoading(false);
      throw err;
    }
  };

  return { createPayment, loading, error };
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetch("/api/payments/latest-success"); // usar orden del usuario
      const data = await res.json();

      if (data.payment_id) {
        router.replace(`/billing/success?payment_id=${data.payment_id}`);
      }
    };

    checkStatus();
  }, []);

  return <p>Procesando pago...</p>;
}

// app/billing/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const [status, setStatus] = useState<"pending" | "paid" | "error">(
    "pending"
  );

  useEffect(() => {
    console.log("📥 paymentId recibido en frontend:", paymentId);

    if (!paymentId) {
      setStatus("error");
      return;
    }
    // Llama al endpoint de confirmación en tu backend
    fetch(`/api/payments/confirm-payment?payment_id=${paymentId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 Respuesta del backend:", data);
        if (data.status === "paid") {
          setStatus("paid");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [paymentId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      {status === "pending" && <p className="text-lg">Verificando tu pago…</p>}
      {status === "paid" && (
        <>
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            ¡Pago exitoso!
          </h1>
          <p className="mb-6">Gracias por tu suscripción. Tu plan está activo.</p>
          <Link
            href="/billing"
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Volver a Facturación
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Hubo un problema
          </h1>
          <p className="mb-6">
            No pudimos confirmar tu pago. Si el cargo fue realizado, contáctanos.
          </p>
          <Link
            href="/billing"
            className="px-4 py-2 bg-secondary text-white rounded-md"
          >
            Volver a intentarlo
          </Link>
        </>
      )}
    </div>
  );
}
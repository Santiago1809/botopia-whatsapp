// app/billing/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams ? searchParams.get("payment_id") || "" : "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center transform transition-all duration-700 hover:scale-105">
        <h1 className="text-3xl font-bold text-green-600 mb-4 animate-bounce">
          ¡Pago Exitoso!
        </h1>
        <p className="text-lg mb-6">
          Gracias por tu suscripción. Tu plan está activo.
        </p>
        {paymentId && (
          <div className="mb-6">
            <p className="text-md text-gray-700">Tu ID de pago es:</p>
            <p className="text-xl font-mono font-semibold text-blue-600">
              {paymentId}
            </p>
          </div>
        )}
        <Link
          href="/billing"
          className="px-6 py-3 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition-colors"
        >
          Volver a Facturación
        </Link>
      </div>
    </div>
  );
}
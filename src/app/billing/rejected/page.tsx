"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RejectedPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center transform transition-all duration-700 hover:scale-105">
        <h1 className="text-3xl font-bold text-red-600 mb-4 animate-bounce">
          ¡Pago Rechazado!
        </h1>
        <p className="text-lg mb-6">
          Lo sentimos, tu pago no fue aprobado. Por favor, inténtalo nuevamente o contacta a soporte.
        </p>
        {paymentId && (
          <div className="mb-6">
            <p className="text-md text-gray-700">Tu ID de pago es:</p>
            <p className="text-xl font-mono font-semibold text-red-600">
              {paymentId}
            </p>
          </div>
        )}
        <Link
          href="/billing"
          className="px-6 py-3 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition-colors"
        >
          Volver a Facturación
        </Link>
      </div>
    </div>
  );
}
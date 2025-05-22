"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [, setIsChecking] = useState(true);
  const { token } = useAuth(); // Asegúrate de tener el token de autenticación disponible

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/latest-success`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error('Error al verificar el pago');
        
        const data = await res.json();
        //console.log("📥 data recibido en frontend:", data);

        if (data.status === "paid") {
          // Aquí puedes redirigir al usuario a la página de éxito
          router.replace(`/billing/success?payment_id=${data.payment_id}`);
        } else if (data.status === "pending") {
          // Si el pago está pendiente, puedes mostrar un mensaje o un spinner
          setIsChecking(true);
        } else if (data.status === "rejected") {
          // Si el pago fue rechazado, redirigir a la página de rechazo
          router.replace(`/billing/error?payment_id=${data.payment_id}`);
        } else {
          setError("No se encontró el ID del pago");
        }
      } catch (err) {
        setError("Error al procesar el pago");
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    };

    const interval = setInterval(checkStatus, 3000); // Polling cada 3 segundos

    return () => clearInterval(interval);
  }, [router, token]);

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push('/billing')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Confirmando tu pago
        </h1>
        
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-6"/>
        
        <p className="text-lg text-gray-700 mb-4">
          Estamos verificando tu transacción...
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-sm text-yellow-700">
            <strong>Importante:</strong> Por favor, no cierres ni refresques esta página 
            mientras confirmamos tu pago.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          Este proceso puede tomar unos segundos. Te redirigiremos automáticamente 
          cuando la confirmación esté completa.
        </p>
      </div>
    </div>
  );
}
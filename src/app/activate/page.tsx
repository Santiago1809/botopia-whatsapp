"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DiagonalBackground from "@/components/DiagonalBackground";

export default function ActivateAccount() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const activateAccount = useCallback(
    async (token: string) => {
      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

        const response = await fetch(`${BACKEND_URL}/api/auth/activate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al activar la cuenta");
        }

        setMessage(
          "¡Cuenta activada exitosamente! Redirigiendo al inicio de sesión..."
        );
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } catch (error) {
        setError((error as Error)?.message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Activar la cuenta con el token
      activateAccount(token);
    } else {
      setLoading(false);
      setError("Token de activación no válido");
    }
  }, [searchParams, activateAccount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative">
        <DiagonalBackground className="text-secondary" />
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Activando cuenta...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras procesamos tu activación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative">
      <DiagonalBackground className="text-secondary" />

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Logo y mensaje - Lado izquierdo */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col items-center justify-center bg-white bg-opacity-80">
          <Image
            src="/Logo.png"
            alt="Botopia Logo"
            width={180}
            height={60}
            className="mb-4 sm:mb-6 w-40 sm:w-auto"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
            {message ? "¡Activación Exitosa!" : "Activar Cuenta"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 text-center">
            {message
              ? "Tu cuenta ha sido activada correctamente"
              : "Activa tu cuenta para comenzar a usar Botopia"}
          </p>
        </div>

        {/* Contenido - Lado derecho */}
        <div className="md:w-3/5 p-6 sm:p-8 bg-white flex items-center justify-center">
          <div className="text-center w-full">
            {message ? (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  ¡Cuenta activada!
                </h2>
                <p className="text-green-600 mb-6">{message}</p>
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Redirigiendo...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Error en la activación
                </h2>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/register")}
                    className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Intentar registro nuevamente
                  </button>
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Ir al inicio de sesión
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

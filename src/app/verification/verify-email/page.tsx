"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DiagonalBackground from "@/components/DiagonalBackground";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState(
    "Verificando tu correo electrónico..."
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no proporcionado");
        return;
      }

      if (!email) {
        setStatus("error");
        setMessage("Correo electrónico no proporcionado");
        return;
      }

      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

        const response = await fetch(`${BACKEND_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "email",
            code: token,
            email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al verificar el correo electrónico"
          );
        }

        // Si la verificación es exitosa
        setStatus("success");
        setMessage("¡Tu correo electrónico ha sido verificado con éxito!");

        // Esperar 3 segundos y luego redirigir al login
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          (error as Error)?.message ||
            "Error al verificar el correo electrónico"
        );
      }
    };

    verifyEmailToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative">
      {/* Fondo diagonal: blanco y secundario */}
      <DiagonalBackground className="text-secondary" />

      <div className="w-full max-w-md bg-background rounded-xl shadow-md overflow-hidden relative z-10 p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/Logo.png"
            alt="Botopia Logo"
            width={180}
            height={60}
            className="mb-6"
            priority
          />

          <h1 className="text-2xl font-bold text-foreground mb-4">
            Verificación de Correo
          </h1>

          {/* Estado de carga */}
          {status === "loading" && (
            <div className="my-6 flex flex-col items-center">
              <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {/* Estado de éxito */}
          {status === "success" && (
            <div className="my-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-700 mb-2 font-semibold">{message}</p>
              <p className="text-muted-foreground text-sm">
                Serás redirigido en unos segundos...
              </p>
            </div>
          )}

          {/* Estado de error */}
          {status === "error" && (
            <div className="my-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-700 mb-2 font-semibold">{message}</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Ir al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

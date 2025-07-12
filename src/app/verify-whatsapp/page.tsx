"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DiagonalBackground from "@/components/DiagonalBackground";
import VerityOTPCode from "@/components/VerityOTPCode";

// Función para remover el indicativo del país del número de teléfono
const removeCountryCode = (phoneNumber: string): string => {
  // Si el número comienza con +, eliminamos el + y los primeros 2 dígitos (asumiendo código de país)
  if (phoneNumber.startsWith("+")) {
    return phoneNumber.substring(3); // Elimina +XX
  }
  return phoneNumber;
};

export default function VerifyWhatsApp() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Obtener email y teléfono de los parámetros de la URL
    const emailParam = searchParams.get("email");
    const phoneParam = searchParams.get("phone");

    if (emailParam) setEmail(emailParam);
    if (phoneParam) setPhone(phoneParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      setIsSubmitting(false);
      return;
    }

    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

      // Remover el indicativo del país del número de teléfono
      const phoneWithoutCountryCode = removeCountryCode(phone);

      const response = await fetch(`${BACKEND_URL}/api/auth/verify-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "phone",
          phone: phoneWithoutCountryCode,
          code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Código inválido");
      }

      // Si la verificación es exitosa, redirigir al login
      router.push("/login?verified=true");
    } catch (error) {
      setError((error as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

      // Remover el indicativo del país del número de teléfono
      const phoneWithoutCountryCode = removeCountryCode(phone);

      const response = await fetch(`${BACKEND_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone: phoneWithoutCountryCode,
        }),
      });

      if (response.ok) {
        setError("");
        // Mostrar mensaje de éxito temporal
        const successDiv = document.createElement("div");
        successDiv.className =
          "mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm";
        successDiv.textContent = "Código reenviado exitosamente";
        const form = document.querySelector("form");
        const firstChild = form?.firstChild;
        if (form && firstChild) {
          form.insertBefore(successDiv, firstChild);
        }
        setTimeout(() => successDiv.remove(), 3000);
      }
    } catch {
      setError("Error al reenviar el código");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative">
      {/* Fondo diagonal: blanco y secundario */}
      <DiagonalBackground className="text-secondary" />

      <div className="w-full max-w-4xl bg-background rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Logo y mensaje - Lado izquierdo */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col items-center justify-center bg-background bg-opacity-80">
          <Image
            src="/Logo.png"
            alt="Botopia Logo"
            width={180}
            height={60}
            className="mb-4 sm:mb-6 w-40 sm:w-auto"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center">
            Verificar WhatsApp
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 text-center">
            Para completar tu registro, necesitamos verificar tu número de
            WhatsApp
          </p>
          {phone && (
            <p className="text-sm text-shadow-muted mt-2 text-center font-medium">
              Código enviado a: {phone}
            </p>
          )}
        </div>

        {/* Formulario de verificación - Lado derecho */}
        <div className="md:w-3/5 p-6 sm:p-8 bg-background">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-shadow-muted">
              Código de verificación
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Ingresa el código de 6 dígitos que enviamos a tu WhatsApp
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <VerityOTPCode
            code={code}
            setCode={setCode}
            error={error}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              ¿No recibiste el código?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              Reenviar código
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <a
                href="/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

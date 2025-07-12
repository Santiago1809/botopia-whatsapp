"use client";
import DiagonalBackground from "@/components/DiagonalBackground";
import RequestOTPCode from "@/components/RequestOTPCode";
import VerityOTPCode from "@/components/VerityOTPCode";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Page() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentForm, setCurrentForm] = useState<
    "request" | "verify" | "setPassword"
  >("request");
  const router = useRouter();

  const handleRequestCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch(`${BACKEND_URL}/api/auth/request-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      setError(
        res.status === 404
          ? "No hemos encontrado una cuenta asociada a este correo"
          : "Error al enviar el correo de verificación"
      );
    } else {
      setCurrentForm("verify");
      setError("");
    }
    setIsSubmitting(false);
  };
  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch(
      `${BACKEND_URL}/api/auth/request-password-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, type: "email", code }),
      }
    );
    if (!res.ok) {
      setError(
        res.status === 400
          ? "OTP inválido o expirado"
          : "Error al enviar el código de verificación"
      );
    } else {
      setCurrentForm("setPassword");
      setError("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative">
      <DiagonalBackground className="text-secondary" />
      <div className="w-full max-w-4xl bg-background rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
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
            Bienvenido a Botopia
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 text-center">
            La plataforma integral para gestionar tus automatizaciones
          </p>
        </div>{" "}
        {currentForm === "request" && (
          <RequestOTPCode
            handleSubmit={handleRequestCode}
            setEmail={setEmail}
            error={error}
            email={email}
            isSubmitting={isSubmitting}
          />
        )}
        {currentForm === "verify" && (
          <VerityOTPCode
            code={code}
            setCode={setCode}
            error={error}
            handleSubmit={handleVerifyCode}
            isSubmitting={isSubmitting}
          />
        )}
        {currentForm === "setPassword" && (
          <div className="md:w-3/5 p-6 sm:p-8 bg-background">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                ¡Solicitud Enviada!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Hemos enviado un enlace de restablecimiento a tu correo
                electrónico.
              </p>
            </div>

            <div className="bg-primary/10 dark:bg-primary/5 border-l-4 border-primary p-4 rounded-md mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-foreground">
                    Revisa tu bandeja de entrada
                  </h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>
                      Haz clic en el enlace que te hemos enviado a{" "}
                      <strong>{email}</strong> para establecer una nueva
                      contraseña. Si no encuentras el correo, revisa tu carpeta
                      de spam.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="rounded-md bg-primary/10 dark:bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 dark:hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Volver al inicio de sesión
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentForm("request")}
                        className="ml-3 rounded-md bg-primary/10 dark:bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 dark:hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el correo?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentForm("request")}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Solicitar de nuevo
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

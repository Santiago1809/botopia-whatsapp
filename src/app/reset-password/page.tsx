"use client";
import ChangePassword from "@/components/ChangePassword";
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
  const [password, setPassword] = useState("");
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

    const res = await fetch(`${BACKEND_URL}/api/auth/verify-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp: code }),
    });
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

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword: password }),
    });

    if (!res.ok) {
      setError(
        "Error al restablecer la contraseña. Por favor, intenta de nuevo."
      );
    } else {
      router.push("/login");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative">
      <DiagonalBackground className="text-secondary" />
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
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
            Bienvenido a Botopia
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 text-center">
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
          <ChangePassword
            error={error}
            handleSubmit={handleResetPassword}
            isSubmitting={isSubmitting}
            password={password}
            setPassword={setPassword}
          />
        )}
      </div>
    </div>
  );
}

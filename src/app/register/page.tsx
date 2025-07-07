"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import DiagonalBackground from "@/components/DiagonalBackground";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+57"); // Default country code
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();
  const { register } = useAuth();

  // Lista de códigos de país populares
  const countryCodes = [
    { code: "+1", country: "Estados Unidos/Canadá" },
    { code: "+34", country: "España" },
    { code: "+502", country: "Guatemala" },
    { code: "+51", country: "Perú" },
    { code: "+52", country: "México" },
    { code: "+54", country: "Argentina" },
    { code: "+56", country: "Chile" },
    { code: "+57", country: "Colombia" },
    { code: "+58", country: "Venezuela" },
    { code: "+593", country: "Ecuador" },
    { code: "+81", country: "Japón" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validación de contraseñas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    // Validación del formato del número de teléfono (solo dígitos)
    if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
      setError("El número de teléfono debe contener solo dígitos");
      setIsSubmitting(false);
      return;
    }

    try {
      await register(username, email, password, countryCode, phoneNumber);
      // En lugar de redirigir al home, guardamos el email y mostramos mensaje de éxito
      setRegisteredEmail(email);
      setSuccess(true);
      // Esperar 3 segundos y luego redirigir a verificación WhatsApp
      setTimeout(() => {
        router.push(
          `/verify-whatsapp?email=${encodeURIComponent(
            email
          )}&phone=${encodeURIComponent(phoneNumber)}`
        );
      }, 3000);
    } catch (error) {
      setError((error as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative bg-background">
      {/* Fondo diagonal: blanco y secundario */}
      <DiagonalBackground className="text-secondary" />

      <div className="w-full max-w-4xl bg-card rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Logo y mensaje - Lado izquierdo */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col items-center justify-center bg-card bg-opacity-80">
          <Image
            src="/Logo.png"
            alt="Botopia Logo"
            width={180}
            height={60}
            className="mb-4 sm:mb-6 w-40 sm:w-auto"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center">
            {success ? "¡Registro Exitoso!" : "Únete a Botopia"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 text-center">
            {success
              ? "Tu cuenta ha sido creada. Revisa tu correo electrónico para activar tu cuenta."
              : "Crea una cuenta y comienza a disfrutar de todas las funcionalidades de nuestra plataforma"}
          </p>
        </div>

        {/* Formulario o mensaje de éxito - Lado derecho */}
        <div className="md:w-3/5 p-6 sm:p-8 bg-card">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
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
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                  ¡Cuenta creada exitosamente!
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Hemos enviado un enlace de activación a{" "}
                  <strong>{registeredEmail}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  En unos segundos serás redirigido para verificar tu número de
                  WhatsApp...
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Redirigiendo...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Crear cuenta
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Completa el formulario para registrarte
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label
                    htmlFor="username"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Nombre de usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Número de teléfono
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <select
                      id="countryCode"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full sm:w-36 px-3 py-2 border border-input bg-background text-foreground sm:rounded-l-md rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Número de celular"
                      className="flex-1 sm:rounded-l-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="mt-2 sm:mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {isSubmitting ? "Registrando..." : "Registrarse"}
                  </button>
                </div>
              </form>

              <div className="mt-6 sm:mt-8 text-center">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

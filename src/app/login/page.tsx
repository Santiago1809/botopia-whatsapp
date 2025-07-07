"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import DiagonalBackground from "@/components/DiagonalBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    // Verificar diferentes tipos de mensajes de los parámetros de búsqueda
    const verified = searchParams.get("verified");
    const messageParam = searchParams.get("message");

    if (verified === "true") {
      setMessage({
        type: "success",
        text: "¡Verificación exitosa! Tu cuenta ha sido activada. Ahora puedes iniciar sesión.",
      });
      // Ocultar el mensaje después de 7 segundos
      setTimeout(() => setMessage(null), 7000);
    } else if (messageParam === "password-reset-success") {
      setMessage({
        type: "success",
        text: "¡Contraseña cambiada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.",
      });
      // Ocultar el mensaje después de 7 segundos
      setTimeout(() => setMessage(null), 7000);
    } else if (messageParam === "session-expired") {
      setMessage({
        type: "info",
        text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Validación básica antes de enviar
    if (!identifier.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage(null); // Limpiar mensajes anteriores

    try {
      await login(identifier, password);
      router.push("/");
    } catch (err: unknown) {
      // Manejar diferentes tipos de errores
      const error = err as { message?: string; status?: number };

      let errorMessage = "Error desconocido al iniciar sesión";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = "Las credenciales son incorrectas. Inténtalo de nuevo.";
      } else if (error?.status === 403) {
        errorMessage =
          "Tu cuenta está bloqueada o desactivada. Contacta al soporte.";
      } else if (error?.status === 429) {
        errorMessage =
          "Demasiados intentos de inicio de sesión. Espera un momento antes de intentar nuevamente.";
      } else if (error?.status && error.status >= 500) {
        errorMessage = "Error del servidor. Por favor, inténtalo más tarde.";
      } else if (!navigator.onLine) {
        errorMessage =
          "Sin conexión a internet. Verifica tu conexión e inténtalo de nuevo.";
      } else {
        errorMessage =
          "Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative bg-background">
      {/* Fondo diagonal: blanco y secundario */}
      <DiagonalBackground className="text-secondary" />

      <div className="w-full max-w-4xl bg-card rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Logo y mensaje de bienvenida - Lado izquierdo */}
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
            Bienvenido a Botopia
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 text-center">
            La plataforma integral para gestionar tus automatizaciones
          </p>
        </div>

        {/* Formulario - Lado derecho */}
        <div className="md:w-3/5 p-6 sm:p-8 bg-card">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Iniciar Sesión
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg border-l-4 ${
                message.type === "success"
                  ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : message.type === "error"
                  ? "bg-red-50 border-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {message.type === "success" && (
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {message.type === "error" && (
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {message.type === "info" && (
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setMessage(null)}
                      className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-lg border-l-4 bg-red-50 border-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
            noValidate
          >
            <div>
              <Label
                htmlFor="identifier"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Correo, usuario o teléfono
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ingresa tu correo, usuario o teléfono"
                className="w-full"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Contraseña
                </Label>
                <a
                  href="/reset-password"
                  className="text-xs text-primary hover:text-primary/80"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="mt-2 sm:mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <a
                href="/register"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

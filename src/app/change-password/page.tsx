"use client";
import DiagonalBackground from "@/components/DiagonalBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Page() {
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!token) {
      setError("Token de restablecimiento no válido");
      return;
    }

    if (!email) {
      setError("Email no proporcionado");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken: token,
          newPassword,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      // Redirect to login page on success
      router.push("/login?message=password-reset-success");
    } catch (err) {
      setError(
        typeof err === "object" && err !== null && "message" in err
          ? String(err.message)
          : "Ocurrió un error al cambiar la contraseña"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative bg-background">
      <DiagonalBackground className="text-secondary" />
      <div className="w-full max-w-4xl bg-card rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row relative z-10">
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
            Cambiar contraseña
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 text-center">
            Para cambiar tu contraseña, llena el siguiente formulario y de nuevo
            podrás acceder a tu cuenta.
          </p>
        </div>
        <div className="md:w-3/5 p-6 sm:p-8 bg-card">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Cambiar contraseña
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Tu contraseña debe tener al menos 8 caracteres, una letra
              mayúscula, una letra minúscula, un número y un carácter especial.
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Contraseña nueva
              </Label>
              <Input
                id="newPassword"
                type="password"
                className="w-full"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
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
                className="w-full"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
              />
            </div>
            <div className="mt-2 sm:mt-4">
              <Button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Restablecer contraseña"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+52"); // Default country code
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  // Lista de códigos de país populares
  const countryCodes = [
    { code: "+1", country: "Estados Unidos/Canadá" },
    { code: "+52", country: "México" },
    { code: "+34", country: "España" },
    { code: "+57", country: "Colombia" },
    { code: "+54", country: "Argentina" },
    { code: "+56", country: "Chile" },
    { code: "+51", country: "Perú" },
    { code: "+58", country: "Venezuela" },
    { code: "+593", country: "Ecuador" },
    { code: "+502", country: "Guatemala" },
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
      router.push("/");
    } catch (error) {
      setError((error as Error)?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-tertiary/40 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Image
            src="/logo.svg"
            alt="Botopia Logo"
            width={150}
            height={40}
            className="mb-4 sm:mb-6 w-32 sm:w-auto"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Crear cuenta
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 text-center">
            Regístrate para comenzar a usar la plataforma
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de teléfono
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <select
                id="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full sm:w-36 px-3 py-2 border border-gray-300 sm:rounded-l-md rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} {country.country}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Número de celular"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md sm:rounded-l-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
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
          <p className="text-sm text-gray-600">
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
  );
}

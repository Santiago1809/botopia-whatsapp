"use client";

import React from "react";
import MetaAppTabs from "./MetaAppTabs";
import { MetaAppType } from "./MetaAppTabs";

interface MetaHeroProps {
  activeApp: MetaAppType;
  onAppChange: (app: MetaAppType) => void;
}

/**
 * Componente Hero específico para la sección de Meta Business API
 * Contiene el título, descripción y el selector de aplicaciones de Meta
 */
export default function MetaHero({ activeApp, onAppChange }: MetaHeroProps) {
  // Mapeo de colores para el fondo del hero según la app activa
  const heroBgGradient = {
    whatsapp: "from-green-600/90 to-green-800",
    facebook: "from-blue-600/90 to-blue-800",
    instagram: "from-pink-600/90 to-pink-800",
    threads: "from-gray-700/90 to-gray-900",
  }[activeApp];

  // Textos según la app activa
  const heroText = {
    whatsapp: {
      title: "WhatsApp Business API",
      description:
        "Automatiza tu comunicación con clientes a través de la plataforma de mensajería más popular del mundo.",
    },
    facebook: {
      title: "Facebook Business API",
      description:
        "Conecta con tus clientes a través de la red social más grande del mundo y automatiza tus campañas.",
    },
    instagram: {
      title: "Instagram Business API",
      description:
        "Gestiona tus comunicaciones y contenido en la plataforma visual más influyente del mercado.",
    },
    threads: {
      title: "Threads Business API",
      description:
        "Aprovecha la nueva plataforma de conversaciones para conectar con tu audiencia de forma efectiva.",
    },
  }[activeApp];

  return (
    <section className={`py-12 bg-gradient-to-br ${heroBgGradient} text-white`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {heroText.title}
            </h1>
            <p className="text-lg mb-6 text-white/90">{heroText.description}</p>
            <div className="mt-8">
              {/* Selector de apps integrado dentro del hero */}
              <MetaAppTabs activeApp={activeApp} onAppChange={onAppChange} />
            </div>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="relative z-10 bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
                {" "}
                {/* Logo de la aplicación correspondiente */}
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center mb-4">
                    {activeApp === "whatsapp" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        className="text-white"
                      >
                        <path
                          fill="currentColor"
                          d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01"
                        />
                      </svg>
                    )}
                    {activeApp === "facebook" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        className="text-white"
                      >
                        <path
                          fill="currentColor"
                          d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"
                        />
                      </svg>
                    )}
                    {activeApp === "instagram" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        className="text-white"
                      >
                        <path
                          fill="currentColor"
                          d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
                        />
                      </svg>
                    )}
                    {activeApp === "threads" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        className="text-white"
                      >
                        <path
                          fill="currentColor"
                          d="M12.001 2c-5.416 0-9.806 4.389-9.806 9.815c0 3.968 2.337 7.385 5.718 8.93c.66.272.791-.041.761-.771v-1.327c-2.608.312-2.714-1.441-2.892-1.732c-.354-.605-1.191-.758-.94-.046c.595 1.055 1.064 1.277 1.892 1.768c1.664.988 4.747-.368 4.464-2.614c-.287-.593-.946-.984-1.464-1.469c.837-.52.911-1.976-.407-2.547a2.809 2.809 0 0 0-.523-.178c-.322-.08-.76-.082-1.371-.043c-.611.04-1.983.29-1.91 1.374c.032.469.312.648.528.794c.213.145.356.276.456.542c.161.417.351.626.343 1.138c-.025.342.137.584.383.732c-.384.102-.762.215-1.125.345c-.928-.756-1.923-.28-2.773.127c-.175.083-.316-.068-.23-.23c1.352-2.487 4.058-4.15 7.005-3.993c3.495.188 6.426 2.964 6.835 6.46c.47 3.996-2.604 7.482-6.556 7.857c-2.426.23-4.622-.753-6.147-2.504C4.38 18.37 3.996 15.306 5.046 12.6c.149-.384.227-.658.306-.93c.144-.528.263-.969.727-1.108c.539-.129 1.079.174 1.51.5l1.317 1.016c.327.25.8.028 1.055-.249l.99-1.091c.256-.282.735-.5 1.067-.246c.646.495 1.644 1.268 2.047 1.577c.28.215.531.65.959.44c.357-.176.457-.652.368-1.188c-.282-1.712-1.929-2.884-3.684-2.951c-2.361-.091-4.236 1.775-4.284 4.064c-.028 1.354.728 2.571 1.818 3.227c.317.19.404.597.225.9c-.339.57-.594 1.261-.706 1.985c-.086.546-.53.72-.844.524c-2.699-1.67-4.017-5.018-2.983-8.216c1.22-3.767 5.176-6.03 8.954-5.34c4.568.834 7.634 5.323 6.643 9.778c-.748 3.363-3.521 5.993-6.97 6.436c-2.352.302-4.701-.392-6.338-1.884c-.379-.345.089-.962.465-.62a8.336 8.336 0 0 0 5.692 1.608c3.139-.342 5.686-2.663 6.401-5.622c.92-3.807-1.567-7.509-5.32-8.364"
                        />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white text-center">
                    {activeApp.charAt(0).toUpperCase() + activeApp.slice(1)}{" "}
                    Business API
                  </h2>
                  <p className="text-white/70 text-center text-sm mt-2">
                    Powered by Meta for Developers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

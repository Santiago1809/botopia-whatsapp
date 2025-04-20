import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/90 to-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Automatiza tu atención al cliente con WhatsApp Business
            </h1>
            <p className="text-lg md:text-xl mb-8 text-tertiary">
              La forma más eficiente de conectar con tus clientes. Automatiza
              mensajes, gestiona conversaciones y potencia tu negocio sin
              complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/services/whatsapp-business"
                className="px-8 py-3 bg-tertiary text-secondary font-medium rounded-lg transition hover:bg-tertiary/90 text-center"
              >
                Comenzar ahora
              </a>
              <a
                href="#demo"
                className="px-8 py-3 bg-transparent border border-tertiary text-tertiary font-medium rounded-lg transition hover:bg-white/10 text-center"
              >
                Ver demostración
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-tertiary/20 rounded-full"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-tertiary/20 rounded-full"></div>
              <img
                src="/services/whatsapp-preview.png"
                alt="WhatsApp Business Preview"
                className="relative z-10 rounded-xl shadow-xl max-w-full"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

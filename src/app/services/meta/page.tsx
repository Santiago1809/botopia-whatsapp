"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import MetaSidebar from "./components/MetaSidebar";
import MetaAppTabs from "./components/MetaAppTabs";
import DocumentationSection from "./components/Documentation";
import PlaceholderSection from "./components/PlaceholderSection";
import { MetaAppType } from "./components/MetaAppTabs";

/**
 * Componente principal para la página de Meta Business API
 *
 * Gestiona:
 * - La selección de aplicaciones (WhatsApp, Facebook, Instagram, Threads)
 * - La navegación entre secciones del sidebar
 * - La visualización del contenido según la app y sección seleccionadas
 * - La interacción responsive para dispositivos móviles
 *
 * @returns {JSX.Element} Página completa de Meta Business API
 */
export default function MetaBusinessApiPage() {
  // Estado para la sección activa del sidebar
  const [activeSection, setActiveSection] = useState("outbound");

  // Estado para controlar si el sidebar móvil está abierto
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Estado para la app activa (WhatsApp por defecto)
  const [activeApp, setActiveApp] = useState<MetaAppType>("whatsapp");

  // Cerrar sidebar al redimensionar la ventana a un tamaño más grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevenir scroll cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileSidebarOpen]);
  /**
   * Función para cambiar la aplicación activa
   * Resetea la sección del sidebar a "outbound" al cambiar de app
   *
   * @param {MetaAppType} app - La nueva app seleccionada
   */
  const handleAppChange = (app: MetaAppType) => {
    setActiveApp(app);
    // Reseteamos a la sección principal al cambiar de app
    setActiveSection("outbound");
  };

  /**
   * Mapeo de colores para el fondo principal según la app activa
   * Cada app tiene su propio esquema de color para mantener la identidad visual
   */ const mainBgColor = {
    whatsapp: "bg-green-50/30",
    facebook: "bg-blue-50/30",
    instagram:
      "bg-gradient-to-r from-[#F58529]/10 via-[#E4405F]/10 to-[#405DE6]/10",
    threads: "bg-gray-50",
  }[activeApp];
  return (
    <div className="flex flex-col h-screen">
      {/* Botón móvil flotante */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 rounded-md p-1.5 bg-white shadow-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label={isMobileSidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMobileSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con la navegación - limitado a un ancho fijo */}
        <div
          className={`fixed inset-0 z-30 md:relative md:z-0 md:block md:w-60 transition-all duration-300 ease-in-out ${
            isMobileSidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
          }`}
        >
          {/* Fondo oscuro para overlay en móvil */}
          <div
            className="absolute inset-0 bg-gray-600 bg-opacity-75 md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          {/* Contenido del sidebar */}
          <div
            className={`relative h-full md:h-auto bg-white transform transition-transform duration-300 ease-in-out ${
              isMobileSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
          >
            <MetaSidebar
              activeSection={activeSection}
              setActiveSection={(section) => {
                setActiveSection(section);
                setIsMobileSidebarOpen(false);
              }}
              appType={activeApp}
            />
          </div>
        </div>
        {/* Contenido principal con color según la app activa */}
        <main className={`flex-1 ${mainBgColor} p-4 md:p-6 overflow-y-auto`}>
          {" "}
          {/* Selector de apps integrado en el contenido principal */}
          <div className="mb-8 mt-2">
            <MetaAppTabs activeApp={activeApp} onAppChange={handleAppChange} />
          </div>
          {/* Contenido dinámico según la sección activa */}
          {activeApp === "whatsapp" && (
            <>
              {activeSection === "outbound" && (
                <PlaceholderSection
                  title="Mensajes salientes de WhatsApp"
                  appType="whatsapp"
                />
              )}
              {activeSection === "wa-flows" && (
                <PlaceholderSection
                  title="Flujos de WhatsApp"
                  appType="whatsapp"
                />
              )}
              {activeSection === "campaigns" && (
                <PlaceholderSection
                  title="Campañas de WhatsApp"
                  appType="whatsapp"
                />
              )}
              {activeSection === "contacts" && (
                <PlaceholderSection
                  title="Contactos de WhatsApp"
                  appType="whatsapp"
                />
              )}
              {activeSection === "chatbot-history" && (
                <PlaceholderSection
                  title="Historial del Chatbot de WhatsApp"
                  appType="whatsapp"
                />
              )}
              {activeSection === "chats" && (
                <PlaceholderSection
                  title="Chats de WhatsApp"
                  appType="whatsapp"
                />
              )}{" "}
              {activeSection === "settings" && (
                <PlaceholderSection
                  title="Configuración de WhatsApp"
                  appType="whatsapp"
                />
              )}
              {activeSection === "docs" && (
                <DocumentationSection appType="whatsapp" />
              )}
              {activeSection === "changelog" && (
                <PlaceholderSection
                  title="Registro de cambios de WhatsApp"
                  appType="whatsapp"
                />
              )}
            </>
          )}
          {activeApp === "facebook" && (
            <>
              {activeSection === "outbound" && (
                <PlaceholderSection
                  title="Mensajes salientes de Facebook"
                  appType="facebook"
                />
              )}
              {activeSection === "wa-flows" && (
                <PlaceholderSection
                  title="Flujos de Facebook"
                  appType="facebook"
                />
              )}
              {activeSection === "campaigns" && (
                <PlaceholderSection
                  title="Campañas de Facebook"
                  appType="facebook"
                />
              )}
              {activeSection === "contacts" && (
                <PlaceholderSection
                  title="Contactos de Facebook"
                  appType="facebook"
                />
              )}
              {activeSection === "chatbot-history" && (
                <PlaceholderSection
                  title="Historial del Chatbot de Facebook"
                  appType="facebook"
                />
              )}
              {activeSection === "chats" && (
                <PlaceholderSection
                  title="Chats de Facebook"
                  appType="facebook"
                />
              )}{" "}
              {activeSection === "settings" && (
                <PlaceholderSection
                  title="Configuración de Facebook"
                  appType="facebook"
                />
              )}
              {activeSection === "docs" && (
                <DocumentationSection appType="facebook" />
              )}
              {activeSection === "changelog" && (
                <PlaceholderSection
                  title="Registro de cambios de Facebook"
                  appType="facebook"
                />
              )}
            </>
          )}
          {activeApp === "instagram" && (
            <>
              {activeSection === "outbound" && (
                <PlaceholderSection
                  title="Mensajes salientes de Instagram"
                  appType="instagram"
                />
              )}
              {activeSection === "wa-flows" && (
                <PlaceholderSection
                  title="Flujos de Instagram"
                  appType="instagram"
                />
              )}
              {activeSection === "campaigns" && (
                <PlaceholderSection
                  title="Campañas de Instagram"
                  appType="instagram"
                />
              )}
              {activeSection === "contacts" && (
                <PlaceholderSection
                  title="Contactos de Instagram"
                  appType="instagram"
                />
              )}
              {activeSection === "chatbot-history" && (
                <PlaceholderSection
                  title="Historial del Chatbot de Instagram"
                  appType="instagram"
                />
              )}
              {activeSection === "chats" && (
                <PlaceholderSection
                  title="Chats de Instagram"
                  appType="instagram"
                />
              )}{" "}
              {activeSection === "settings" && (
                <PlaceholderSection
                  title="Configuración de Instagram"
                  appType="instagram"
                />
              )}
              {activeSection === "docs" && (
                <DocumentationSection appType="instagram" />
              )}
              {activeSection === "changelog" && (
                <PlaceholderSection
                  title="Registro de cambios de Instagram"
                  appType="instagram"
                />
              )}
            </>
          )}
          {activeApp === "threads" && (
            <>
              {activeSection === "outbound" && (
                <PlaceholderSection
                  title="Mensajes salientes de Threads"
                  appType="threads"
                />
              )}
              {activeSection === "wa-flows" && (
                <PlaceholderSection
                  title="Flujos de Threads"
                  appType="threads"
                />
              )}
              {activeSection === "campaigns" && (
                <PlaceholderSection
                  title="Campañas de Threads"
                  appType="threads"
                />
              )}
              {activeSection === "contacts" && (
                <PlaceholderSection
                  title="Contactos de Threads"
                  appType="threads"
                />
              )}
              {activeSection === "chatbot-history" && (
                <PlaceholderSection
                  title="Historial del Chatbot de Threads"
                  appType="threads"
                />
              )}
              {activeSection === "chats" && (
                <PlaceholderSection
                  title="Chats de Threads"
                  appType="threads"
                />
              )}{" "}
              {activeSection === "settings" && (
                <PlaceholderSection
                  title="Configuración de Threads"
                  appType="threads"
                />
              )}
              {activeSection === "docs" && (
                <DocumentationSection appType="threads" />
              )}
              {activeSection === "changelog" && (
                <PlaceholderSection
                  title="Registro de cambios de Threads"
                  appType="threads"
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

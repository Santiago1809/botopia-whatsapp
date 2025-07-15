"use client";

/**
 * Define los tipos de aplicaciones de Meta disponibles en el selector
 */
export type MetaAppType = "whatsapp" | "facebook" | "instagram" | "threads";

/**
 * Colores oficiales de las aplicaciones de Meta
 */
export const appColors = {
  whatsapp: {
    primary: "#25D366", // Verde claro oficial de WhatsApp
    secondary: "#128C7E", // Verde teal oficial de WhatsApp
    dark: "#075E54",    // Verde teal oscuro oficial de WhatsApp
    background: "#ECE5DD", // Color de fondo oficial de WhatsApp
    hover: "hover:bg-[#ECE5DD]/30",
    active: "bg-[#ECE5DD]/30 text-[#128C7E]",
    border: "border-[#25D366]",
    icon: "text-[#25D366]",
    text: "text-[#25D366]",
    badge: "bg-[#25D366]",
  },
  facebook: {
    primary: "#1877F2", // Azul claro oficial de Facebook
    secondary: "#3b5998", // Azul oscuro oficial de Facebook
    hover: "hover:bg-blue-50",
    active: "bg-blue-50 text-[#1877F2]",
    border: "border-[#1877F2]",
    icon: "text-[#1877F2]",
    text: "text-[#1877F2]",
    badge: "bg-[#1877F2]",
  },  instagram: {
    primary: "#E4405F", // Rosa (color principal de Instagram)
    secondary: "#F58529", // Naranja
    gradient: "from-[#E4405F] via-[#962FBF] to-[#405DE6]",
    gradientHover: "hover:from-[#E4405F] hover:via-[#962FBF] hover:to-[#405DE6]",
    hover: "hover:bg-gradient-to-r hover:from-[#E4405F]/30 hover:via-[#962FBF]/30 hover:to-[#405DE6]/30",
    active: "bg-gradient-to-r from-[#E4405F]/20 via-[#962FBF]/20 to-[#405DE6]/20 text-[#E4405F]",
    border: "border-[#E4405F]",
    icon: "text-[#E4405F]",
    text: "text-[#E4405F]",
    badge: "bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]",
    textGradient: "text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]",
    yellow: "#FFDC80",
    purple: "#962FBF",
    blue: "#405DE6",
    cyan: "#3f729b",
  },
  threads: {
    primary: "#000000", // Negro oficial de Threads
    secondary: "#333333", // Gris oscuro para Threads
    hover: "hover:bg-gray-50",
    active: "bg-gray-50 text-gray-800",
    border: "border-gray-700",
    icon: "text-gray-800",
    text: "text-gray-800",
    badge: "bg-gray-800",
  },
};

/**
 * Props para el componente MetaAppTabs
 * @interface MetaAppTabsProps
 * @property {MetaAppType} activeApp - La aplicación actualmente seleccionada
 * @property {function} onAppChange - Función para cambiar la aplicación seleccionada
 */
interface MetaAppTabsProps {
  activeApp: MetaAppType;
  onAppChange: (app: MetaAppType) => void;
}

/**
 * Componente para seleccionar entre las diferentes aplicaciones de Meta
 * Muestra un tab selector con WhatsApp, Facebook, Instagram y Threads
 * 
 * @param {MetaAppTabsProps} props - Props del componente
 * @returns {JSX.Element} - Selector de aplicaciones con estilos dinámicos
 */
export default function MetaAppTabs({
  activeApp,
  onAppChange,
}: MetaAppTabsProps) {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-full border border-gray-200">
      <div className="flex items-center px-2 py-1.5">
        {/* Selector de apps similar a la imagen de referencia - con colores oficiales */}
        <div className="flex items-center justify-around w-full">
          {/* Botón de WhatsApp */}
          <button
            onClick={() => onAppChange("whatsapp")}
            className={`flex items-center px-4 py-2 rounded-full ${
              activeApp === "whatsapp" 
                ? `bg-[#ECE5DD]/30 text-[#128C7E] font-medium` 
                : `text-[#25D366] hover:bg-[#ECE5DD]/20 hover:text-[#128C7E]`
            }`}
            aria-label="Seleccionar WhatsApp"
            title="WhatsApp"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className={`mr-2 ${activeApp === "whatsapp" ? "text-[#25D366]" : "text-[#128C7E]/80"}`}
            >
              <path
                fill="currentColor"
                d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01"
              />
            </svg>
            <span className={activeApp === "whatsapp" ? "text-[#128C7E] font-medium" : "text-[#25D366]"}>WhatsApp</span>
          </button>
          
          {/* Botón de Facebook */}
          <button
            onClick={() => onAppChange("facebook")}
            className={`flex items-center px-4 py-2 rounded-full ${
              activeApp === "facebook" 
                ? `bg-blue-50/70 text-[#1877F2] font-medium` 
                : `text-[#3b5998] hover:bg-blue-50/30 hover:text-[#1877F2]`
            }`}
            aria-label="Seleccionar Facebook"
            title="Facebook"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className={`mr-2 ${activeApp === "facebook" ? "text-[#1877F2]" : "text-[#3b5998]/80"}`}
            >
              <path
                fill="currentColor"
                d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"
              />
            </svg>
            <span className={activeApp === "facebook" ? "text-[#1877F2] font-medium" : "text-[#3b5998]"}>Facebook</span>
          </button>
            {/* Botón de Instagram */}          <button
            onClick={() => onAppChange("instagram")}
            className={`flex items-center px-4 py-2 rounded-full ${
              activeApp === "instagram" 
                ? `bg-gradient-to-r from-[#E4405F]/20 via-[#962FBF]/20 to-[#405DE6]/20 font-medium` 
                : `hover:bg-gradient-to-r hover:from-[#E4405F]/10 hover:via-[#962FBF]/10 hover:to-[#405DE6]/10`
            }`}
            aria-label="Seleccionar Instagram"
            title="Instagram"
          >            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              className="mr-2"
            >
              <defs>
                <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F58529" />
                  <stop offset="35%" stopColor="#E4405F" />
                  <stop offset="100%" stopColor="#405DE6" />
                </linearGradient>
                <linearGradient id="instagramGradientActive" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F58529" />
                  <stop offset="35%" stopColor="#E4405F" />
                  <stop offset="100%" stopColor="#405DE6" />
                </linearGradient>
              </defs>
              <path
                fill="url(#instagramGradient)"
                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
              />
            </svg>
            <span className={
              activeApp === "instagram" 
                ? "font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]" 
                : "text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]"
            }>Instagram</span>
          </button>
          
          {/* Botón de Threads */}
          <button
            onClick={() => onAppChange("threads")}
            className={`flex items-center px-4 py-2 rounded-full ${
              activeApp === "threads" 
                ? `bg-gray-100 text-gray-800 font-medium` 
                : `text-gray-700 hover:bg-gray-50 hover:text-gray-800`
            }`}
            aria-label="Seleccionar Threads"
            title="Threads"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 448 512" 
              className={`mr-2 ${activeApp === "threads" ? "text-gray-800" : "text-gray-700"}`}
            >
              <path
                fill="currentColor"
                d="M331.5 235.7c2.2 .9 4.2 1.9 6.3 2.8c29.2 14.1 50.6 35.2 61.8 61.4c15.7 36.5 17.2 95.8-30.3 143.2c-36.2 36.2-80.3 52.5-142.6 53h-.3c-70.2-.5-124.1-24.1-160.4-70.2c-32.3-41-48.9-98.1-49.5-169.6V256v-.2C17 184.3 33.6 127.2 65.9 86.2C102.2 40.1 156.2 16.5 226.4 16h.3c70.3 .5 124.9 24 162.3 69.9c18.4 22.7 32 50 40.6 81.7l-40.4 10.8c-7.1-25.8-17.8-47.8-32.2-65.4c-29.2-35.8-73-54.2-130.5-54.6c-57 .5-100.1 18.8-128.2 54.4C72.1 146.1 58.5 194.3 58 256c.5 61.7 14.1 109.9 40.3 143.3c28 35.6 71.2 53.9 128.2 54.4c51.4-.4 85.4-12.6 113.7-40.9c32.3-32.2 31.7-71.8 21.4-95.9c-6.1-14.2-17.1-26-31.9-34.9c-3.7 26.9-11.8 48.3-24.7 64.8c-17.1 21.8-41.4 33.6-72.7 35.3c-23.6 1.3-46.3-4.4-63.9-16c-20.8-13.8-33-34.8-34.3-59.3c-2.5-48.3 35.7-83 95.2-86.4c21.1-1.2 40.9-.3 59.2 2.8c-2.4-14.8-7.3-26.6-14.6-35.2c-10-11.7-25.6-17.7-46.2-17.8H227c-16.6 0-39 4.6-53.3 26.3l-34.4-23.6c19.2-29.1 50.3-45.1 87.8-45.1h.8c62.6 .4 99.9 39.5 103.7 107.7l-.2 .2zm-156 68.8c1.3 25.1 28.4 36.8 54.6 35.3c25.6-1.4 54.6-11.4 59.5-73.2c-13.2-2.9-27.8-4.4-43.4-4.4c-4.8 0-9.6 .1-14.4 .4c-42.9 2.4-57.2 23.2-56.2 41.8l-.1 .1z"
              />
            </svg>
            <span className={activeApp === "threads" ? "text-gray-800 font-medium" : "text-gray-700"}>Threads</span>
          </button>
        </div>
      </div>
    </div>
  );
}

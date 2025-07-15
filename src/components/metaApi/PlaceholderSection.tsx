"use client";

import { AlertCircle } from "lucide-react";
import { MetaAppType } from "./MetaAppTabs";

interface PlaceholderSectionProps {
  title: string;
  appType?: MetaAppType;
}

export default function PlaceholderSection({ title, appType = "whatsapp" }: PlaceholderSectionProps) {
  // Configura colores según la app activa
  const colors = {
    whatsapp: {
      bg: "bg-green-50",
      text: "text-green-600",
      button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    },
    facebook: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    },    instagram: {
      bg: "bg-gradient-to-r from-[#F58529]/20 via-[#E4405F]/20 to-[#405DE6]/20",
      text: "text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]",
      button: "bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6] hover:from-[#E4405F] hover:to-[#962FBF] focus:ring-[#E4405F]",
    },
    threads: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      button: "bg-gray-800 hover:bg-gray-900 focus:ring-gray-500",
    }
  }[appType];
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="text-center max-w-md">
        <div className={`${colors.bg} ${colors.text} p-3 rounded-full inline-flex items-center justify-center mb-6`}>
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">
          Esta sección está en desarrollo. Pronto tendrás acceso a todas las funcionalidades relacionadas con {title.toLowerCase()}.
        </p>
        <button className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}>
          Recibir notificación cuando esté disponible
        </button>
      </div>
    </div>
  );
}

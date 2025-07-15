"use client";

import { Book, BookOpen, ExternalLink, FilePlus, Code, Terminal } from "lucide-react";
import { MetaAppType } from "./MetaAppTabs";

interface DocumentationSectionProps {
  appType?: MetaAppType;
}

export default function DocumentationSection({ appType = "whatsapp" }: DocumentationSectionProps) {
  // Configurar colores según la app activa
  const colors = {
    whatsapp: {
      primary: "text-green-600",
      secondary: "text-green-800",
      bg: "bg-green-50",
      border: "border-green-100",
      hover: "hover:text-green-800",
      badge: "bg-green-100 text-green-700",
    },
    facebook: {
      primary: "text-blue-600",
      secondary: "text-blue-800",
      bg: "bg-blue-50",
      border: "border-blue-100", 
      hover: "hover:text-blue-800",
      badge: "bg-blue-100 text-blue-700",
    },    instagram: {
      primary: "text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]",
      secondary: "text-[#E4405F]",
      bg: "bg-gradient-to-r from-[#F58529]/10 via-[#E4405F]/10 to-[#405DE6]/10",
      border: "border-[#E4405F]/20",
      hover: "hover:text-[#962FBF]",
      badge: "bg-gradient-to-r from-[#F58529]/30 via-[#E4405F]/30 to-[#405DE6]/30 text-[#E4405F]",
    },
    threads: {
      primary: "text-gray-600",
      secondary: "text-gray-800",
      bg: "bg-gray-50",
      border: "border-gray-100",
      hover: "hover:text-gray-800",
      badge: "bg-gray-100 text-gray-700",
    }
  }[appType];
  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Documentación de la API
        </h1>
        <p className="text-gray-500">
          Recursos y guías para implementar Meta Business API en tus aplicaciones
        </p>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${colors.bg} rounded-xl shadow-sm p-6 ${colors.border} hover:shadow-md transition-all`}>
          <div className="flex items-center mb-4">
            <BookOpen className={`h-7 w-7 ${colors.primary}`} />
            <h2 className="text-lg font-bold text-gray-900 ml-2">Guías</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Comienza con tutoriales paso a paso para implementar las funcionalidades más comunes.
          </p>
          <button className={`${colors.primary} ${colors.hover} text-sm font-medium inline-flex items-center`}>
            Ver guías
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className={`${colors.bg} rounded-xl shadow-sm p-6 ${colors.border} hover:shadow-md transition-all`}>
          <div className="flex items-center mb-4">
            <Code className={`h-7 w-7 ${colors.primary}`} />
            <h2 className="text-lg font-bold text-gray-900 ml-2">Referencias</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Documentación detallada de todos los endpoints, parámetros y respuestas de la API.
          </p>
          <button className={`${colors.primary} ${colors.hover} text-sm font-medium inline-flex items-center`}>
            Ver referencias
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className={`${colors.bg} rounded-xl shadow-sm p-6 ${colors.border} hover:shadow-md transition-all`}>
          <div className="flex items-center mb-4">
            <Terminal className={`h-7 w-7 ${colors.primary}`} />
            <h2 className="text-lg font-bold text-gray-900 ml-2">SDKs</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Bibliotecas oficiales para diferentes lenguajes de programación y plataformas.
          </p>
          <button className={`${colors.primary} ${colors.hover} text-sm font-medium inline-flex items-center`}>
            Ver SDKs
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all mb-8">
        <div className={`px-6 py-5 ${colors.bg} border-b ${colors.border}`}>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Book className={`h-5 w-5 mr-2 ${colors.primary}`} />
            Guía de inicio rápido {appType === "whatsapp" ? "- WhatsApp Business API" : 
                                   appType === "facebook" ? "- Facebook Graph API" : 
                                   appType === "instagram" ? "- Instagram Graph API" : 
                                   "- Threads API"}
          </h2>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Bienvenido a la documentación de Meta Business API. Aquí encontrarás toda la información
              necesaria para integrar {appType === "whatsapp" ? "WhatsApp" : 
                                      appType === "facebook" ? "Facebook" : 
                                      appType === "instagram" ? "Instagram" : 
                                      "Threads"} en tu aplicación.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Primeros pasos</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className={`${colors.badge} w-5 h-5 rounded-full flex items-center justify-center font-medium text-xs mr-2 mt-0.5`}>1</span>
                <span>Configura tu cuenta de desarrollador de Meta</span>
              </li>
              <li className="flex items-start">
                <span className={`${colors.badge} w-5 h-5 rounded-full flex items-center justify-center font-medium text-xs mr-2 mt-0.5`}>2</span>
                <span>Crea una aplicación en el portal de desarrolladores</span>
              </li>
              <li className="flex items-start">
                <span className={`${colors.badge} w-5 h-5 rounded-full flex items-center justify-center font-medium text-xs mr-2 mt-0.5`}>3</span>
                <span>Configura los permisos necesarios para {appType === "whatsapp" ? "WhatsApp Business API" : 
                                                               appType === "facebook" ? "Facebook Graph API" : 
                                                               appType === "instagram" ? "Instagram Graph API" : 
                                                               "Threads API"}</span>
              </li>
              <li className="flex items-start">
                <span className={`${colors.badge} w-5 h-5 rounded-full flex items-center justify-center font-medium text-xs mr-2 mt-0.5`}>4</span>
                <span>Obtén tu token de acceso</span>
              </li>
              <li className="flex items-start">
                <span className={`${colors.badge} w-5 h-5 rounded-full flex items-center justify-center font-medium text-xs mr-2 mt-0.5`}>5</span>
                <span>Realiza tu primera llamada a la API</span>
              </li>
            </ol>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Recursos útiles</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Documentación oficial de Meta
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  SDK de WhatsApp Business
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Guía de plantillas de mensajes
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FilePlus className="h-5 w-5 mr-2 text-blue-500" />
            Ejemplos de código
          </h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-medium text-gray-900">Enviar un mensaje de WhatsApp</h3>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Copiar código
              </button>
            </div>
            <div className="bg-gray-800 text-white p-5 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono">
{`curl -X POST https://graph.facebook.com/v17.0/FROM_PHONE_NUMBER_ID/messages \\
-H 'Authorization: Bearer ACCESS_TOKEN' \\
-H 'Content-Type: application/json' \\
-d '{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "PHONE_NUMBER",
  "type": "text",
  "text": { 
    "body": "Hello, world!" 
  }
}'`}
              </pre>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-medium text-gray-900">Enviar una plantilla de WhatsApp</h3>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Copiar código
              </button>
            </div>
            <div className="bg-gray-800 text-white p-5 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono">
{`curl -X POST https://graph.facebook.com/v17.0/FROM_PHONE_NUMBER_ID/messages \\
-H 'Authorization: Bearer ACCESS_TOKEN' \\
-H 'Content-Type: application/json' \\
-d '{
  "messaging_product": "whatsapp",
  "to": "PHONE_NUMBER",
  "type": "template",
  "template": { 
    "name": "hello_world", 
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "John"
          }
        ]
      }
    ]
  }
}'`}
              </pre>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center">
              Ver más ejemplos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

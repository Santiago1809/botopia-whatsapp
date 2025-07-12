"use client";

import { Key, Smartphone, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function WhatsAppSetupSection() {
  const [showToken, setShowToken] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Configuración de WhatsApp Business
        </h1>
        <p className="text-muted-foreground">
          Gestiona la conexión y configuración de tu cuenta de WhatsApp Business
        </p>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-xl mb-8 hover:shadow-md transition-all">
        <div className="px-6 py-5">
          <div className="flex items-center mb-5">
            <Smartphone className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-semibold text-foreground">
              Información de la cuenta
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                ID de la cuenta
              </label>
              <div className="flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <input
                    type="text"
                    readOnly
                    value="276589149458721"
                    className="flex-1 block w-full rounded-l-md bg-background border-input focus:ring-0 text-sm px-4 py-2.5 text-foreground"
                  />
                  <button
                    className={`inline-flex items-center px-3 py-2 border border-l-0 border-input rounded-r-md bg-background text-sm ${
                      copiedText === "id"
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    onClick={() => copyToClipboard("276589149458721", "id")}
                  >
                    {copiedText === "id" ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Número de teléfono
              </label>
              <input
                type="text"
                readOnly
                value="+57 310 123 4567"
                className="block w-full rounded-md bg-background border-input focus:ring-0 text-sm px-4 py-2.5 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tipo de cuenta
              </label>
              <input
                type="text"
                readOnly
                value="Business Account"
                className="block w-full rounded-md bg-background border-input focus:ring-0 text-sm px-4 py-2.5 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estado
              </label>
              <div className="flex items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
                <input
                  type="text"
                  readOnly
                  value="Conectado"
                  className="block w-full rounded-md bg-background border-input focus:ring-0 text-sm px-4 py-2.5 text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-colors">
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Actualizar información
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-all">
        <div className="px-6 py-5">
          <div className="flex items-center mb-5">
            <Key className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Token de acceso
            </h2>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token permanente
            </label>
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <input
                  type={showToken ? "text" : "password"}
                  readOnly
                  value="EAACkZCvCxZBtABAGJt5Wl8ZAP9NnvdgukK3DcmUcnPZA6yw6Y4r..."
                  className="flex-1 block w-full rounded-l-md bg-gray-50 border-gray-200 focus:ring-0 text-sm px-4 py-2.5 text-gray-600"
                />
                <button
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 bg-gray-50 text-sm text-gray-500 hover:text-blue-500"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  className={`inline-flex items-center px-3 py-2 border border-l-0 border-gray-200 rounded-r-md bg-gray-50 text-sm ${
                    copiedText === "token"
                      ? "text-green-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      "EAACkZCvCxZBtABAGJt5Wl8ZAP9NnvdgukK3DcmUcnPZA6yw6Y4r...",
                      "token"
                    )
                  }
                >
                  {copiedText === "token" ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <InfoIcon className="h-4 w-4 mr-1 text-blue-500" />
              Este token se usa para autenticar tus solicitudes a la API de
              WhatsApp Business.
            </p>
          </div>

          <div className="flex justify-end">
            <button className="inline-flex items-center px-4 py-2 rounded-md border border-gray-200 shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Generar nuevo token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Iconos adicionales
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

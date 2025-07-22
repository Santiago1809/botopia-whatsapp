"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

interface Line {
  id: string;
  numero: string;
  proveedor: string;
  estaActivo: boolean;
  creadoEn: string;
  idDeUsuario: string;
  contactsCount: number;
  activeContacts: number;
  lastActivity: string;
}

export default function CrmPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || "http://localhost:5005";

  const fetchLines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/lines`);
      const data = await response.json();

      if (data.success) {
        setLines(data.data);
      } else {
        setError(data.message || "Error al cargar líneas");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLineClick = (lineId: string) => {
    router.push(`/crm/line-dashboard/${lineId}`);
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      'WhatsApp Business': 'bg-green-100 text-green-800 border-green-300',
      'Meta WhatsApp': 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
          <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Cargando líneas...</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">
              CRM - Líneas de WhatsApp
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground mt-2">
              Gestiona tus líneas de WhatsApp y sus contactos
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Lines Grid */}
          <div className="flex justify-center items-start min-h-[60vh] mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
              {lines.map((line) => (
                <div
                  key={line.id}
                  onClick={() => handleLineClick(line.id)}
                  className="flex flex-col justify-between items-stretch 
                    bg-white/90 dark:bg-[hsl(240,10%,16%)]/95 
                    rounded-2xl shadow-lg border border-primary/30 dark:border-primary/50 
                    hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden 
                    h-[240px] w-[370px] p-5 group"
                >
                  {/* Header: Foto, nombre, proveedor */}
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src="/Juanita.jpeg"
                      alt="Juanita"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-sm"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-lg font-bold text-primary truncate">JUANITA</span>
                      <span className="text-sm text-muted-foreground truncate dark:text-gray-200/80">{line.numero}</span>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded text-sm border font-semibold ${getProviderColor(line.proveedor)}`}>{line.proveedor}</span>
                  </div>

                  {/* Stats y estado */}
                  <div className="flex justify-between items-center w-full text-sm mb-2 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{line.contactsCount}</span>
                      <span className="text-muted-foreground dark:text-gray-300/80">/</span>
                      <span className="font-bold text-green-600">{line.activeContacts}</span>
                      <span className="ml-1 text-muted-foreground dark:text-gray-300/80">Contactos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${line.estaActivo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={`font-bold ${line.estaActivo ? 'text-green-600' : 'text-red-600'}`}>{line.estaActivo ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center w-full text-xs text-muted-foreground border-t pt-2 mt-2 dark:text-gray-300/80">
                    <span className="truncate">{formatDate(line.creadoEn)}</span>
                    <span className="text-primary font-bold cursor-pointer flex items-center gap-1 group-hover:underline text-sm">
                      Ver Dashboard
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {lines.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay líneas registradas
              </h3>
              <p className="text-muted-foreground">
                Las líneas de WhatsApp aparecerán aquí cuando estén configuradas.
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
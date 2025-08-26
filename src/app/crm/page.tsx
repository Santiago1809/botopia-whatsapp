"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import SidebarLayout from "@/components/SidebarLayout";

interface Line {
  id: string;
  numero: string;
  proveedor: string;
  estaActivo: boolean;
  creadoEn: string;
  idDeUsuario: string | number; // Puede ser string o number
  nombreLinea?: string | null;
  fotoLinea?: string | null;
  contactsCount: number;
  activeContacts: number;
  lastActivity: string;
}

export default function CrmPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { getToken } = useAuth();

  const AUTH_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://botopia-whatsapp-api-black.vercel.app' 
      : 'http://localhost:3001');
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  // Función para obtener información del usuario autenticado
  const fetchAuthenticatedUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No se encontró token de autenticación");
        router.push("/login");
        return null;
      }

      const response = await fetch(`${AUTH_BACKEND_URL}/api/auth/user-info`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError("Error al obtener información del usuario");
        router.push("/login");
        return null;
      }

      const userData = await response.json();
      // console.log("🔍 [DEBUG] Usuario autenticado obtenido:", userData);
      // console.log("🔍 [DEBUG] ID del usuario:", userData.id);
      // console.log("🔍 [DEBUG] Tipo del ID:", typeof userData.id);
      return userData;
    } catch (error) {
      setError("Error de conexión al obtener información del usuario");
      console.error("Error:", error);
      return null;
    }
  }, [AUTH_BACKEND_URL, getToken, router]);

  const fetchLines = useCallback(async () => {
    try {
      setLoading(true);
      
      // Primero obtener información del usuario autenticado
      const user = await fetchAuthenticatedUser();
      if (!user || !user.id) {
        setError("No se pudo obtener información del usuario");
        return;
      }

      // console.log("🔍 [DEBUG] Usuario para filtrar:", user);
      // console.log("🔍 [DEBUG] ID del usuario para filtrar:", user.id);

      const response = await fetch(`${BACKEND_URL}/api/lines`);
      const data = await response.json();

      // console.log("🔍 [DEBUG] Respuesta completa del API:", data);
      // console.log("🔍 [DEBUG] Líneas obtenidas:", data.data);

      if (data.success) {
        // Filtrar las líneas por el user_id del usuario autenticado
        // console.log("🔍 [DEBUG] Iniciando filtrado de líneas...");
        
        // data.data.forEach((line: Line, index: number) => {
        //   console.log(`🔍 [DEBUG] Línea ${index + 1}:`, {
        //     id: line.id,
        //     numero: line.numero,
        //     idDeUsuario: line.idDeUsuario,
        //     tipoIdDeUsuario: typeof line.idDeUsuario,
        //     userIdParaComparar: user.id,
        //     tipoUserIdParaComparar: typeof user.id,
        //     coincide: line.idDeUsuario == user.id // Cambiar a == para comparar valores
        //   });
        // });

        const filteredLines = data.data.filter((line: Line) => 
          line.idDeUsuario == user.id // Cambiar de === a == para comparar solo valores
        );
        
        // console.log("🔍 [DEBUG] Líneas filtradas:", filteredLines);
        // console.log("🔍 [DEBUG] Total líneas filtradas:", filteredLines.length);
        
        setLines(filteredLines);
      } else {
        setError(data.message || "Error al cargar líneas");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, fetchAuthenticatedUser]);

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

  const formatOptionalDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return formatDate(dateString);
    } catch {
      return '—';
    }
  };

  const handleLineClick = (lineId: string) => {
    router.push(`/crm/line-dashboard/${lineId}`);
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      'WhatsApp Business': 'bg-green-100 text-green-800 border-green-300',
  'Meta WhatsApp': 'bg-blue-100 text-blue-800 border-blue-300',
  'META': 'bg-blue-100 text-blue-800 border-blue-300',
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
                <p className="text-muted-foreground">Cargando línea...</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Si solo hay una tarjeta, mostramos un diseño más compacto
  const isSingle = lines.length === 1;

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
          <div className={`flex justify-start items-start min-h-[60vh] mt-2`}>
            <div className={`${isSingle
                ? 'grid grid-cols-1 place-items-start gap-8 w-full max-w-2xl px-4'
                : 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] auto-rows-fr items-stretch gap-8 w-full max-w-7xl px-4'}`}>
              {lines.map((line) => {
                const displayName = (line.nombreLinea?.trim() || 'NA');
                const photoUrl = line.fotoLinea?.trim() || '';
                return (
                  <div
                    key={line.id}
                    onClick={() => handleLineClick(line.id)}
                    className={`flex flex-col justify-between items-stretch 
                      bg-white/90 dark:bg-[hsl(240,10%,16%)]/95 
                      rounded-2xl shadow-lg border border-primary/30 dark:border-primary/50 
                      hover:shadow-xl hover:translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden 
                      min-h-[240px] h-full w-full p-5 sm:p-6 group ${isSingle ? 'max-w-[600px] sm:max-w-[680px]' : ''}`}
                  >
                    {/* Header: Foto, nombre, proveedor */}
                    <div className="flex items-center gap-4 mb-4">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={`Foto de ${displayName}`}
                          width={128}
                          height={128}
                          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-primary shadow-sm"
                        />
                      ) : (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-transparent" />
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xl font-bold text-primary truncate">{displayName}</span>
                        <span className="text-base text-muted-foreground truncate dark:text-gray-200/80">{line.numero}</span>
                        <span className="text-xs text-muted-foreground truncate dark:text-gray-300/80">ID: {line.id}</span>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded text-sm border font-semibold ${getProviderColor(line.proveedor)}`}>{line.proveedor}</span>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{line.activeContacts ?? 0}</span>
                          <span> / {line.contactsCount ?? 0} contactos</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Última: {formatOptionalDate(line.lastActivity)}</div>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex justify-center items-center w-full text-sm mb-4 mt-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full ${line.estaActivo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`font-bold ${isSingle ? 'text-base' : 'text-lg'} ${line.estaActivo ? 'text-green-600' : 'text-red-600'}`}>{line.estaActivo ? 'Activa' : 'Inactiva'}</span>
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
                );
              })}
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
                No tienes líneas de WhatsApp asignadas
              </h3>
              <p className="text-muted-foreground">
                Las líneas de WhatsApp que tengas asignadas aparecerán aquí. Contacta al administrador si necesitas acceso a líneas específicas.
              </p>
            </div>
          )}

          {/* Example usage of renderResponse */}

        </div>
      </div>
    </SidebarLayout>
  );
}
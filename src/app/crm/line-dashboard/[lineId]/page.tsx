"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "../../../../components/crm/DashboardHeader";
import NavigationTabs from "../../../../components/crm/NavigationTabs";
import DashboardView from "../../../../components/crm/DashboardView";
import ChatSection from "../../../../components/crm/ChatSection";
import AnalyticsSection from "../../../../components/crm/AnalyticsSection";
import { useDashboardFilters } from "../../../../hooks/useDashboardFilters";
import { useCRMWebSocket } from "../../../../hooks/useCRMWebSocket";
import type { 
  Contact, 
  LineDashboardData, 
  ViewMode 
} from "../../../../types/dashboard";

export default function LineDashboard() {
  const [dashboardData, setDashboardData] = useState<LineDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [lineTags, setLineTags] = useState<string[]>([]); // Etiquetas de la línea
  const [selectedContactForChat, setSelectedContactForChat] = useState<Contact | null>(null); // Contacto seleccionado para chat
  const params = useParams();
  const router = useRouter();
  const lineId = params.lineId as string;

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || "http://localhost:5005";

  // 🔥 WEBSOCKET TIEMPO REAL - SIN POLLING
  const wsHook = useCRMWebSocket({
    lineId: lineId,
    userId: 'agent-1',
    backendUrl: BACKEND_URL
  });

  // Handler para actualizaciones de contacto en tiempo real
  useEffect(() => {
    // console.log('🔌 CRM Dashboard: Configurando handlers de WebSocket...');

    // Handler para actualizaciones de contacto
    wsHook.registerContactUpdateHandler((update) => {
      console.log('🔥 [DEBUG] Contacto actualizado via WebSocket:', {
        id: update.id,
        funnel_stage: update.funnel_stage,
        priority: update.priority,
        name: update.name,
        lastMessage: update.lastMessage,
        last_activity: update.last_activity
      });
      
      setAllContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === update.id) {
            // Mapear funnel_stage al status correcto para el Kanban
            let mappedStatus = contact.status;
            if (update.funnel_stage) {
              switch (update.funnel_stage) {
                case 'nuevo':
                case 'nuevo-lead':
                  mappedStatus = 'nuevo-lead';
                  break;
                case 'contacto':
                case 'en-contacto':
                  mappedStatus = 'en-contacto';
                  break;
                case 'cita':
                case 'cita-agendada':
                  mappedStatus = 'cita-agendada';
                  break;
                case 'atencion_cliente':
                case 'atencion-cliente':
                  mappedStatus = 'atencion-cliente';
                  break;
                case 'completado':
                case 'cerrado':
                  mappedStatus = 'cerrado';
                  break;
                case 'pendiente-documentacion':
                  mappedStatus = 'pendiente-documentacion';
                  break;
                default:
                  // Si no coincide con ningún valor, mantener el status actual
                  mappedStatus = contact.status;
              }
            }

            console.log('🔄 [DEBUG] Status mapeado:', {
              contactId: contact.id,
              originalStatus: contact.status,
              funnel_stage: update.funnel_stage,
              mappedStatus: mappedStatus,
              lastMessage: update.lastMessage,
              updatingLastActivity: update.last_activity
            });

            const updatedContact = {
              ...contact,
              nombre: update.name || contact.nombre,
              telefono: update.phone || contact.telefono,
              etapaDelEmbudo: update.funnel_stage || contact.etapaDelEmbudo,
              prioridad: update.priority || contact.prioridad,
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
              etiquetas: update.tags || contact.etiquetas,
              ultimaActividad: update.last_activity || contact.ultimaActividad,
              status: mappedStatus, // Usar el status mapeado
              // 🔥 ACTUALIZAR ÚLTIMO MENSAJE EN TIEMPO REAL
              ultimoMensaje: update.lastMessage ? {
                mensaje: update.lastMessage.message,
                timestamp: update.lastMessage.timestamp,
                remitente: update.lastMessage.remitente || update.lastMessage.sender
              } : contact.ultimoMensaje,
            };

            console.log('✅ [DEBUG] Contacto actualizado en Kanban:', {
              id: updatedContact.id,
              ultimaActividad: updatedContact.ultimaActividad,
              ultimoMensaje: updatedContact.ultimoMensaje
            });

            return updatedContact;
          }
          return contact;
        });
      });
    });

    // Handler para contactos eliminados
    wsHook.registerContactDeletedHandler((data) => {
      // console.log('🗑️ CRM Dashboard: Contacto eliminado via WebSocket:', data);
      
      setAllContacts(prevContacts => {
        return prevContacts.filter(contact => contact.id !== data.id);
      });
    });

    // Handler para actualizaciones de dashboard
    // Handler para actualizaciones de dashboard
    wsHook.registerDashboardUpdateHandler(() => {
      // console.log('📊 CRM Dashboard: Dashboard actualizado via WebSocket:', _data);
      // Aquí puedes actualizar dashboardData si es necesario
    });

    // Handler para actualizaciones de analytics
    // Handler para actualizaciones de analytics
    wsHook.registerAnalyticsUpdateHandler(() => {
      // console.log('📈 CRM Dashboard: Analytics actualizado via WebSocket:', _data);
      // Los analytics se actualizan automáticamente via el hook useDashboardFilters
    });

    // console.log('✅ CRM Dashboard: Handlers de WebSocket configurados');
  }, [wsHook]);

  // Fetch line tags from database
  const fetchLineTags = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}`);
      const data = await response.json();
      if (data.success && data.data && data.data.tags) {
        setLineTags(data.data.tags);
      }
    } catch (error) {
      console.error('Error fetching line tags:', error);
    }
  }, [BACKEND_URL, lineId]);

  // Use custom hook for filters
  const {
    selectedTags,
    searchTerm,
    filteredContacts,
    analyticsStats,
    toggleTag,
    clearFilters,
    handleSearchChange
  } = useDashboardFilters({ allContacts });

  // Fetch all contacts for the line
  const fetchAllContacts = useCallback(async () => {
    try {
      // console.log('🔍 Fetching contacts for line:', lineId);
      // console.log('🌐 Backend URL:', BACKEND_URL);
      
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/contacts`);
      const data = await response.json();
      
      // console.log('📡 Response status:', response.status);
      // console.log('📦 Response data:', data);
      
      if (data.success) {
        // console.log('✅ Contacts received:', data.data);
        // console.log('📊 Number of contacts:', data.data.length);
        setAllContacts(data.data);
      } else {
        // console.log('❌ API response not successful:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      // console.log('🔄 Using mock data as fallback');
      
      // Use mock data if API fails
      const mockContacts: Contact[] = [
        {
          id: "doc-pending-1",
          identificacion: "1234567890",
          telefono: "1234567890",
          nombre: "Pedro Martínez",
          etapaDelEmbudo: "pendiente-documentacion",
          prioridad: "alta",
          estaAlHabilitado: true,
          etiquetas: ["documentos-pendientes", "urgente"],
          ultimaActividad: "2025-07-21T08:00:00.000Z",
          creadoEn: "2025-07-20T18:00:00.000Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "pendiente-documentacion"
        },
        {
          id: "doc-pending-2",
          identificacion: "0987654321",
          telefono: "0987654321",
          nombre: "Laura Sánchez",
          etapaDelEmbudo: "pendiente-documentacion",
          prioridad: "media",
          estaAlHabilitado: true,
          etiquetas: ["documentos-pendientes", "medicina-estetica"],
          ultimaActividad: "2025-07-21T09:30:00.000Z",
          creadoEn: "2025-07-21T07:15:00.000Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "pendiente-documentacion"
        },
        {
          id: "aec2e5fb-ec30-4f5f",
          identificacion: "1646589346B",
          telefono: "1646589346B",
          nombre: "Contacto Anónimo",
          etapaDelEmbudo: "nuevo",
          prioridad: "media",
          estaAlHabilitado: true,
          etiquetas: ["reciente"],
          ultimaActividad: "2025-07-20T23:37:09.569Z",
          creadoEn: "2025-07-20T23:37:10.003709Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "nuevo-lead"
        },
        {
          id: "de30bd5f-5b4-4c0f",
          identificacion: "573824073016",
          telefono: "573824073016",
          nombre: "Juliana Fernández",
          etapaDelEmbudo: "nuevo",
          prioridad: "media",
          estaAlHabilitado: true,
          etiquetas: ["medicina-estetica"],
          ultimaActividad: "2025-07-20T23:38:09.347Z",
          creadoEn: "2025-07-20T20:46:39.804149Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "nuevo-lead"
        },
        {
          id: "contact-3",
          identificacion: "555123456",
          telefono: "555123456",
          nombre: "Ana Rodríguez",
          etapaDelEmbudo: "contacto",
          prioridad: "alta",
          estaAlHabilitado: true,
          etiquetas: ["aumento-pecho", "seguimiento"],
          ultimaActividad: "2025-07-21T10:00:00.000Z",
          creadoEn: "2025-07-19T15:30:00.000Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "en-contacto"
        },
        {
          id: "contact-4",
          identificacion: "555789012",
          telefono: "555789012",
          nombre: "Carmen López",
          etapaDelEmbudo: "cita",
          prioridad: "alta",
          estaAlHabilitado: true,
          etiquetas: ["liposucción", "programada"],
          ultimaActividad: "2025-07-20T14:00:00.000Z",
          creadoEn: "2025-07-18T09:15:00.000Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "cita-agendada"
        },
        {
          id: "contact-5",
          identificacion: "555345678",
          telefono: "555345678",
          nombre: "Isabella Torres",
          etapaDelEmbudo: "completado",
          prioridad: "baja",
          estaAlHabilitado: false,
          etiquetas: ["botox", "atencion-cliente"],
          ultimaActividad: "2025-07-14T16:30:00.000Z",
          creadoEn: "2025-07-10T11:00:00.000Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "atencion-cliente"
        },
        {
          id: "contact-6",
          identificacion: "555999888",
          telefono: "555999888",
          nombre: "María González",
          etapaDelEmbudo: "completado",
          prioridad: "baja",
          estaAlHabilitado: true,
          etiquetas: ["rinoplastia", "completado"],
          ultimaActividad: "2025-07-12T08:30:00.000Z",
          creadoEn: "2025-07-05T14:20:00.000Z",
          idDeUsuario: "2",
          proveedor: "META",
          numeroLinea: "56666661779",
          status: "cerrado"
        }
      ];
      
      // console.log('📦 Mock contacts loaded:', mockContacts.length, 'contacts');
      // console.log('📝 Mock contacts details:', mockContacts);
      setAllContacts(mockContacts);
    }
  }, [lineId, BACKEND_URL]);

  // Handle contact status change
  const handleContactStatusChange = useCallback(async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Si se mueve a "Atención al Cliente", desactivar la IA
        const shouldDisableAI = newStatus === 'atencion-cliente';
        
        if (shouldDisableAI) {
          // Llamada adicional para desactivar la IA
          try {
            await fetch(`${BACKEND_URL}/api/contacts/${contactId}/disable-ai`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (error) {
            console.error('Error disabling AI:', error);
          }
        }

        setAllContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { 
                  ...contact, 
                  status: newStatus as Contact['status'],
                  estaAlHabilitado: !shouldDisableAI // Desactivar AI si va a atención al cliente
                }
              : contact
          )
        );
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  }, [BACKEND_URL]);

  // Handle contact update (name, tags, etc.)
  const handleContactUpdate = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Actualizar el contacto en el estado local
          setAllContacts(prevContacts => 
            prevContacts.map(contact => 
              contact.id === contactId 
                ? { ...contact, ...updates }
                : contact
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  }, [BACKEND_URL]);

  // Handle adding new tag
  const handleAddTag = useCallback(async (tagName: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: tagName }),
      });

      if (response.ok) {
        // Actualizar las etiquetas de la línea inmediatamente
        setLineTags(prevTags => {
          if (!prevTags.includes(tagName)) {
            return [...prevTags, tagName];
          }
          return prevTags;
        });
        
        // Refrescar los contactos y etiquetas de la línea
        await Promise.all([fetchAllContacts(), fetchLineTags()]);
      } else {
        console.error('Error adding tag');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  }, [BACKEND_URL, lineId, fetchAllContacts, fetchLineTags]);

  // Handle editing tag
  const handleEditTag = useCallback(async (oldTag: string, newTag: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/tags/${encodeURIComponent(oldTag)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newTag }),
      });

      if (response.ok) {
        // Actualizar las etiquetas localmente
        setLineTags(prevTags => 
          prevTags.map(tag => tag === oldTag ? newTag : tag)
        );
        
        // Refrescar desde el servidor
        await fetchLineTags();
      } else {
        console.error('Error editing tag');
      }
    } catch (error) {
      console.error('Error editing tag:', error);
    }
  }, [BACKEND_URL, lineId, fetchLineTags]);

  // Handle deleting tag
  const handleDeleteTag = useCallback(async (tagToDelete: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/tags/${encodeURIComponent(tagToDelete)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Actualizar las etiquetas localmente
        setLineTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
        
        // Refrescar desde el servidor
        await fetchLineTags();
      } else {
        console.error('Error deleting tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  }, [BACKEND_URL, lineId, fetchLineTags]);

  // Handle goto chat - Navegar al chat con contacto seleccionado
  const handleGotoChat = useCallback((contact: Contact) => {
    // console.log('🎯 Navigating to chat with contact:', contact);
    setSelectedContactForChat(contact);
    setCurrentView('chat');
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulamos datos del dashboard de línea
      const mockData: LineDashboardData = {
        line: {
          id: lineId,
          numero: "15556647179",
          proveedor: "META",
          estaActivo: true,
          creadoEn: "2025-07-18T06:04:22.007746+00:00",
          idDeUsuario: "2",
          contactsCount: 4,
          activeContacts: 4,
          lastActivity: "2025-07-20T23:37:09.569Z"
        },
        stats: {
          totalContacts: 4,
          activeContacts: 4,
          newLeads: 4,
          inProgress: 0,
          scheduled: 0,
          closed: 0,
          conversionRate: 0,
          averageResponseTime: "2 min",
          todayMessages: 12,
          weeklyMessages: 45
        },
        recentContacts: [
          {
            id: "aec2e5fb-ec30-4f5f",
            identificacion: "1646589346B",
            telefono: "1646589346B",
            nombre: "Contacto Anónimo",
            etapaDelEmbudo: "nuevo",
            prioridad: "media",
            estaAlHabilitado: true,
            etiquetas: ["reciente"],
            ultimaActividad: "2025-07-20T23:37:09.569Z",
            creadoEn: "2025-07-20T23:37:10.003709Z",
            idDeUsuario: "2",
            proveedor: "META",
            numeroLinea: "56666661779",
            status: "nuevo-lead"
          },
          {
            id: "de30bd5f-5b4-4c0f",
            identificacion: "573824073016",
            telefono: "573824073016",
            nombre: "Juliana Fernández",
            etapaDelEmbudo: "nuevo",
            prioridad: "media",
            estaAlHabilitado: true,
            etiquetas: ["medicina-estetica"],
            ultimaActividad: "2025-07-20T23:38:09.347Z",
            creadoEn: "2025-07-20T20:46:39.804149Z",
            idDeUsuario: "2",
            proveedor: "META",
            numeroLinea: "56666661779",
            status: "nuevo-lead"
          }
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [lineId]);

  useEffect(() => {
    if (lineId) {
      fetchDashboardData();
      fetchAllContacts();
      fetchLineTags(); // Cargar las etiquetas de la línea
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId]); // Solo ejecutar cuando cambie lineId

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Error al cargar dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { line } = dashboardData;

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
      {/* Header with navigation */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <DashboardHeader 
          line={line}
          totalContacts={allContacts.length}
          onBackClick={() => router.push('/crm')}
        />
        
        <NavigationTabs
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 md:px-8 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            allContacts={allContacts}
            filteredContacts={filteredContacts}
            selectedTags={selectedTags}
            searchTerm={searchTerm}
            analyticsStats={analyticsStats}
            lineTags={lineTags}
            onTagToggle={toggleTag}
            onSearchChange={handleSearchChange}
            onClearFilters={clearFilters}
            onContactStatusChange={handleContactStatusChange}
            onContactUpdate={handleContactUpdate}
            onGotoChat={handleGotoChat}
            onAddTag={handleAddTag}
            onEditTag={handleEditTag}
            onDeleteTag={handleDeleteTag}
          />
        )}

        {currentView === 'chat' && (
          <ChatSection
            contacts={allContacts}
            lineId={line.id}
            selectedContactFromKanban={selectedContactForChat}
            onContactUpdate={handleContactUpdate}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsSection
            contacts={allContacts}
            stats={analyticsStats}
            lineId={lineId}
          />
        )}
      </div>
    </div>
  );
}

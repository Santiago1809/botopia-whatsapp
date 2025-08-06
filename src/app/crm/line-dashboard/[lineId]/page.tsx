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

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://crm-api-black.vercel.app' 
      : 'http://localhost:5005');

  // 🔥 WEBSOCKET TIEMPO REAL - SIN POLLING
  const wsHook = useCRMWebSocket({
    lineId: lineId,
    userId: 'agent-1',
    backendUrl: BACKEND_URL
  });

  // Debug logs para verificar conexión
  useEffect(() => {
    console.log('🔍 [DEBUG] Dashboard montado con lineId:', lineId);
    console.log('🔍 [DEBUG] Backend URL:', BACKEND_URL);
    console.log('🔍 [DEBUG] WebSocket status:', {
      isConnected: wsHook.isConnected,
      connectionStatus: wsHook.connectionStatus
    });
  }, [lineId, BACKEND_URL, wsHook.isConnected, wsHook.connectionStatus]);

  // Handler para actualizaciones de contacto en tiempo real
  useEffect(() => {
    console.log('🔌 CRM Dashboard: Configurando handlers de WebSocket...');
    console.log('🔍 [DEBUG] WebSocket conectado:', wsHook.isConnected);
    console.log('🔍 [DEBUG] LineId para WebSocket:', lineId);
    
    // Handler para actualizaciones de contacto - FORZAR ACTUALIZACIÓN
    wsHook.registerContactUpdateHandler((update) => {
      console.log('🔥 [DEBUG] Dashboard recibió contacto actualizado via WebSocket:', {
        id: update.id,
        name: update.name,
        phone: update.phone,
        funnel_stage: update.funnel_stage,
        priority: update.priority,
        lastMessage: update.lastMessage,
        last_activity: update.last_activity
      });

      // 🚀 FORZAR ACTUALIZACIÓN INMEDIATA - NO IMPORTA QUE PASE
      console.log('🚨 [FORCE] Forzando actualización de contacto via WebSocket');

      // Mapear el status del backend al formato del frontend
      const mapStatus = (funnelStage: string): Contact['status'] => {
        switch (funnelStage) {
          case 'nuevo':
          case 'nuevo-lead':
            return 'nuevo-lead';
          case 'contacto':
          case 'en-contacto':
            return 'en-contacto';
          case 'cita':
          case 'cita-agendada':
            return 'cita-agendada';
          case 'atencion_cliente':
          case 'atencion-cliente':
            return 'atencion-cliente';
          case 'completado':
          case 'cerrado':
            return 'cerrado';
          case 'pendiente-documentacion':
            return 'pendiente-documentacion';
          default:
            return 'nuevo-lead';
        }
      };

      // 🔥 ACTUALIZACIÓN FORZADA - SE EJECUTA SIEMPRE
      setAllContacts(prevContacts => {
        console.log('🔍 [DEBUG] Contactos actuales:', prevContacts.length);
        console.log('🔍 [DEBUG] Buscando contacto con ID:', update.id);
        
        let contactFound = false;
        let updatedContacts = prevContacts.map(contact => {
          if (contact.id === update.id) {
            contactFound = true;
            console.log('✅ [DEBUG] Contacto encontrado! Actualizando:', contact.id);
            
            const updatedContact = {
              ...contact,
              nombre: update.name || contact.nombre,
              telefono: update.phone || contact.telefono,
              status: mapStatus(update.funnel_stage || contact.etapaDelEmbudo),
              etapaDelEmbudo: update.funnel_stage || contact.etapaDelEmbudo,
              prioridad: update.priority || contact.prioridad,
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
              etiquetas: update.tags || contact.etiquetas,
              ultimaActividad: update.last_activity || contact.ultimaActividad,
              // 🚀 Forzar cambio para trigger re-render en cartas Kanban
              _lastUpdate: Date.now()
            };

            // Actualizar último mensaje si está disponible
            if (update.lastMessage) {
              updatedContact.ultimoMensaje = {
                mensaje: update.lastMessage.message,
                timestamp: update.lastMessage.timestamp,
                remitente: update.lastMessage.sender === 'user' ? 'usuario' : 
                          update.lastMessage.sender === 'bot' ? 'bot' : 'agente'
              };
              console.log('📨 [DEBUG] Último mensaje actualizado en contacto:', updatedContact.ultimoMensaje);
              console.log('🎯 [KANBAN] Mensaje y última actividad DEBEN actualizarse en carta del Kanban');
            }

            console.log('🎯 [DEBUG] Contacto actualizado exitosamente:', {
              id: updatedContact.id,
              status: updatedContact.status,
              ultimaActividad: updatedContact.ultimaActividad,
              nombre: updatedContact.nombre,
              ultimoMensaje: updatedContact.ultimoMensaje ? 'Sí tiene mensaje' : 'Sin mensaje'
            });

            return updatedContact;
          }
          return contact;
        });

        // Si no se encontró el contacto, buscar por teléfono o agregar si es nuevo
        if (!contactFound) {
          console.log('⚠️ [DEBUG] Contacto no encontrado con ID:', update.id);
          
          // Buscar por teléfono como fallback
          const contactByPhone = prevContacts.find(c => c.telefono === update.phone);
          if (contactByPhone) {
            console.log('📞 [DEBUG] Encontrado contacto por teléfono:', contactByPhone.id);
            updatedContacts = prevContacts.map(contact => {
              if (contact.telefono === update.phone) {
                return {
                  ...contact,
                  nombre: update.name || contact.nombre,
                  status: mapStatus(update.funnel_stage || contact.etapaDelEmbudo),
                  ultimaActividad: update.last_activity || contact.ultimaActividad,
                };
              }
              return contact;
            });
          } else {
            console.log('➕ [DEBUG] Agregando nuevo contacto desde WebSocket');
            // Crear nuevo contacto si no existe
            const newContact: Contact = {
              id: update.id,
              identificacion: update.phone || '',
              telefono: update.phone || '',
              nombre: update.name || 'Contacto Nuevo',
              etapaDelEmbudo: update.funnel_stage || 'nuevo',
              prioridad: update.priority || 'media',
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : true,
              etiquetas: update.tags || [],
              ultimaActividad: update.last_activity || new Date().toISOString(),
              creadoEn: new Date().toISOString(),
              idDeUsuario: "2",
              proveedor: "META",
              numeroLinea: lineId,
              status: mapStatus(update.funnel_stage || 'nuevo'),
              ultimoMensaje: update.lastMessage ? {
                mensaje: update.lastMessage.message,
                timestamp: update.lastMessage.timestamp,
                remitente: update.lastMessage.sender === 'user' ? 'usuario' : 
                          update.lastMessage.sender === 'bot' ? 'bot' : 'agente'
              } : undefined
            };
            updatedContacts = [...prevContacts, newContact];
          }
        }

        console.log('✅ [FORCE] Estado de contactos actualizado FORZOSAMENTE');
        console.log('📊 [DEBUG] Total contactos después de actualización:', updatedContacts.length);
        console.log('🎯 [KANBAN] Las cartas del Kanban DEBEN mostrar datos actualizados ahora');
        
        // Retornar SIEMPRE un nuevo array para forzar re-render
        return [...updatedContacts];
      });
    });

    // Handler para contactos eliminados
    wsHook.registerContactDeletedHandler((data) => {
      console.log('🗑️ CRM Dashboard: Contacto eliminado via WebSocket:', data);
      
      setAllContacts(prevContacts => {
        return prevContacts.filter(contact => contact.id !== data.id);
      });
    });

    // 🚨 HANDLER DE FUERZA BRUTA - ESCUCHA CUALQUIER CAMBIO EN CONVERSACIONES
    wsHook.registerMessageHandler((message) => {
      console.log('📨 [FORCE] Nuevo mensaje detectado via WebSocket - Forzando actualización de contacto:', {
        contactId: message.contactId,
        message: message.message,
        sender: message.sender,
        timestamp: message.timestamp
      });

      // Actualizar el último mensaje del contacto correspondiente
      setAllContacts(prevContacts => {
        let contactUpdated = false;
        const updatedContacts = prevContacts.map(contact => {
          if (contact.id === message.contactId) {
            contactUpdated = true;
            console.log('📨 [FORCE] Actualizando último mensaje para contacto:', contact.id);
            console.log('📨 [BEFORE] Contacto antes de actualizar:', {
              ultimoMensaje: contact.ultimoMensaje,
              ultimaActividad: contact.ultimaActividad
            });
            
            const updatedContact = {
              ...contact,
              // 🔥 FORZAR COPIA PROFUNDA DEL ÚLTIMO MENSAJE
              ultimoMensaje: {
                mensaje: message.message,
                timestamp: message.timestamp,
                remitente: message.sender === 'user' ? 'usuario' : 
                          message.sender === 'bot' ? 'bot' : 'agente'
              },
              ultimaActividad: message.timestamp,
              // 🚀 Agregar timestamp único para forzar re-render
              _lastUpdate: Date.now()
            };
            
            console.log('📨 [AFTER] Contacto después de actualizar:', {
              ultimoMensaje: updatedContact.ultimoMensaje,
              ultimaActividad: updatedContact.ultimaActividad,
              _lastUpdate: updatedContact._lastUpdate
            });
            
            return updatedContact;
          }
          return contact;
        });
        
        if (contactUpdated) {
          console.log('✅ [FORCE] Último mensaje actualizado por WebSocket - CARTAS KANBAN DEBERÍAN ACTUALIZARSE AHORA');
          console.log('📊 [DEBUG] Total contactos en estado:', updatedContacts.length);
          console.log('🎯 [DEBUG] Contacto actualizado en array:', 
            updatedContacts.find(c => c.id === message.contactId)?.ultimoMensaje
          );
        } else {
          console.log('⚠️ [WARNING] No se encontró contacto con ID:', message.contactId);
          console.log('📋 [DEBUG] IDs de contactos disponibles:', prevContacts.map(c => c.id));
        }
        
        // 🚀 RETORNAR SIEMPRE NUEVO ARRAY PARA FORZAR RE-RENDER
        return [...updatedContacts];
      });
    });

    // Handler para actualizaciones de dashboard
    wsHook.registerDashboardUpdateHandler(() => {
      console.log('📊 CRM Dashboard: Dashboard actualizado via WebSocket');
      // Forzar actualización requerida desde el backend
    });

    // Handler para actualizaciones de analytics
    wsHook.registerAnalyticsUpdateHandler(() => {
      console.log('📈 CRM Dashboard: Analytics actualizado via WebSocket');
      // Los analytics se actualizan automáticamente via el hook useDashboardFilters
    });

    // 🚨 ÚLTIMO RECURSO - Escuchar CUALQUIER evento de contacto actualizado globalmente
    if (wsHook.socket) {
      wsHook.socket.on('contact-updated', (update: unknown) => {
        console.log('🌍 [GLOBAL] Evento contact-updated capturado directamente del socket:', update);
        // Este evento se manejará por el handler registrado arriba
      });

      wsHook.socket.on('new-message', (message: unknown) => {
        console.log('🌍 [GLOBAL] Evento new-message capturado directamente del socket:', message);
        // Este evento se manejará por el handler registrado arriba
      });
    }

    console.log('✅ CRM Dashboard: Handlers de WebSocket configurados correctamente');
  }, [wsHook, lineId]);

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
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/contacts`);
      const data = await response.json();
      
      if (data.success) {
        setAllContacts(data.data);
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

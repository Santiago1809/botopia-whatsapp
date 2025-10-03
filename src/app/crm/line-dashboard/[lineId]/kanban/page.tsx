"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import KanbanBoard from "../../../../../components/crm/KanbanBoard";
import FilterSidebar from "../../../../../components/crm/FilterSidebar";
import StatsOverview from "../../../../../components/crm/StatsOverview";
import { useCRMWebSocket } from "../../../../../hooks/useCRMWebSocket";
import { Contact } from "../../../../../types/dashboard";

export default function KanbanPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Helper function para convertir UTC a hora local de Colombia
  const toColombiaTime = (utcTimestamp: string): string => {
    try {
      const date = new Date(utcTimestamp);
      // Colombia está en UTC-5, así que restamos 5 horas
      const colombiaDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
      // Devolver sin la 'Z' para que sea tratado como hora local
      return colombiaDate.toISOString().slice(0, -1);
    } catch (error) {
      console.warn('Error convirtiendo timestamp a hora Colombia:', error);
      return utcTimestamp; // Devolver original si hay error
    }
  };
  const [stats, setStats] = useState({
    total: 0,
    pendienteDocumentacion: 0,
    nuevoLead: 0,
    enContacto: 0,
    citaAgendada: 0,
    atencionCliente: 0,
    cerrado: 0,
    conversion: 0,
  });

  const params = useParams();
  const router = useRouter();
  const lineId = params.lineId as string;

  // Configuración del backend
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  // Hook de WebSocket
  const wsHook = useCRMWebSocket({ 
    lineId, 
    userId: 'kanban-user',
    backendUrl: BACKEND_URL
  });

  // Función para aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = allContacts;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        (contact.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        contact.telefono.includes(searchTerm)
      );
    }

    // Filtro por tags seleccionados
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact => {
        // Verificar si el contacto tiene alguna de las etiquetas seleccionadas
        return selectedTags.some(tag => {
          // Filtros especiales para prioridad
          if (['alta', 'media', 'baja'].includes(tag)) {
            return contact.prioridad === tag;
          }
          // Filtros especiales para estado del embudo
          if (['nuevo_contacto', 'en_contacto', 'cita_agendada', 'atencion_cliente', 'cita_cancelada'].includes(tag)) {
            return contact.etapaDelEmbudo === tag;
          }
          // Filtros por etiquetas normales
          return contact.etiquetas.includes(tag);
        });
      });
    }

    setFilteredContacts(filtered);
  }, [allContacts, searchTerm, selectedTags]);

  // Aplicar filtros cuando cambien los datos
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Calcular estadísticas cuando cambien los contactos filtrados
  useEffect(() => {
    const total = filteredContacts.length;
    const nuevoLead = filteredContacts.filter(c => 
      !c.etapaDelEmbudo || c.etapaDelEmbudo === 'null' || c.etapaDelEmbudo === 'nuevo_contacto'
    ).length;
    const enContacto = filteredContacts.filter(c => c.etapaDelEmbudo === 'en_contacto').length;
    const citaAgendada = filteredContacts.filter(c => c.etapaDelEmbudo === 'cita_agendada').length;
    const atencionCliente = filteredContacts.filter(c => c.etapaDelEmbudo === 'atencion_cliente').length;
    const cerrado = filteredContacts.filter(c => c.etapaDelEmbudo === 'cita_cancelada').length;
    
    const newStats = {
      total,
      pendienteDocumentacion: 0, // No tenemos esta etapa en el funnel
      nuevoLead,
      enContacto,
      citaAgendada,
      atencionCliente,
      cerrado,
      conversion: total > 0 ? Math.round((cerrado / total) * 100) : 0,
    };
    setStats(newStats);
  }, [filteredContacts]);

  // Cargar contactos
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/contacts?lineId=${lineId}`);
        if (response.ok) {
          const data = await response.json();
          const mapStatusFromFunnel = (funnelStage: string): Contact['status'] => {
            if (!funnelStage || funnelStage === 'null') return 'nuevo-lead';
            switch (funnelStage) {
              case 'nuevo_contacto': return 'nuevo-lead';
              case 'en_contacto': return 'en-contacto';
              case 'cita_agendada': return 'cita-agendada';
              case 'atencion_cliente': return 'atencion-cliente';
              case 'cita_cancelada': return 'cerrado';
              case 'pendiente-documentacion': return 'pendiente-documentacion';
              default: return 'nuevo-lead';
            }
          };

          const normalized = (data.data || []).map((c: Contact) => ({
            ...c,
            status: mapStatusFromFunnel(c.etapaDelEmbudo),
          }));

          setAllContacts(normalized);
        }
      } catch (error) {
        console.error('Error cargando contactos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lineId) {
      loadContacts();
    }
  }, [lineId, BACKEND_URL]);

  // WebSocket handlers
  useEffect(() => {
    wsHook.registerContactUpdateHandler((update) => {
      
      const mapStatus = (funnelStage: string): Contact['status'] => {
        // Si funnel_stage es null o undefined, va a "nuevo-lead"
        if (!funnelStage || funnelStage === 'null') {
          return 'nuevo-lead';
        }
        
        switch (funnelStage) {
          case 'nuevo_contacto': return 'nuevo-lead';
          case 'en_contacto': return 'en-contacto';
          case 'cita_agendada': return 'cita-agendada';
          case 'cita_cancelada': return 'cerrado';
          case 'atencion_cliente': return 'atencion-cliente';
          default: return 'nuevo-lead';
        }
      };

      setAllContacts(prevContacts => {
        let contactFound = false;
        let updatedContacts = prevContacts.map(contact => {
          if (contact.id === update.id) {
            contactFound = true;
            const newFunnelStage = update.funnel_stage || contact.etapaDelEmbudo;
            const newStatus = mapStatus(newFunnelStage);
            
            return {
              ...contact,
              nombre: update.name || contact.nombre,
              telefono: update.phone || contact.telefono,
              status: newStatus,
              etapaDelEmbudo: newFunnelStage,
              prioridad: update.priority || contact.prioridad,
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
              etiquetas: update.tags || contact.etiquetas,
              ultimaActividad: update.last_activity || contact.ultimaActividad,
              // Actualizar último mensaje si viene en la actualización
              ultimoMensaje: update.lastMessage ? {
                mensaje: update.lastMessage.message,
                timestamp: update.lastMessage.timestamp,
                remitente: update.lastMessage.remitente || 
                  (update.lastMessage.sender === 'user' ? 'usuario' : 
                   update.lastMessage.sender === 'bot' ? 'bot' : 'agente')
              } : contact.ultimoMensaje,
              _lastUpdate: Date.now()
            };
          }
          return contact;
        });

        if (!contactFound) {
          const contactByPhone = prevContacts.find(c => c.telefono === update.phone);
          if (contactByPhone) {
            updatedContacts = prevContacts.map(contact => {
              if (contact.telefono === update.phone) {
                const newFunnelStage = update.funnel_stage || contact.etapaDelEmbudo;
                const newStatus = mapStatus(newFunnelStage);
                
                return {
                  ...contact,
                  nombre: update.name || contact.nombre,
                  status: newStatus,
                  etapaDelEmbudo: newFunnelStage,
                  prioridad: update.priority || contact.prioridad,
                  estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
                  etiquetas: update.tags || contact.etiquetas,
                  ultimaActividad: update.last_activity ? toColombiaTime(update.last_activity) : contact.ultimaActividad,
                  // Actualizar último mensaje si viene en la actualización
                  ultimoMensaje: update.lastMessage ? {
                    mensaje: update.lastMessage.message,
                    timestamp: toColombiaTime(update.lastMessage.timestamp),
                    remitente: update.lastMessage.remitente || 
                      (update.lastMessage.sender === 'user' ? 'usuario' : 
                       update.lastMessage.sender === 'bot' ? 'bot' : 'agente')
                  } : contact.ultimoMensaje,
                  _lastUpdate: Date.now()
                };
              }
              return contact;
            });
          }
        }

        return updatedContacts;
      });
    });

    wsHook.registerMessageHandler((message) => {
      setAllContacts(prev => prev.map(contact => {
        if (contact.id === message.contactId) {
          return {
            ...contact,
            ultimoMensaje: {
              mensaje: message.message,
              timestamp: message.timestamp,
              remitente: message.sender === 'user' ? 'usuario' : message.sender === 'bot' ? 'bot' : 'agente'
            },
            ultimaActividad: message.timestamp,
            _lastUpdate: Date.now()
          };
        }
        return contact;
      }));
    });

  }, [wsHook, lineId, allContacts]);

  // Actualizar estado del contacto (nombre, etiquetas, prioridad, funnel_stage)
  const handleContactUpdate = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    // Si se está actualizando etapaDelEmbudo, también actualizar el status correspondiente
    const finalUpdates: Partial<Contact> = { ...updates };
    if (updates.etapaDelEmbudo) {
      const mapStatusFromFunnel = (funnelStage: string): Contact['status'] => {
        if (!funnelStage || funnelStage === 'null') {
          return 'nuevo-lead';
        }
        
        switch (funnelStage) {
          case 'nuevo_contacto': return 'nuevo-lead';
          case 'en_contacto': return 'en-contacto';
          case 'cita_agendada': return 'cita-agendada';
          case 'atencion_cliente': return 'atencion-cliente';
          case 'cita_cancelada': return 'cerrado';
          case 'pendiente-documentacion': return 'pendiente-documentacion';
          default: return 'nuevo-lead';
        }
      };
      
      finalUpdates.status = mapStatusFromFunnel(updates.etapaDelEmbudo);
    }

    // Optimistic update
    setAllContacts(prev => prev.map(c => (c.id === contactId ? { ...c, ...finalUpdates } : c)));

    try {
      const payload: Record<string, unknown> = {};
      if (typeof updates.nombre !== 'undefined') payload.name = updates.nombre;
      if (typeof updates.telefono !== 'undefined') payload.phone = updates.telefono;
      if (typeof updates.etapaDelEmbudo !== 'undefined') payload.funnel_stage = updates.etapaDelEmbudo;
      if (typeof updates.prioridad !== 'undefined') payload.priority = updates.prioridad;
      if (typeof updates.estaAlHabilitado !== 'undefined') payload.is_ai_enabled = updates.estaAlHabilitado;
      if (typeof updates.etiquetas !== 'undefined') payload.tags = updates.etiquetas;

      console.log('🔄 [CONTACT UPDATE] Enviando actualización al backend:', {
        payload,
        BACKEND_URL,
        endpoint: `${BACKEND_URL}/api/contacts/${contactId}`,
        isProduction: BACKEND_URL.includes('railway.app')
      });

      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ [CONTACT UPDATE] Backend actualizado correctamente');
        console.log('📡 [CONTACT UPDATE] WebSocket emitirá contact-updated automáticamente');
      } else {
        console.error('❌ [CONTACT UPDATE] Error en backend, revirtiendo cambios');
        // Revertir cambios si falla el backend
        setAllContacts(prev => prev.map(c => (c.id === contactId ? { ...c } : c)));
      }
    } catch (error) {
      console.error('❌ [CONTACT UPDATE] Error actualizando contacto:', error);
      // Revertir cambios si hay error
      setAllContacts(prev => prev.map(c => (c.id === contactId ? { ...c } : c)));
    }
  }, [BACKEND_URL]);

  // Cambiar columna (status) => actualizar funnel_stage en backend
  const handleContactStatusChange = useCallback(async (contactId: string, newStatus: string) => {
    let funnel_stage = 'nuevo_contacto';
    switch (newStatus) {
      case 'nuevo-lead':
        funnel_stage = 'nuevo_contacto';
        break;
      case 'en-contacto':
        funnel_stage = 'en_contacto';
        break;
      case 'cita-agendada':
        funnel_stage = 'cita_agendada';
        break;
      case 'atencion-cliente':
        funnel_stage = 'atencion_cliente';
        break;
      case 'cerrado':
        funnel_stage = 'cita_cancelada';
        break;
    }

    // Optimistic update local
    setAllContacts(prev => prev.map(c => (
      c.id === contactId ? { ...c, status: newStatus as Contact['status'], etapaDelEmbudo: funnel_stage } : c
    )));

    try {
      console.log('🔄 [STATUS CHANGE] Actualizando funnel_stage:', {
        contactId,
        newStatus,
        funnel_stage,
        BACKEND_URL,
        endpoint: `${BACKEND_URL}/api/contacts/${contactId}`,
        isProduction: BACKEND_URL.includes('railway.app')
      });
      
      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnel_stage }),
      });
      
      if (response.ok) {
        console.log('✅ [STATUS CHANGE] funnel_stage actualizado correctamente');
      } else {
        console.error('❌ [STATUS CHANGE] Error en backend:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ [STATUS CHANGE] Error actualizando funnel_stage:', error);
    }
  }, [BACKEND_URL]);

  // Handle goto chat
  const handleGotoChat = (contact: Contact) => {
    router.push(`/crm/line-dashboard/${lineId}/chat?contact=${contact.id}`);
  };

  // Funciones de manejo de filtros
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile bar (no sticky) */}
      <div className="md:hidden bg-gray-50/90 dark:bg-gray-900/90 border-b px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-200">Tablero Kanban</span>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="text-xs px-3 py-1 rounded-md border text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
        {/* Sidebar de Filtros */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block md:static md:translate-x-0 w-full md:w-auto md:max-w-xs order-1 md:order-1 mt-2 md:mt-0`}>
          <FilterSidebar
            allContacts={allContacts}
            filteredContacts={filteredContacts}
            selectedTags={selectedTags}
            searchTerm={searchTerm}
            onTagToggle={handleTagToggle}
            onSearchChange={handleSearchChange}
            onClearFilters={handleClearFilters}
          />
        </div>
        
        {/* Tablero Kanban */}
  <div className="flex-1 min-w-0 order-2 md:order-2">
          {/* Stats Overview - oculto en móvil, visible en escritorio */}
          <div className="hidden md:block">
            <div className="px-0">
              <StatsOverview analyticsStats={stats} />
            </div>
          </div>
          
          <div className="mt-4 overflow-x-hidden pb-2 md:pb-0">
            <div>
              <KanbanBoard 
                contacts={filteredContacts}
                onContactUpdate={handleContactUpdate}
                onContactStatusChange={handleContactStatusChange}
                onGotoChat={handleGotoChat}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

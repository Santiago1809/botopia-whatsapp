"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import AnalyticsSection from "../../../../../components/crm/AnalyticsSection";
import { useCRMWebSocket } from "../../../../../hooks/useCRMWebSocket";
import { Contact } from "../../../../../types/dashboard";

export default function AnalyticsPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsStats, setAnalyticsStats] = useState({
    totalContacts: 0,
    newContacts: 0,
    inContact: 0,
    scheduledAppointments: 0,
    customerService: 0
  });

  const params = useParams();
  const lineId = params.lineId as string;

  // Configuración del backend
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  // Hook de WebSocket
  const wsHook = useCRMWebSocket({ 
    lineId, 
    userId: 'analytics-user',
    backendUrl: BACKEND_URL
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar contactos
        const contactsResponse = await fetch(`${BACKEND_URL}/api/contacts?lineId=${lineId}`);
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setAllContacts(contactsData.data || []);
        }

        // Cargar estadísticas
        const statsResponse = await fetch(`${BACKEND_URL}/api/stats?lineId=${lineId}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setAnalyticsStats(statsData.data || analyticsStats);
        }

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lineId) {
      loadData();
    }
  }, [lineId, BACKEND_URL, analyticsStats]);

  // WebSocket handlers con mapeo de estados y actualización de último mensaje
  useEffect(() => {
    wsHook.registerContactUpdateHandler((update) => {
      console.log('🔥 [WEBSOCKET] Actualización de contacto recibida:', update);

      const mapStatus = (funnelStage: string) => {
        if (!funnelStage || funnelStage === 'null') return 'nuevo_contacto';
        return funnelStage;
      };

      setAllContacts(prevContacts => {
        let contactFound = false;
        let updatedContacts = prevContacts.map(contact => {
          if (contact.id === update.id) {
            contactFound = true;
            const newFunnelStage = update.funnel_stage || contact.etapaDelEmbudo;
            const updatedContact = {
              ...contact,
              nombre: update.name || contact.nombre,
              telefono: update.phone || contact.telefono,
              etapaDelEmbudo: mapStatus(newFunnelStage),
              prioridad: update.priority || contact.prioridad,
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
              etiquetas: update.tags || contact.etiquetas,
              ultimaActividad: update.last_activity || contact.ultimaActividad,
              _lastUpdate: Date.now()
            } as Contact;

            if (update.lastMessage) {
              updatedContact.ultimoMensaje = {
                mensaje: update.lastMessage.message,
                timestamp: update.lastMessage.timestamp,
                remitente: update.lastMessage.sender === 'user' ? 'usuario' : update.lastMessage.sender === 'bot' ? 'bot' : 'agente'
              };
            }

            return updatedContact;
          }
          return contact;
        });

        if (!contactFound) {
          const contactByPhone = prevContacts.find(c => c.telefono === update.phone);
          if (contactByPhone) {
            updatedContacts = prevContacts.map(contact => {
              if (contact.telefono === update.phone) {
                const newFunnelStage = update.funnel_stage || contact.etapaDelEmbudo;
                const updatedContact = {
                  ...contact,
                  nombre: update.name || contact.nombre,
                  etapaDelEmbudo: mapStatus(newFunnelStage),
                  prioridad: update.priority || contact.prioridad,
                  estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
                  etiquetas: update.tags || contact.etiquetas,
                  ultimaActividad: update.last_activity || contact.ultimaActividad,
                  _lastUpdate: Date.now()
                } as Contact;

                if (update.lastMessage) {
                  updatedContact.ultimoMensaje = {
                    mensaje: update.lastMessage.message,
                    timestamp: update.lastMessage.timestamp,
                    remitente: update.lastMessage.sender === 'user' ? 'usuario' : update.lastMessage.sender === 'bot' ? 'bot' : 'agente'
                  };
                }

                return updatedContact;
              }
              return contact;
            });
          }
        }

        return updatedContacts;
      });
    });

    wsHook.registerMessageHandler((message) => {
      console.log('📨 [WEBSOCKET] Nuevo mensaje recibido:', message);
      setAllContacts(prevContacts => prevContacts.map(contact => {
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

  }, [wsHook, lineId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">


      

  <div className="p-4 md:p-6">
        <AnalyticsSection 
          contacts={allContacts}
          stats={{
            total: allContacts.length,
            pendienteDocumentacion: allContacts.filter(c => c.etapaDelEmbudo === 'pendiente-documentacion').length,
            nuevoLead: allContacts.filter(c => c.etapaDelEmbudo === 'nuevo_contacto').length,
            enContacto: allContacts.filter(c => c.etapaDelEmbudo === 'en_contacto').length,
            citaAgendada: allContacts.filter(c => c.etapaDelEmbudo === 'cita_agendada').length,
            atencionCliente: allContacts.filter(c => c.etapaDelEmbudo === 'atencion_cliente').length,
            cerrado: allContacts.filter(c => c.etapaDelEmbudo === 'cita_cancelada').length,
            conversion: 0
          }}
          lineId={lineId}
        />
      </div>
    </div>
  );
}

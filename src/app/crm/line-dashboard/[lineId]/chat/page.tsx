"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

import ChatSection from "../../../../../components/crm/ChatSection";
import { useCRMWebSocket } from "../../../../../hooks/useCRMWebSocket";
import { Contact } from "../../../../../types/dashboard";

export default function ChatPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lineId = params.lineId as string;
  const contactId = searchParams.get('contact');

  // Configuración del backend
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  // Normaliza timestamps a un formato consistente (ISO con zona horaria) sin tocar valores tipo "HH:MM"
  const normalizeTimestamp = (timestamp?: string): string | undefined => {
    if (!timestamp) return timestamp;
    // Si viene como 'HH:MM' o 'HH:MM:SS', lo dejamos igual
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) return timestamp;
    try {
      const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(timestamp);
      if (hasTZ) {
        const d = new Date(timestamp);
        return isNaN(d.getTime()) ? new Date().toISOString() : timestamp;
      }
      const isoLike = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
      const normalized = `${isoLike}Z`;
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? new Date().toISOString() : normalized;
    } catch {
      return new Date().toISOString();
    }
  };

  // Hook de WebSocket
  const wsHook = useCRMWebSocket({ 
    lineId, 
    userId: 'chat-user',
    backendUrl: BACKEND_URL
  });

  // Cargar contactos
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        // Usar endpoint específico por línea para evitar mezclar contactos
        const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/contacts`);
        if (response.ok) {
          const data = await response.json();
          const normalized = (data.data || []).map((c: Contact) => ({
            ...c,
            ultimaActividad: normalizeTimestamp(c.ultimaActividad) || c.ultimaActividad,
            ultimoMensaje: c.ultimoMensaje ? {
              ...c.ultimoMensaje,
              timestamp: normalizeTimestamp(c.ultimoMensaje.timestamp) || c.ultimoMensaje.timestamp
            } : c.ultimoMensaje
          }));
          setAllContacts(normalized);
          
          // Si hay un contactId en la URL, seleccionarlo
          if (contactId) {
            const contact = data.data.find((c: Contact) => c.id === contactId);
            if (contact) {
              setSelectedContact(contact);
            }
          }
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
  }, [lineId, contactId, BACKEND_URL]);

  // WebSocket handlers
  useEffect(() => {
  wsHook.registerContactUpdateHandler((update) => {
      console.log('🔥 [WEBSOCKET] Actualización de contacto recibida:', update);

      const mapStatus = (funnelStage: string): Contact['status'] => {
        if (!funnelStage || funnelStage === 'null') return 'nuevo-lead';
        switch (funnelStage) {
          case 'nuevo_contacto':
          case 'nuevo':
          case 'nuevo-lead':
            return 'nuevo-lead';
          case 'en_contacto':
          case 'contacto':
          case 'en-contacto':
            return 'en-contacto';
          case 'cita_agendada':
          case 'cita':
          case 'cita-agendada':
            return 'cita-agendada';
          case 'atencion_cliente':
          case 'atencion-cliente':
            return 'atencion-cliente';
          case 'cita_cancelada':
          case 'cerrado':
          case 'completado':
            return 'cerrado';
          case 'pendiente-documentacion':
            return 'pendiente-documentacion';
          default:
            return 'nuevo-lead';
        }
      };

      setAllContacts(prevContacts => {
        const targetId = update.id || update.contactId || '';
  let contactFound = false;
        let updatedContacts = prevContacts.map(contact => {
          if (contact.id === targetId) {
            contactFound = true;
            const newFunnelStage = update.funnel_stage || contact.etapaDelEmbudo;
            const newStatus = mapStatus(newFunnelStage);
            const updatedContact = {
              ...contact,
              nombre: update.name || contact.nombre,
              telefono: update.phone || contact.telefono,
              status: newStatus,
              etapaDelEmbudo: newFunnelStage,
              prioridad: update.priority || contact.prioridad,
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
              etiquetas: update.tags || contact.etiquetas,
              ultimaActividad: normalizeTimestamp(update.last_activity) || contact.ultimaActividad,
              _lastUpdate: Date.now()
            } as Contact;

            if (update.lastMessage) {
              updatedContact.ultimoMensaje = {
                mensaje: update.lastMessage.message,
                timestamp: normalizeTimestamp(update.lastMessage.timestamp) || update.lastMessage.timestamp,
                remitente: update.lastMessage.sender === 'user' ? 'usuario' : 
                          update.lastMessage.sender === 'bot' ? 'bot' : 'agente'
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
                const newStatus = mapStatus(newFunnelStage);
                const updatedContact = {
                  ...contact,
      id: targetId || contact.id,
                  nombre: update.name || contact.nombre,
                  status: newStatus,
                  etapaDelEmbudo: newFunnelStage,
                  prioridad: update.priority || contact.prioridad,
                  estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
                  etiquetas: update.tags || contact.etiquetas,
                  ultimaActividad: normalizeTimestamp(update.last_activity) || contact.ultimaActividad,
                  _lastUpdate: Date.now()
                } as Contact;

                if (update.lastMessage) {
                  updatedContact.ultimoMensaje = {
                    mensaje: update.lastMessage.message,
                    timestamp: normalizeTimestamp(update.lastMessage.timestamp) || update.lastMessage.timestamp,
                    remitente: update.lastMessage.sender === 'user' ? 'usuario' : 
                              update.lastMessage.sender === 'bot' ? 'bot' : 'agente'
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

      // Si el WS dice que este contacto pertenece a otra línea, redirigir automáticamente
      const incomingLineId = update.lineId;
      const incomingContactId = update.id || update.contactId || '';
      if (incomingLineId && incomingLineId !== lineId && incomingContactId) {
        if (selectedContact && selectedContact.id === incomingContactId) {
          console.warn('↪️ [WEBSOCKET] El contacto pertenece a otra línea; redireccionando:', incomingLineId);
          router.push(`/crm/line-dashboard/${incomingLineId}/chat?contact=${incomingContactId}`);
        }
      }
    });

  // Nota: El handler de nuevos mensajes se registra en ChatSection (donde se muestra el chat)
  // para evitar que los handlers se sobreescriban entre sí al compartir el mismo WebSocket.

  }, [wsHook, lineId, router, selectedContact]);

  // Handle contact update
  const handleContactUpdate = async (
    contactId: string,
    updates: Partial<Contact>,
    isWebSocketUpdate: boolean = false
  ) => {
    console.log('🔄 [CONTACT UPDATE] Actualizando contacto:', {
      contactId,
      updates,
      isWebSocketUpdate,
      BACKEND_URL
    });

    // Siempre aplica la actualización localmente para mantener la UI reactiva
    setAllContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, ...updates }
          : contact
      )
    );

    // Si el cambio proviene del WebSocket, no reenviar al backend para evitar bucles
    if (isWebSocketUpdate) return;

    try {
      // Sanitizar payload: solo enviar campos que el backend espera
      const allowedKeys: (keyof Contact)[] = [
        'nombre',
        'telefono',
        'status',
        'etapaDelEmbudo',
        'prioridad',
        'estaAlHabilitado',
        'etiquetas',
        'ultimaActividad'
      ];
      const sanitized: Partial<Contact> = {};
      for (const key of allowedKeys) {
        if (key in updates) {
          // @ts-expect-error indexado seguro
          sanitized[key] = updates[key];
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitized),
      });

      if (!response.ok) {
        console.error('❌ [CONTACT UPDATE] Error en backend:', response.status, response.statusText);
      } else {
        console.log('✅ [CONTACT UPDATE] Contacto sincronizado con backend');
      }
    } catch (error) {
      console.error('❌ [CONTACT UPDATE] Error de conexión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ChatSection 
        contacts={allContacts}
        lineId={lineId}
        selectedContactFromKanban={selectedContact}
  ws={wsHook}
        onContactUpdate={handleContactUpdate}
      />
    </div>
  );
}

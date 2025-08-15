"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

import ChatSection from "../../../../../components/crm/ChatSection";
import { useCRMWebSocket } from "../../../../../hooks/useCRMWebSocket";
import { Contact } from "../../../../../types/dashboard";

export default function ChatPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const lineId = params.lineId as string;
  const contactId = searchParams.get('contact');

  // Configuración del backend
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

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
        const response = await fetch(`${BACKEND_URL}/api/contacts?lineId=${lineId}`);
        if (response.ok) {
          const data = await response.json();
          setAllContacts(data.data || []);
          
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
        let contactFound = false;
        let updatedContacts = prevContacts.map(contact => {
          if (contact.id === update.id) {
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
              ultimaActividad: update.last_activity || contact.ultimaActividad,
              _lastUpdate: Date.now()
            } as Contact;

            if (update.lastMessage) {
              updatedContact.ultimoMensaje = {
                mensaje: update.lastMessage.message,
                timestamp: update.lastMessage.timestamp,
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
                  nombre: update.name || contact.nombre,
                  status: newStatus,
                  etapaDelEmbudo: newFunnelStage,
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
    });

    // Actualizar último mensaje del contacto al llegar un mensaje nuevo
    wsHook.registerMessageHandler((message) => {
      console.log('📨 [WEBSOCKET] Nuevo mensaje recibido en ChatPage:', {
        messageId: message.id,
        contactId: message.contactId,
        sender: message.sender,
        content: message.message,
        timestamp: message.timestamp
      });
      
      setAllContacts(prevContacts => {
        let contactUpdated = false;
        const updated = prevContacts.map(contact => {
          if (contact.id === message.contactId) {
            contactUpdated = true;
            console.log('🔄 [WEBSOCKET] Actualizando contacto en ChatPage:', contact.nombre);
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
        });
        
        if (contactUpdated) {
          console.log('✅ [WEBSOCKET] Contacto actualizado en ChatPage');
        }
        
        return contactUpdated ? updated : prevContacts;
      });
    });

  }, [wsHook, lineId]);

  // Handle contact update
  const handleContactUpdate = async (contactId: string, updates: Partial<Contact>) => {
    console.log('🔄 [CONTACT UPDATE] Actualizando contacto:', {
      contactId,
      updates,
      BACKEND_URL
    });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        console.log('✅ [CONTACT UPDATE] Contacto actualizado exitosamente en backend');
        setAllContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { ...contact, ...updates }
              : contact
          )
        );
      } else {
        console.error('❌ [CONTACT UPDATE] Error en backend:', response.status, response.statusText);
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
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ChatSection 
        contacts={allContacts}
        lineId={lineId}
        selectedContactFromKanban={selectedContact}
        onContactUpdate={handleContactUpdate}
      />
    </div>
  );
}

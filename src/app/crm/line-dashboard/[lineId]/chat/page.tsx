"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "../../../../../components/crm/DashboardHeader";
import NavigationTabs from "../../../../../components/crm/NavigationTabs";
import ChatSection from "../../../../../components/crm/ChatSection";
import { useCRMWebSocket } from "../../../../../hooks/useCRMWebSocket";
import { Contact } from "../../../../../types/dashboard";

export default function ChatPage() {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const params = useParams();
  const router = useRouter();
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
      setAllContacts(prevContacts => {
        let contactFound = false;
        let updatedContacts = prevContacts.map(contact => {
          if (contact.id === update.id) {
            contactFound = true;
            return {
              ...contact,
              nombre: update.name || contact.nombre,
              telefono: update.phone || contact.telefono,
              etapaDelEmbudo: update.funnel_stage || contact.etapaDelEmbudo,
              prioridad: update.priority || contact.prioridad,
              estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
              etiquetas: update.tags || contact.etiquetas,
              ultimaActividad: update.last_activity || contact.ultimaActividad,
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
                return {
                  ...contact,
                  nombre: update.name || contact.nombre,
                  etapaDelEmbudo: update.funnel_stage || contact.etapaDelEmbudo,
                  prioridad: update.priority || contact.prioridad,
                  estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : contact.estaAlHabilitado,
                  etiquetas: update.tags || contact.etiquetas,
                  ultimaActividad: update.last_activity || contact.ultimaActividad,
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
      console.log('📨 [WEBSOCKET] Nuevo mensaje recibido:', message);
    });

  }, [wsHook, lineId]);

  // Handle contact update
  const handleContactUpdate = async (contactId: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setAllContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { ...contact, ...updates }
              : contact
          )
        );
      }
    } catch (error) {
      console.error('Error updating contact:', error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        line={{
          id: lineId,
          numero: 'N/A',
          proveedor: 'META',
          estaActivo: true,
          creadoEn: new Date().toISOString(),
          idDeUsuario: '1',
          contactsCount: allContacts.length,
          activeContacts: allContacts.length,
          lastActivity: new Date().toISOString()
        }}
        totalContacts={allContacts.length}
        onBackClick={() => router.push('/crm')}
      />

      <NavigationTabs 
        currentView="chat"
  onViewChange={(view: string) => {
          if (view === 'dashboard') router.push(`/crm/line-dashboard/${lineId}`);
          else if (view === 'kanban') router.push(`/crm/line-dashboard/${lineId}/kanban`);
          else if (view === 'analytics') router.push(`/crm/line-dashboard/${lineId}/analytics`);
        }}
      />

      <div className="p-6">
        <ChatSection 
          contacts={allContacts}
          lineId={lineId}
          selectedContactFromKanban={selectedContact}
          onContactUpdate={handleContactUpdate}
        />
      </div>
    </div>
  );
}

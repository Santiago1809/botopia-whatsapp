"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "../../../../../components/crm/DashboardHeader";
import NavigationTabs from "../../../../../components/crm/NavigationTabs";
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
  const router = useRouter();
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
  }, [lineId, BACKEND_URL]);

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
        currentView="analytics"
        onViewChange={(view: any) => {
          if (view === 'dashboard') router.push(`/crm/line-dashboard/${lineId}`);
          else if (view === 'kanban') router.push(`/crm/line-dashboard/${lineId}/kanban`);
          else if (view === 'chat') router.push(`/crm/line-dashboard/${lineId}/chat`);
        }}
      />

      <div className="p-6">
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

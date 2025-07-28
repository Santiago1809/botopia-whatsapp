import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  id: string;
  contactId: string;
  lineId: string;
  message: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: string;
  type: 'text' | 'template' | 'media';
  flow?: string;
  intent?: string;
}

export interface ContactUpdate {
  id: string;
  name?: string;
  phone?: string;
  funnel_stage?: string;
  priority?: string;
  is_ai_enabled?: boolean;
  tags?: string[];
  last_activity?: string;
  lineId?: string;
  status?: string; // Agregar propiedad status
}

export interface DashboardUpdate {
  // Estructura para actualizaciones del dashboard
  contacts?: ContactUpdate[];
  stats?: {
    total: number;
    nuevos: number;
    enContacto: number;
    citasAgendadas: number;
    atencionCliente: number;
    cerrados: number;
  };
  metrics?: Record<string, number | string>;
}

export interface AnalyticsUpdate {
  // Estructura para métricas de analytics
  weeklyActivity?: Array<{
    date: string;
    day: string;
    newContacts: number;
    botResponses: number;
    humanResponses: number;
    conversions: number;
  }>;
  metrics?: Record<string, number | string>;
}

export interface UnsyncedContact {
  id: string;
  numberid: string | number;
  wa_id: string;
  number: string;
  name: string;
  lastmessagetimestamp?: number;
  lastmessagepreview?: string;
  agentehabilitado: boolean;
}

export interface SyncedContact {
  id: string;
  wa_id: string;
  name: string;
  type: 'contact' | 'group';
  agenteHabilitado: boolean;
}

interface UseCRMWebSocketProps {
  lineId?: string;
  userId?: string;
  backendUrl?: string;
}

/**
 * Hook especializado para el CRM que maneja tiempo real completo
 * Sin polling, todo via WebSockets
 */
export const useCRMWebSocket = ({ 
  lineId = 'general', 
  userId = 'agent-1', 
  backendUrl = 'http://localhost:5005' 
}: UseCRMWebSocketProps = {}) => {
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  
  // Referencias para los handlers de eventos
  const eventHandlers = useRef<{
    // Mensajes
    onNewMessage?: (message: WebSocketMessage) => void;
    onMessageSent?: (data: { success: boolean; messageId?: string; timestamp?: string }) => void;
    onMessageError?: (error: { success: boolean; error: string }) => void;
    
    // Contactos
    onContactUpdate?: (update: ContactUpdate) => void;
    onContactDeleted?: (data: { id: string }) => void;
    
    // Dashboard y Analytics
    onDashboardUpdate?: (data: DashboardUpdate) => void;
    onAnalyticsUpdate?: (data: AnalyticsUpdate) => void;
    
    // Contactos no sincronizados
    onUnsyncedContactsUpdate?: (data: { numberid: string | number; contact?: UnsyncedContact }) => void;
    onUnsyncedContactDeleted?: (data: { numberid: string | number; contactId: string }) => void;
    
    // Contactos sincronizados
    onSyncedContactUpdate?: (data: { contact: SyncedContact }) => void;
    onSyncedContactDeleted?: (data: { contactId: string }) => void;
  }>({});

  // Estado para indicadores visuales
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Inicializar conexión WebSocket
  useEffect(() => {
    // console.log('🔌 CRM WebSocket: Inicializando conexión...');
    setConnectionStatus('connecting');
    
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    // === EVENTOS DE CONEXIÓN ===
    newSocket.on('connect', () => {
      // console.log('✅ CRM WebSocket conectado:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setConnectionStatus('connected');
      
      // Autenticar con el servidor
      newSocket.emit('authenticate', { lineId, userId });
    });

    newSocket.on('authenticated', () => {
      // console.log('🔐 CRM WebSocket autenticado:', data);
    });

    newSocket.on('disconnect', (reason) => {
      // console.log('🔌 CRM WebSocket desconectado:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ CRM WebSocket error de conexión:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      setConnectionStatus('error');
    });

    // === EVENTOS DE MENSAJES ===
    newSocket.on('new-message', (message: WebSocketMessage) => {
      // console.log('📨 CRM: Nuevo mensaje recibido:', message);
      eventHandlers.current.onNewMessage?.(message);
    });

    newSocket.on('message-sent', (data: { success: boolean; messageId?: string; timestamp?: string }) => {
      // console.log('✅ CRM: Mensaje enviado confirmado:', data);
      eventHandlers.current.onMessageSent?.(data);
    });

    newSocket.on('message-error', (error: { success: boolean; error: string }) => {
      console.error('❌ CRM: Error de mensaje:', error);
      eventHandlers.current.onMessageError?.(error);
    });

    // === EVENTOS DE CONTACTOS ===
    newSocket.on('contact-updated', (update: ContactUpdate) => {
      // console.log('🔄 CRM: Contacto actualizado:', update);
      eventHandlers.current.onContactUpdate?.(update);
    });

    newSocket.on('contact-deleted', (data: { id: string }) => {
      // console.log('🗑️ CRM: Contacto eliminado:', data);
      eventHandlers.current.onContactDeleted?.(data);
    });

    // === EVENTOS DE DASHBOARD Y ANALYTICS ===
    newSocket.on('dashboard-updated', (data: DashboardUpdate) => {
      // console.log('📊 CRM: Dashboard actualizado:', data);
      eventHandlers.current.onDashboardUpdate?.(data);
    });

    newSocket.on('analytics-updated', (data: AnalyticsUpdate) => {
      // console.log('📈 CRM: Analytics actualizado:', data);
      eventHandlers.current.onAnalyticsUpdate?.(data);
    });

    // === EVENTOS DE CONTACTOS NO SINCRONIZADOS ===
    newSocket.on('unsynced-contacts-updated', (data: { numberid: string | number; contact?: UnsyncedContact }) => {
      // console.log('🔄 CRM: Contactos no sincronizados actualizados:', data);
      eventHandlers.current.onUnsyncedContactsUpdate?.(data);
    });

    newSocket.on('unsynced-contact-deleted', (data: { numberid: string | number; contactId: string }) => {
      // console.log('🗑️ CRM: Contacto no sincronizado eliminado:', data);
      eventHandlers.current.onUnsyncedContactDeleted?.(data);
    });

    // === EVENTOS DE CONTACTOS SINCRONIZADOS ===
    newSocket.on('synced-contact-updated', (data: { contact: SyncedContact }) => {
      // console.log('🔄 CRM: Contacto sincronizado actualizado:', data);
      eventHandlers.current.onSyncedContactUpdate?.(data);
    });

    newSocket.on('synced-contact-deleted', (data: { contactId: string }) => {
      // console.log('🗑️ CRM: Contacto sincronizado eliminado:', data);
      eventHandlers.current.onSyncedContactDeleted?.(data);
    });

    setSocket(newSocket);

    // Cleanup al desmontar
    return () => {
      // console.log('🧹 CRM WebSocket: Limpiando conexión...');
      newSocket.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [lineId, userId, backendUrl]);

  // === MÉTODOS DE SUSCRIPCIÓN ===
  const subscribeToContact = useCallback((contactId: string) => {
    if (socket && isConnected) {
      // console.log('📱 CRM: Suscribiéndose a contacto:', contactId);
      socket.emit('subscribe-contact', { contactId, lineId });
      setCurrentContactId(contactId);
    } else {
      console.warn('⚠️ CRM: No se puede suscribir a contacto: socket no conectado');
    }
  }, [socket, isConnected, lineId]);

  const unsubscribeFromContact = useCallback((contactId: string) => {
    if (socket && isConnected) {
      // console.log('📱 CRM: Desuscribiéndose de contacto:', contactId);
      socket.emit('unsubscribe-contact', { contactId, lineId });
      setCurrentContactId(null);
    }
  }, [socket, isConnected, lineId]);

  // === MÉTODOS DE ENVÍO ===
  const sendMessage = useCallback((data: {
    contactId: string;
    message: string;
    sender: 'agent' | 'bot';
    type?: 'text' | 'template';
    flow?: string;
    intent?: string;
  }) => {
    if (socket && isConnected) {
      // console.log('📤 CRM: Enviando mensaje:', data);
      socket.emit('send-message', {
        ...data,
        lineId
      });
    } else {
      console.error('❌ CRM: No se puede enviar mensaje: socket no conectado');
      eventHandlers.current.onMessageError?.({
        success: false,
        error: 'WebSocket no conectado'
      });
    }
  }, [socket, isConnected, lineId]);

  // === MÉTODOS DE REGISTRO DE HANDLERS ===
  
  // Mensajes
  const registerMessageHandler = useCallback((handler: (message: WebSocketMessage) => void) => {
    eventHandlers.current.onNewMessage = handler;
  }, []);

  const registerMessageSentHandler = useCallback((handler: (data: { success: boolean; messageId?: string; timestamp?: string }) => void) => {
    eventHandlers.current.onMessageSent = handler;
  }, []);

  const registerMessageErrorHandler = useCallback((handler: (error: { success: boolean; error: string }) => void) => {
    eventHandlers.current.onMessageError = handler;
  }, []);

  // Contactos
  const registerContactUpdateHandler = useCallback((handler: (update: ContactUpdate) => void) => {
    eventHandlers.current.onContactUpdate = handler;
  }, []);

  const registerContactDeletedHandler = useCallback((handler: (data: { id: string }) => void) => {
    eventHandlers.current.onContactDeleted = handler;
  }, []);

  // Dashboard y Analytics
  const registerDashboardUpdateHandler = useCallback((handler: (data: DashboardUpdate) => void) => {
    eventHandlers.current.onDashboardUpdate = handler;
  }, []);

  const registerAnalyticsUpdateHandler = useCallback((handler: (data: AnalyticsUpdate) => void) => {
    eventHandlers.current.onAnalyticsUpdate = handler;
  }, []);

  // Contactos no sincronizados
  const registerUnsyncedContactsUpdateHandler = useCallback((handler: (data: { numberid: string | number; contact?: UnsyncedContact }) => void) => {
    eventHandlers.current.onUnsyncedContactsUpdate = handler;
  }, []);

  const registerUnsyncedContactDeletedHandler = useCallback((handler: (data: { numberid: string | number; contactId: string }) => void) => {
    eventHandlers.current.onUnsyncedContactDeleted = handler;
  }, []);

  // Contactos sincronizados
  const registerSyncedContactUpdateHandler = useCallback((handler: (data: { contact: SyncedContact }) => void) => {
    eventHandlers.current.onSyncedContactUpdate = handler;
  }, []);

  const registerSyncedContactDeletedHandler = useCallback((handler: (data: { contactId: string }) => void) => {
    eventHandlers.current.onSyncedContactDeleted = handler;
  }, []);

  // === UTILIDADES ===
  const getConnectionInfo = useCallback(() => {
    return {
      isConnected,
      socketId: socket?.id,
      connectionError,
      connectionStatus,
      currentContactId,
      lineId,
      userId
    };
  }, [isConnected, socket?.id, connectionError, connectionStatus, currentContactId, lineId, userId]);

  // Forzar reconexión
  const reconnect = useCallback(() => {
    if (socket) {
      // console.log('🔄 CRM: Forzando reconexión...');
      socket.disconnect();
      socket.connect();
    }
  }, [socket]);

  // Verificar salud de la conexión
  const isHealthy = useCallback(() => {
    return isConnected && connectionStatus === 'connected' && !connectionError;
  }, [isConnected, connectionStatus, connectionError]);

  return {
    // Estado de conexión
    socket,
    isConnected,
    connectionError,
    connectionStatus,
    currentContactId,
    
    // Métodos de suscripción
    subscribeToContact,
    unsubscribeFromContact,
    
    // Métodos de envío
    sendMessage,
    
    // Registro de handlers - Mensajes
    registerMessageHandler,
    registerMessageSentHandler,
    registerMessageErrorHandler,
    
    // Registro de handlers - Contactos
    registerContactUpdateHandler,
    registerContactDeletedHandler,
    
    // Registro de handlers - Dashboard y Analytics
    registerDashboardUpdateHandler,
    registerAnalyticsUpdateHandler,
    
    // Registro de handlers - Contactos no sincronizados
    registerUnsyncedContactsUpdateHandler,
    registerUnsyncedContactDeletedHandler,
    
    // Registro de handlers - Contactos sincronizados
    registerSyncedContactUpdateHandler,
    registerSyncedContactDeletedHandler,
    
    // Utilidades
    getConnectionInfo,
    reconnect,
    isHealthy
  };
};

export default useCRMWebSocket;

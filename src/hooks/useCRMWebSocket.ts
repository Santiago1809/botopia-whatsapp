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
  // Agregar propiedades para último mensaje
  lastMessage?: {
    message: string;
    timestamp: string;
    sender: 'user' | 'agent' | 'bot';
    remitente?: string; // Para compatibilidad con el formato del contacto
  };
  contactId?: string; // Para el evento de mensaje
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
 * Solo WebSockets, sin polling
 */
export const useCRMWebSocket = ({ 
  lineId = 'general', 
  userId = 'agent-1', 
  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005'
}: UseCRMWebSocketProps = {}) => {
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  
  // Referencias para mantener la conexión viva
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  
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
    
    // Estado guardado para reconexión
    savedContactId?: string;
  }>({});

  // Estado para indicadores visuales
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Inicializar conexión WebSocket
  useEffect(() => {
    console.log('🔌 [PRODUCCIÓN] CRM WebSocket: Inicializando conexión SOLO WEBSOCKET...', { 
      lineId, 
      backendUrl,
      env: process.env.NODE_ENV,
      envVar: process.env.NEXT_PUBLIC_BACKEND_URL2,
      isLocalhost: backendUrl.includes('localhost'),
      isHttps: backendUrl.startsWith('https'),
      finalUrl: backendUrl
    });
    setConnectionStatus('connecting');
    
    const newSocket = io(backendUrl, {
      transports: ['websocket'], // SOLO WEBSOCKET
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      withCredentials: false
    });

    // === EVENTOS DE CONEXIÓN ===
    newSocket.on('connect', () => {
      console.log('✅ CRM WebSocket conectado:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0; // Reset intentos de reconexión
      
      // Autenticar con el servidor
      console.log('🔐 [PRODUCCIÓN] Autenticando con lineId:', lineId, 'userId:', userId);
      newSocket.emit('authenticate', { lineId, userId });
      
      // ✅ El authenticate ya suscribe automáticamente al room
      console.log('📡 [PRODUCCIÓN] La autenticación suscribirá automáticamente a line-' + lineId);
      
      // Iniciar heartbeat para mantener la conexión viva
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      heartbeatInterval.current = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 25000); // Ping cada 25 segundos
    });

    newSocket.on('authenticated', (data) => {
      console.log('🔐 CRM WebSocket autenticado:', data);
      
      // ✅ El backend ya suscribe automáticamente al room line-{lineId} en authenticate
      console.log('📡 [PRODUCCIÓN] Cliente ya suscrito automáticamente a line-' + lineId);
      
      // Re-suscribirse al contacto actual si existe
      const contactToSubscribe = currentContactId || eventHandlers.current.savedContactId;
      if (contactToSubscribe) {
        console.log('🔄 Re-suscribiendo a contacto después de autenticación:', contactToSubscribe);
        newSocket.emit('subscribe-contact', { contactId: contactToSubscribe, lineId });
        setCurrentContactId(contactToSubscribe);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 CRM WebSocket desconectado:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Limpiar heartbeat
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      if (reason === 'io server disconnect') {
        console.log('🔄 Servidor desconectó, reconectando...');
        setTimeout(() => newSocket.connect(), 1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      reconnectAttempts.current++;
      console.error(`❌ CRM WebSocket error de conexión (intento ${reconnectAttempts.current}):`, error.message);
      setConnectionError(error.message);
      setIsConnected(false);
      setConnectionStatus('error');
      
      // Reintentar con backoff exponencial
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      console.log(`🔄 Reintentando en ${delay/1000} segundos...`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 CRM WebSocket reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      // Re-autenticar después de reconectar
      newSocket.emit('authenticate', { lineId, userId });
    });
    
    // Manejar pong del servidor
    newSocket.on('pong', () => {
      // El servidor respondió al ping, la conexión está viva
    });

    // === EVENTOS DE MENSAJES ===
    newSocket.on('new-message', (message: WebSocketMessage) => {
      console.log('📨 [PRODUCCIÓN] CRM: Nuevo mensaje recibido:', {
        message,
        backendUrl,
        lineId,
        messageLineId: message.lineId,
        handlerExists: !!eventHandlers.current.onNewMessage,
        handlerFunction: eventHandlers.current.onNewMessage ? 'REGISTERED' : 'NOT_REGISTERED'
      });
      
      if (eventHandlers.current.onNewMessage) {
        console.log('🔗 [PRODUCCIÓN] CRM: Ejecutando handler de mensaje...');
        eventHandlers.current.onNewMessage(message);
      } else {
        console.warn('⚠️ [PRODUCCIÓN] CRM: Handler onNewMessage no está registrado');
      }
    });

    newSocket.on('message-sent', (data: { success: boolean; messageId?: string; timestamp?: string }) => {
      console.log('✅ CRM: Mensaje enviado confirmado:', data);
      eventHandlers.current.onMessageSent?.(data);
    });

    newSocket.on('message-error', (error: { success: boolean; error: string }) => {
      console.error('❌ CRM: Error de mensaje:', error);
      eventHandlers.current.onMessageError?.(error);
    });

    // === EVENTOS DE CONTACTOS ===
    newSocket.on('contact-updated', (update: ContactUpdate) => {
      console.log('🔄 [PRODUCCIÓN] CRM: Contacto actualizado recibido via WebSocket:', {
        id: update.id,
        lineId: update.lineId,
        currentLineId: lineId,
        backendUrl,
        funnel_stage: update.funnel_stage,
        last_activity: update.last_activity,
        handlerRegistrado: !!eventHandlers.current.onContactUpdate
      });
      
      if (eventHandlers.current.onContactUpdate) {
        console.log('✅ [PRODUCCIÓN] CRM: Ejecutando handler de contacto actualizado');
        eventHandlers.current.onContactUpdate(update);
      } else {
        console.warn('⚠️ [PRODUCCIÓN] CRM: Handler onContactUpdate no está registrado');
      }
    });

    newSocket.on('contact-deleted', (data: { id: string }) => {
      console.log('🗑️ CRM: Contacto eliminado:', data);
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

    // 🔥 ESCUCHAR TODOS LOS EVENTOS PARA DEBUG EN PRODUCCIÓN
    newSocket.onAny((eventName, ...args) => {
      console.log(`🌍 [PRODUCCIÓN] Evento WebSocket recibido: ${eventName}`, {
        eventName,
        args,
        backendUrl,
        lineId,
        socketId: newSocket.id
      });
    });

    // 🔥 EVENTOS ADICIONALES PARA FORZAR RECEPCIÓN
    newSocket.on('connect_error', (error) => {
      console.error('❌ [PRODUCCIÓN] Error de conexión WebSocket:', {
        error: error.message,
        backendUrl,
        lineId
      });
    });

    newSocket.on('reconnect', () => {
      console.log('🔄 [PRODUCCIÓN] WebSocket reconectado, forzando autenticación');
      newSocket.emit('authenticate', { lineId, userId });
    });

    setSocket(newSocket);

    // Cleanup al desmontar
    return () => {
      console.log('🧹 CRM WebSocket: Limpiando conexión...');
      
      // Limpiar heartbeat
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      // Desconectar socket
      newSocket.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [lineId, userId, backendUrl]);

  // === MÉTODOS DE SUSCRIPCIÓN ===
  const subscribeToContact = useCallback((contactId: string) => {
    // Siempre guardar el contacto actual
    setCurrentContactId(contactId);
    eventHandlers.current.savedContactId = contactId;
    
    if (socket && isConnected) {
      console.log('📱 CRM: Suscribiéndose a contacto:', contactId);
      socket.emit('subscribe-contact', { contactId, lineId });
    } else {
      console.warn('⚠️ CRM: No se puede suscribir a contacto ahora, se suscribirá cuando se reconecte:', contactId);
    }
  }, [socket, isConnected, lineId]);

  const unsubscribeFromContact = useCallback((contactId: string) => {
    if (socket && isConnected) {
      console.log('📱 CRM: Desuscribiéndose de contacto:', contactId);
      socket.emit('unsubscribe-contact', { contactId, lineId });
    }
    setCurrentContactId(null);
    eventHandlers.current.savedContactId = undefined;
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
    console.log('🔗 [DEBUG] CRM: Registrando handler para new-message');
    eventHandlers.current.onNewMessage = handler;
    console.log('✅ [DEBUG] CRM: Handler onNewMessage registrado:', !!eventHandlers.current.onNewMessage);
  }, []);

  const registerMessageSentHandler = useCallback((handler: (data: { success: boolean; messageId?: string; timestamp?: string }) => void) => {
    eventHandlers.current.onMessageSent = handler;
  }, []);

  const registerMessageErrorHandler = useCallback((handler: (error: { success: boolean; error: string }) => void) => {
    eventHandlers.current.onMessageError = handler;
  }, []);

  // Contactos
  const registerContactUpdateHandler = useCallback((handler: (update: ContactUpdate) => void) => {
    console.log('🔗 [DEBUG] CRM: Registrando handler para contact-updated');
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

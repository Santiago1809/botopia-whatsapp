import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  id: string;
  contactId: string;
  lineId: string;
  message: string;
  sender: 'user' | 'bot' | 'agent';
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
  enabled?: boolean; // Nuevo: permitir deshabilitar la conexión
}

/**
 * Hook especializado para el CRM que maneja tiempo real completo
 * Solo WebSockets, sin polling
 */
export const useCRMWebSocket = ({ 
  lineId = 'general', 
  userId = 'agent-1', 
  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005',
  enabled = true
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
    authenticated?: boolean;
  }>({});

  // Estado para indicadores visuales
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Inicializar conexión WebSocket (solo una vez por lineId, userId, backendUrl)
  useEffect(() => {
    if (!enabled) {
      // Modo deshabilitado: no crear conexión
      return;
    }
    console.log('🔌 [PRODUCCIÓN] CRM WebSocket: Inicializando conexión SOLO WEBSOCKET...', { 
      lineId, 
      backendUrl: backendUrl,
      env: process.env.NODE_ENV,
      envVar: process.env.NEXT_PUBLIC_BACKEND_URL2,
      isLocalhost: backendUrl.includes('localhost'),
      isHttps: backendUrl.startsWith('https'),
      finalUrl: backendUrl
    });
    
    // 🔥 DEBUG: Agregar logs detallados para producción
    console.log('🔍 [DEBUG] Variables de entorno:', {
      NEXT_PUBLIC_BACKEND_URL2: process.env.NEXT_PUBLIC_BACKEND_URL2,
      NODE_ENV: process.env.NODE_ENV,
      calculatedBackendUrl: backendUrl
    });
    setConnectionStatus('connecting');
    
    // Detectar si estamos en producción para ajustar configuración
    const isProduction = backendUrl.includes('railway.app') || backendUrl.includes('vercel.app') || !backendUrl.includes('localhost');
    
    const newSocket = io(backendUrl, {
      // SOLO WebSocket - nada de polling
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: isProduction ? 15 : 10, // Más intentos en producción
      reconnectionDelay: isProduction ? 2000 : 1000, // Delay más largo en producción
      reconnectionDelayMax: isProduction ? 10000 : 5000, // Delay máximo más largo en producción
      timeout: isProduction ? 30000 : 20000, // Timeout más largo en producción
      forceNew: false,
      withCredentials: true, // Habilitar credenciales para CORS
      // Opciones adicionales para mejorar estabilidad en producción
      upgrade: false, // No upgrade, solo websocket desde el inicio
      rememberUpgrade: false, // No recordar upgrade
      // Configuraciones adicionales para producción
      ...(isProduction && {
        pingTimeout: 60000, // 1 minuto de timeout para ping en producción
        pingInterval: 25000, // Ping cada 25 segundos en producción
      })
    });

    // === EVENTOS DE CONEXIÓN ===
    newSocket.on('connect', () => {
      console.log('✅ [PRODUCCIÓN] CRM WebSocket conectado:', {
        socketId: newSocket.id,
        backendUrl,
        lineId,
        isProduction,
        transport: newSocket.io.engine.transport.name,
        userAgent: navigator.userAgent
      });
      setIsConnected(true);
      setConnectionError(null);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0; // Reset intentos de reconexión
      
      // Autenticar con el servidor - agregar retry en producción
      const authenticate = () => {
        console.log('🔐 [PRODUCCIÓN] Autenticando con lineId:', lineId, 'userId:', userId);
        newSocket.emit('authenticate', { lineId, userId });
      };
      
      authenticate();
      
      // En producción, verificar autenticación después de 3 segundos
      if (isProduction) {
        setTimeout(() => {
          if (newSocket.connected && !eventHandlers.current.authenticated) {
            console.log('⚠️ [PRODUCCIÓN] Re-intentando autenticación...');
            authenticate();
          }
        }, 3000);
      }
      
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
      }, 45000); // Ping cada 45 segundos para ser menos agresivo
    });

    newSocket.on('authenticated', (data) => {
      console.log('🔐 [PRODUCCIÓN] CRM WebSocket autenticado:', data);
      eventHandlers.current.authenticated = true; // Marcar como autenticado
      
      // ✅ El backend ya suscribe automáticamente al room line-{lineId} en authenticate
      console.log('📡 [PRODUCCIÓN] Cliente ya suscrito automáticamente a line-' + lineId);
      
      // Re-suscribirse al contacto actual si existe (usar solo savedContactId para evitar dependencias)
      const contactToSubscribe = eventHandlers.current.savedContactId;
      if (contactToSubscribe) {
        console.log('🔄 Re-suscribiendo a contacto después de autenticación:', contactToSubscribe);
        newSocket.emit('subscribe-contact', { contactId: contactToSubscribe, lineId });
        setCurrentContactId(contactToSubscribe);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 [PRODUCCIÓN] CRM WebSocket desconectado:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      eventHandlers.current.authenticated = false; // Resetear estado de autenticación
      
      // Limpiar heartbeat
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      
      // Solo reconectar manualmente si el servidor nos desconectó
      if (reason === 'io server disconnect') {
        console.log('🔄 Servidor desconectó, reconectando en 3 segundos...');
        setTimeout(() => {
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 3000);
      }
      // Para otros casos, socket.io-client manejará la reconexión automáticamente
    });

    newSocket.on('connect_error', (error) => {
      reconnectAttempts.current++;
      console.error(`❌ [PRODUCCIÓN] CRM WebSocket error de conexión (intento ${reconnectAttempts.current}):`, {
        error: error.message,
        backendUrl,
        lineId,
        isProduction,
        transport: newSocket.io?.engine?.transport?.name,
        userAgent: navigator.userAgent
      });
      setConnectionError(error.message);
      setIsConnected(false);
      setConnectionStatus('error');
      eventHandlers.current.authenticated = false; // Resetear autenticación en error
      
      // En producción, intentar más agresivamente
      if (isProduction && reconnectAttempts.current >= 10) {
        console.log('🔄 [PRODUCCIÓN] Demasiados intentos, pausando por 15 segundos...');
        setTimeout(() => {
          reconnectAttempts.current = 0; // Reset después del delay
        }, 15000);
      } else if (!isProduction && reconnectAttempts.current >= 5) {
        console.log('🔄 [LOCAL] Demasiados intentos, pausando por 30 segundos...');
        setTimeout(() => {
          reconnectAttempts.current = 0; // Reset después del delay largo
        }, 30000);
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 [PRODUCCIÓN] CRM WebSocket reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      eventHandlers.current.authenticated = false; // Resetear autenticación
      
      // Re-autenticar después de reconectar
      console.log('🔐 [PRODUCCIÓN] Re-autenticando después de reconexión...');
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
        backendUrl: backendUrl,
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
        lastMessage: update.lastMessage,
        handlerRegistrado: !!eventHandlers.current.onContactUpdate,
        isConnected: newSocket.connected,
        isAuthenticated: eventHandlers.current.authenticated,
        socketId: newSocket.id,
        transport: newSocket.io?.engine?.transport?.name
      });
      
      // Verificar que estamos autenticados antes de procesar
      if (!eventHandlers.current.authenticated) {
        console.warn('⚠️ [PRODUCCIÓN] CRM: Recibido contact-updated pero no autenticado, ignorando...');
        return;
      }
      
      // Verificar que el lineId coincide
      if (update.lineId && update.lineId !== lineId) {
        console.warn('⚠️ [PRODUCCIÓN] CRM: contact-updated de lineId diferente, ignorando:', {
          updateLineId: update.lineId,
          currentLineId: lineId
        });
        return;
      }
      
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
  }, [lineId, userId, backendUrl, enabled]); // Dependencias necesarias

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

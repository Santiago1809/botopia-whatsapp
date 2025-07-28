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
  contactId: string;
  lastMessage: {
    message: string;
    timestamp: string;
    sender: string;
  };
}

interface UseWebSocketProps {
  lineId: string;
  userId?: string;
  backendUrl?: string;
}

export const useWebSocket = ({ lineId, userId, backendUrl = 'http://localhost:5005' }: UseWebSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  
  const messageHandlers = useRef<{
    onNewMessage?: (message: WebSocketMessage) => void;
    onContactUpdate?: (update: ContactUpdate) => void;
    onMessageSent?: (data: { success: boolean; messageId?: string; timestamp?: string }) => void;
    onMessageError?: (error: { success: boolean; error: string }) => void;
  }>({});

  // Inicializar conexión WebSocket
  useEffect(() => {
    console.log('🔌 Inicializando conexión WebSocket...');
    
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Manejar conexión exitosa
    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Autenticar con el servidor
      newSocket.emit('authenticate', { lineId, userId });
    });

    // Manejar autenticación exitosa
    newSocket.on('authenticated', (data: { success: boolean; clientId: string; lineId: string }) => {
      console.log('🔐 WebSocket autenticado:', data);
    });

    // Manejar nuevos mensajes
    newSocket.on('new-message', (message: WebSocketMessage) => {
      console.log('📨 Nuevo mensaje recibido via WebSocket:', message);
      messageHandlers.current.onNewMessage?.(message);
    });

    // Manejar actualizaciones de contacto
    newSocket.on('contact-updated', (update: ContactUpdate) => {
      console.log('🔄 Contacto actualizado via WebSocket:', update);
      messageHandlers.current.onContactUpdate?.(update);
    });

    // Manejar confirmación de mensaje enviado
    newSocket.on('message-sent', (data: { success: boolean; messageId?: string; timestamp?: string }) => {
      console.log('✅ Mensaje enviado confirmado via WebSocket:', data);
      messageHandlers.current.onMessageSent?.(data);
    });

    // Manejar errores de mensaje
    newSocket.on('message-error', (error: { success: boolean; error: string }) => {
      console.error('❌ Error de mensaje via WebSocket:', error);
      messageHandlers.current.onMessageError?.(error);
    });

    // Manejar desconexión
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó el cliente, intentar reconectar
        newSocket.connect();
      }
    });

    // Manejar errores de conexión
    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup al desmontar
    return () => {
      console.log('🧹 Limpiando conexión WebSocket...');
      newSocket.disconnect();
    };
  }, [lineId, userId, backendUrl]);

  // Suscribirse a un contacto específico
  const subscribeToContact = useCallback((contactId: string) => {
    if (socket && isConnected) {
      console.log('📱 Suscribiéndose a contacto:', contactId);
      socket.emit('subscribe-contact', { contactId, lineId });
      setCurrentContactId(contactId);
    } else {
      console.warn('⚠️ No se puede suscribir a contacto: socket no conectado');
    }
  }, [socket, isConnected, lineId]);

  // Desuscribirse de un contacto
  const unsubscribeFromContact = useCallback((contactId: string) => {
    if (socket && isConnected) {
      console.log('📱 Desuscribiéndose de contacto:', contactId);
      socket.emit('unsubscribe-contact', { contactId, lineId });
      setCurrentContactId(null);
    }
  }, [socket, isConnected, lineId]);

  // Enviar mensaje via WebSocket
  const sendMessage = useCallback((data: {
    contactId: string;
    message: string;
    sender: 'agent' | 'bot';
    type?: 'text' | 'template';
    flow?: string;
    intent?: string;
  }) => {
    if (socket && isConnected) {
      console.log('📤 Enviando mensaje via WebSocket:', data);
      socket.emit('send-message', {
        ...data,
        lineId
      });
    } else {
      console.error('❌ No se puede enviar mensaje: socket no conectado');
      messageHandlers.current.onMessageError?.({
        success: false,
        error: 'WebSocket no conectado'
      });
    }
  }, [socket, isConnected, lineId]);

  // Registrar handlers de eventos
  const registerMessageHandler = useCallback((handler: (message: WebSocketMessage) => void) => {
    messageHandlers.current.onNewMessage = handler;
  }, []);

  const registerContactUpdateHandler = useCallback((handler: (update: ContactUpdate) => void) => {
    messageHandlers.current.onContactUpdate = handler;
  }, []);

  const registerMessageSentHandler = useCallback((handler: (data: { success: boolean; messageId?: string; timestamp?: string }) => void) => {
    messageHandlers.current.onMessageSent = handler;
  }, []);

  const registerMessageErrorHandler = useCallback((handler: (error: { success: boolean; error: string }) => void) => {
    messageHandlers.current.onMessageError = handler;
  }, []);

  // Obtener estadísticas de conexión
  const getConnectionInfo = useCallback(() => {
    return {
      isConnected,
      socketId: socket?.id,
      connectionError,
      currentContactId,
      lineId
    };
  }, [isConnected, socket?.id, connectionError, currentContactId, lineId]);

  return {
    socket,
    isConnected,
    connectionError,
    subscribeToContact,
    unsubscribeFromContact,
    sendMessage,
    registerMessageHandler,
    registerContactUpdateHandler,
    registerMessageSentHandler,
    registerMessageErrorHandler,
    getConnectionInfo
  };
};

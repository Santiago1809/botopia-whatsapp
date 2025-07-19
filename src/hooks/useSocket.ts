import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const isInitialized = useRef(false);

  // Función para conectar al socket
  const connect = () => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    const newSocket = io(BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket conectado:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket desconectado:", reason);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconectado después de", attemptNumber, "intentos");
      setIsConnected(true);
    });

    socketRef.current = newSocket;
    return newSocket;
  };

  // Función para desconectar el socket
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  // Función para emitir eventos
  const emit = (event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(
        `Intentando emitir evento ${event} pero el socket no está conectado`
      );
    }
  };

  // Función para escuchar eventos
  const on = (event: string, callback: (...args: unknown[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Función para dejar de escuchar eventos
  const off = (event: string, callback?: (...args: unknown[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  // Función para unirse a una sala
  const joinRoom = (roomId: string) => {
    emit("join-room", roomId);
  };

  // Función para salir de una sala
  const leaveRoom = (roomId: string) => {
    emit("leave-room", roomId);
  };

  // Función para obtener historial de chat
  const getChatHistory = (numberId: number, to: string) => {
    emit("get-chat-history", { numberId, to });
  };

  // Inicializar el socket una sola vez
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      connect();
    }

    // Cleanup al desmontar el componente
    return () => {
      if (isInitialized.current) {
        disconnect();
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    getChatHistory,
  };
};

export default useSocket;

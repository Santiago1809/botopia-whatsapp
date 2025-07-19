import React, { createContext, useContext, ReactNode } from "react";
import { useSocket } from "../hooks/useSocket";
import { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  getChatHistory: (numberId: number, to: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketMethods = useSocket();

  return (
    <SocketContext.Provider value={socketMethods}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(
      "useSocketContext debe ser usado dentro de un SocketProvider"
    );
  }
  return context;
};

export default SocketProvider;

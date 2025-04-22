"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Definición de los estados posibles
type ConnectionStatus = "connected" | "disconnected" | "connecting";

// Tipo para almacenar el estado de los números
interface ChatNumbers {
  [number: string]: ConnectionStatus;
}

// Contexto del chat
interface ChatContextType {
  numbers: ChatNumbers;
  setNumberStatus: (number: string, status: ConnectionStatus) => void;
}

// Creación del contexto
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Proveedor del contexto del chat
export function ChatProvider({ children }: { children: ReactNode }) {
  const [numbers, setNumbers] = useState<ChatNumbers>({});

  // Función para establecer el estado de un número
  const setNumberStatus = (number: string, status: ConnectionStatus) => {
    setNumbers((prevState) => {
      const newState = {
        ...prevState,
        [number]: status,
      };

      // Guardar en localStorage
      localStorage.setItem("chat-status", JSON.stringify(newState));

      return newState;
    });
  };

  // Efecto para cargar el estado almacenado cuando se inicia
  useEffect(() => {
    const storedChatStatus = localStorage.getItem("chat-status");

    if (storedChatStatus) {
      try {
        const parsedChatStatus = JSON.parse(storedChatStatus);
        setNumbers(parsedChatStatus);
      } catch (error) {
        console.error("Error al cargar el estado del chat:", error);
        // Si hay error, inicializamos con un objeto vacío
        setNumbers({});
      }
    }
  }, []);

  return (
    <ChatContext.Provider value={{ numbers, setNumberStatus }}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook para usar el contexto del chat
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat debe ser utilizado dentro de un ChatProvider");
  }
  return context;
}

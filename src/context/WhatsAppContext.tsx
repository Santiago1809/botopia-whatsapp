"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface WhatsAppAccount {
  id: string;
  name: string;
  number: string;
  status: string;
}

interface WhatsAppContextType {
  accounts: WhatsAppAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<WhatsAppAccount[]>>;
  selectedAccount: WhatsAppAccount | null;
  setSelectedAccount: React.Dispatch<
    React.SetStateAction<WhatsAppAccount | null>
  >;
  socket: Socket | null;
  fetchAccounts: () => Promise<void>;
  connectAccount: (numberId: string) => Promise<void>;
  connectionStatus: { [key: string]: string };
  updateConnectionStatus: (accountId: string, status: string) => void;
  qrCodes: { [key: string]: string | null };
  setQrCode: (numberId: string, qr: string | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | null>(null);

export function WhatsAppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<WhatsAppAccount | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    [key: string]: string;
  }>({});
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string | null }>({});

  const updateConnectionStatus = (accountId: string, status: string) => {
    setConnectionStatus((prev) => ({
      ...prev,
      [accountId]: status,
    }));
  };

  const setQrCode = (numberId: string, qr: string | null) => {
    setQrCodes((prev) => ({
      ...prev,
      [numberId]: qr,
    }));
  };

  useEffect(() => {
    const newSocket = io(BACKEND_URL, { transports: ["websocket"] });

    newSocket.on("qr-code", (data: { numberId: number; qr: string }) => {
      setQrCode(String(data.numberId), data.qr);
      updateConnectionStatus(String(data.numberId), "connecting");
    });

    newSocket.on("whatsapp-ready", (data: { numberId: string | number }) => {
      setQrCode(String(data.numberId), null);
      updateConnectionStatus(String(data.numberId), "connected");
    });

    newSocket.on(
      "whatsapp-disconnected",
      (data: { numberId: string | number }) => {
        updateConnectionStatus(String(data.numberId), "disconnected");
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/get-numbers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error fetching accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching WhatsApp accounts:", error);
    }
  };

  const connectAccount = async (numberId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/start-whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ numberId }),
    });

    if (!response.ok) {
      throw new Error("Failed to connect account");
    }

    socket?.emit("join-room", numberId);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <WhatsAppContext.Provider
      value={{
        accounts,
        setAccounts,
        selectedAccount,
        setSelectedAccount,
        socket,
        fetchAccounts,
        connectAccount,
        connectionStatus,
        updateConnectionStatus,
        qrCodes,
        setQrCode,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
}

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  }
  return context;
};

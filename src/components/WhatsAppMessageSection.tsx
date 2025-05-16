/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chatState";
import { WhatsappNumber } from "@/types/gobal";
import { Lock, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import WhatsAppChatBubble from "./WhatsAppMessageBubble";
import QRDisplay from "./WhatsAppQrDisplay";
import React from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Define interfaces for our types
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Model {
  id: string;
  name: string;
  description: string;
  tokenLimit: string;
}

interface QRCodes {
  [key: string]: string | null;
}

interface ChatHistory {
  chatHistory: Message[];
  to: string;
  numberId: string;
}

interface Contact {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Props {
  selectedNumber: WhatsappNumber | null;
  qrCodes: QRCodes;
  selectedChat?: Contact | Group | null;
}

export default function WhatsAppMessageSection({
  selectedNumber,
  qrCodes,
  selectedChat,
}: Props) {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [numberId, setNumberId] = useState<string | null>(null);
  const [sendTo, setSendTo] = useState<string>("");
  const { numbers } = useChat();
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const newSocket = io(BACKEND_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    setMessages([]); // Reset messages when socket is created
  }, [selectedNumber]);

  useEffect(() => {
    if (!socket || !selectedNumber) return;

    socket.emit("join-room", String(selectedNumber.id));

    // Si hay un chat seleccionado, pedir su historial
    if (selectedChat && selectedChat.id) {
      console.log('[FRONTEND] Emit get-chat-history', selectedNumber?.id, selectedChat.id);
      socket.emit("get-chat-history", {
        numberId: selectedNumber.id,
        to: selectedChat.id,
      });
    }

    socket.on("chat-history", (data: ChatHistory) => {
      setMessages(data.chatHistory);
      setSendTo(data.to);
    });
    return () => {
      if (selectedNumber) {
        socket.emit("leave-room", String(selectedNumber.id));
      }
      socket.off("chat-history");
    };
  }, [socket, selectedNumber, selectedChat]);

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;

    const handleScroll = () => {
      if (container) {
        const isUserAtBottom =
          container.scrollHeight - container.scrollTop <=
          container.clientHeight + 50;
        setIsAtBottom(isUserAtBottom);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          content: message,
          to: selectedChat?.id || sendTo,
          numberId: selectedNumber?.id,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.message || 'Error al enviar el mensaje');
        return;
      }

      // Add the message to the local state
      const newMessage = {
        role: 'user' as const,
        content: message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Área principal */}
      <div className="flex-1 p-2 sm:p-6 overflow-y-auto flex items-center justify-center">
        {selectedNumber && numbers[selectedNumber.id] !== "connected" ? (
          <div className="bg-white rounded-xl p-4 sm:p-8 w-full max-w-3xl shadow-sm border">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="flex-1 space-y-4 sm:space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-medium mb-2">
                    Conecta tu número
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Escanea el código QR con tu teléfono para conectar tu número
                    y empezar a usar el servicio.
                  </p>
                </div>

                <ol className="space-y-3 sm:space-y-4 list-decimal list-inside text-sm sm:text-base text-gray-700">
                  <li>Abre la aplicación de WhatsApp en tu teléfono</li>
                  <li>Ve a la sección de configuración</li>
                  <li>Selecciona la opción &quot;Escanear código QR&quot;</li>
                  <li>
                    Apunta la cámara hacia el código mostrado a la derecha
                  </li>
                </ol>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="bg-white p-2 border rounded-lg shadow-sm">
                  {selectedNumber && qrCodes && qrCodes[selectedNumber.id] ? (
                    <QRDisplay
                      qrCode={qrCodes[selectedNumber.id]}
                      number={selectedNumber.number}
                    />
                  ) : (
                    <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] flex items-center justify-center bg-gray-100">
                      <p className="text-sm text-gray-500">
                        Generando código...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Cuando ya está conectado, mostrar los mensajes en orden cronológico inverso
          <>
            <div className="flex flex-col items-center w-full">
              {messages.length === 0 ? (
                <div className="text-gray-400 text-base mt-10">No hay mensajes en este chat aún.</div>
              ) : (
                (() => {
                  // Ordena por timestamp y agrupa en pares [user, assistant]
                  const sorted = [...messages].sort((a, b) => {
                    if (a.timestamp === b.timestamp) {
                      if (a.role === "user" && b.role === "assistant") return -1;
                      if (a.role === "assistant" && b.role === "user") return 1;
                      return 0;
                    }
                    return a.timestamp - b.timestamp;
                  });
                  const grouped = [];
                  for (let i = 0; i < sorted.length; i++) {
                    if (sorted[i].role === "user") {
                      grouped.push([
                        sorted[i],
                        sorted[i + 1]?.role === "assistant" ? sorted[i + 1] : null
                      ]);
                      if (sorted[i + 1]?.role === "assistant") i++;
                    }
                  }
                  return grouped
                    .map(([userMsg, iaMsg], idx) => {
                      if (!userMsg) return null;
                      return (
                        <React.Fragment key={idx}>
                          <WhatsAppChatBubble isMine={false} message={userMsg.content} />
                          {iaMsg && <WhatsAppChatBubble isMine={true} message={iaMsg.content} />}
                        </React.Fragment>
                      );
                    })
                    .filter(Boolean);
                })()
              )}
              <div ref={messagesEndRef} style={{ height: "30px" }} />
            </div>
            {!isAtBottom && (
              <button
                className="fixed bottom-16 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition"
                onClick={() =>
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              >
                ⬇️ Bajar
              </button>
            )}
          </>
        )}
      </div>

      {/* Aviso de encriptación */}
      <div className="flex justify-center items-center py-2 text-xs sm:text-sm text-gray-500">
        <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Tus mensajes personales están cifrados de extremo a extremo
      </div>

      {/* Sección de entrada de mensajes */}
      <div className="p-2 sm:p-4 bg-white mb-10">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full rounded-full pl-4 pr-16 py-4 sm:py-6 border-gray-200"
            />
          </div>

          <Button
            className="bg-secondary hover:bg-accent text-white rounded-full px-6 sm:px-6 py-4 sm:py-6"
            onClick={handleSendMessage}
          >
            <span className="hidden sm:inline">Enviar</span>{" "}
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

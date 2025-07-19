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
  fromMe?: boolean;
  pending?: boolean;
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
  wa_id?: string;
}

interface Group {
  id: string;
  name: string;
  wa_id?: string;
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
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
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
      socket.emit("get-chat-history", {
        numberId: selectedNumber.id,
        to: selectedChat.id,
      });
    }

    socket.on("chat-history", (data: ChatHistory) => {
      console.log('Te escribieron')
      // Merge: mantén los mensajes pendientes que no estén en el historial
      setMessages((prev) => {
        // Un mensaje se considera "confirmado" si hay uno igual en el historial (por contenido, fromMe y timestamp cercano)
        const confirmed = (pendingMessages || []).filter((pendingMsg) =>
          data.chatHistory.some(
            (hMsg) =>
              hMsg.content === pendingMsg.content &&
              hMsg.fromMe === true &&
              Math.abs(hMsg.timestamp - pendingMsg.timestamp) < 120000 // 2 minutos de tolerancia
          )
        );
        // Solo mantenemos los pendientes que NO están confirmados y que no han expirado
        const stillPending = (pendingMessages || []).filter(
          (pendingMsg) =>
            !confirmed.includes(pendingMsg) &&
            Date.now() - pendingMsg.timestamp < 10000
        );
        return [...data.chatHistory, ...stillPending];
      });
      setPendingMessages((prev) =>
        prev.filter((msg) => Date.now() - msg.timestamp < 10000)
      );
      setSendTo(data.to);
    });
    return () => {
      if (selectedNumber) {
        socket.emit("leave-room", String(selectedNumber.id));
      }
      socket.off("chat-history");
    };
  }, [socket, selectedNumber, selectedChat, pendingMessages]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingMessages((prev) =>
        prev.filter((msg) => Date.now() - msg.timestamp < 10000)
      ); // Elimina los que llevan más de 10s
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    try {
      // Usa wa_id si existe, si no, usa id si es un WhatsApp ID válido
      let toValue = selectedChat?.wa_id;
      if (
        !toValue &&
        selectedChat?.id &&
        (selectedChat.id.endsWith("@c.us") || selectedChat.id.endsWith("@g.us"))
      ) {
        toValue = selectedChat.id;
      }
      // LOG de depuración frontend
      //.log('ENVIANDO MENSAJE:', { toValue, selectedChat });
      if (!toValue) {
        alert(
          "No se puede enviar el mensaje: el chat seleccionado no tiene un WhatsApp ID válido (wa_id)."
        );
        return;
      }
      const newMessage = {
        role: "user" as const,
        content: message,
        timestamp: Date.now(),
        fromMe: true,
        pending: true,
      };
      setPendingMessages((prev) => [...prev, newMessage]);
      setMessage("");
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          content: message,
          to: toValue,
          numberId: selectedNumber?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message && data.message.includes("no está sincronizado")) {
          alert(
            "Este grupo/contacto no está sincronizado. Por favor, sincronízalo desde la lista de contactos y grupos para poder enviar mensajes."
          );
          // Si tienes acceso a setContactsModalOpen desde props o contexto, puedes abrir el modal aquí
          // Por ejemplo: setContactsModalOpen?.(true);
        } else {
          alert(data.message || "Error al enviar el mensaje");
        }
        // Si falló, elimina el mensaje pendiente
        setPendingMessages((prev) => prev.filter((m) => m !== newMessage));
        return;
      }
      // Fuerza la recarga del historial del chat para que el mensaje se vea inmediatamente
      if (socket && selectedNumber && toValue) {
        socket.emit("get-chat-history", {
          numberId: selectedNumber.id,
          to: toValue,
        });
        setTimeout(() => {
          socket.emit("get-chat-history", {
            numberId: selectedNumber.id,
            to: toValue,
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar el mensaje. Por favor, intenta de nuevo.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#e5ded8] dark:bg-[#111b21]">
      {/* Área principal */}
      <div className="flex-1 p-2 sm:p-6 overflow-y-auto flex items-center justify-center">
        {selectedNumber && numbers[selectedNumber.id] !== "connected" ? (
          <div className="bg-card rounded-xl p-4 sm:p-8 w-full max-w-3xl shadow-sm border border-border">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="flex-1 space-y-4 sm:space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-medium mb-2 text-foreground">
                    Conecta tu número
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Escanea el código QR con tu teléfono para conectar tu número
                    y empezar a usar el servicio.
                  </p>
                </div>

                <ol className="space-y-3 sm:space-y-4 list-decimal list-inside text-sm sm:text-base text-muted-foreground">
                  <li>Abre la aplicación de WhatsApp en tu teléfono</li>
                  <li>Ve a la sección de configuración</li>
                  <li>Selecciona la opción &quot;Escanear código QR&quot;</li>
                  <li>
                    Apunta la cámara hacia el código mostrado a la derecha
                  </li>
                </ol>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="bg-background dark:bg-card p-2 border border-border rounded-lg shadow-sm">
                  {selectedNumber && qrCodes && qrCodes[selectedNumber.id] ? (
                    <QRDisplay
                      qrCode={qrCodes[selectedNumber.id]}
                      number={selectedNumber.number}
                    />
                  ) : (
                    <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] flex items-center justify-center bg-muted dark:bg-muted">
                      <p className="text-sm text-muted-foreground">
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
            <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
              {messages.length === 0 && pendingMessages.length === 0 ? (
                <div className="text-gray-400 text-base mt-10">
                  No hay mensajes en este chat aún.
                </div>
              ) : (
                (() => {
                  // Junta mensajes confirmados y pendientes (que no estén ya confirmados)
                  const allMessages = [
                    ...messages,
                    ...pendingMessages.filter(
                      (pendingMsg) =>
                        !messages.some(
                          (m) =>
                            m.content === pendingMsg.content &&
                            m.fromMe === true &&
                            Math.abs(m.timestamp - pendingMsg.timestamp) <
                              120000
                        )
                    ),
                  ].sort((a, b) => a.timestamp - b.timestamp);

                  return allMessages.map((msg, idx) => (
                    <WhatsAppChatBubble
                      key={idx}
                      isMine={msg.fromMe === true}
                      message={msg.content}
                    />
                  ));
                })()
              )}
              <div ref={messagesEndRef} style={{ height: "30px" }} />
            </div>
            {!isAtBottom && (
              <button
                className="fixed bottom-16 right-4 bg-[#128c7e] text-white p-2 rounded-full shadow-lg hover:bg-[#075e54] transition"
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
      <div className="flex justify-center items-center py-2 text-xs sm:text-sm">
        <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        Tus mensajes personales están cifrados de extremo a extremo
      </div>

      {/* Sección de entrada de mensajes */}
      <div className="p-2 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full rounded-full pl-4 pr-16 py-4 sm:py-3 border-gray-200"
            />
          </div>

          <Button
            className="bg-[#075e54] hover:bg-[#128c7e] text-white rounded-full p-4 aspect-square w-10 h-10 flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

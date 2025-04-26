"use client";
import WhatsAppMainContent from "@/components/WhatsAppMainContent";
import WhatsAppSideBar from "@/components/WhatsAppSideBar";
import WhatsAppHeader from "@/components/WhatsAppHeader";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chatState";
import { Agent, QrCodeEvent, WhatsappNumber } from "@/types/gobal";
import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Page() {
  const { logout, isAuthenticated, getToken } = useAuth();
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsappNumber[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string | null>>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newNumber, setNewNumber] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [selectedNumber, setSelectedNumber] = useState<WhatsappNumber | null>(
    null
  );
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const { setNumberStatus } = useChat();
  const router = useRouter()

  // Efecto para inicializar la aplicación y obtener los números de WhatsApp
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }

    const newSocket = io(BACKEND_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("qr-code", (data: QrCodeEvent) => {
      console.log(data);
      /* if (data.numberId === selectedNumber?.id) {
        setQrCodes((prev) => ({ ...prev, [data.numberId]: data.qr }));
      } */
    });

    const getNumbers = async () => {
      const token = getToken();
      if (!token) {
        alert("No hay token");
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/user/get-numbers`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setWhatsappNumbers(data);
      } catch (error) {
        console.error("❌ Error obteniendo números:", error);
      }
    };

    getNumbers();

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, logout, getToken]);

  const toggleAi = useCallback(
    async (number: string | number, newVal: boolean) => {
      if (!isAuthenticated) {
        logout();
        return;
      }

      const token = getToken();
      if (!token) {
        alert("No hay token");
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/user/toggle-ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: newVal, number }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setSelectedNumber((prev) =>
          prev ? { ...prev, aiEnabled: newVal } : null
        );
      } catch (error) {
        console.error("❌ Error actualizando AI:", error);
      }
    },
    [getToken, isAuthenticated, logout]
  );

  const handleGoBack  = async () => {
    router.back()
  }

  const toggleResponseGroups = useCallback(
    async (number: string | number, newVal: boolean) => {
      if (!isAuthenticated) {
        logout();
        return;
      }

      const token = getToken();
      if (!token) {
        alert("No hay token");
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/user/response-groups`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: newVal, number }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setSelectedNumber((prev) =>
          prev ? { ...prev, responseGroups: newVal } : null
        );
      } catch (error) {
        console.error("❌ Error actualizando AI:", error);
      }
    },
    [getToken, isAuthenticated, logout]
  );

  const removeNumber = useCallback(
    async (numberId: string) => {
      if (!isAuthenticated) {
        logout();
        return;
      }

      const token = getToken();
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/user/delete-number/${numberId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setWhatsappNumbers(
          whatsappNumbers.filter(
            (number) => String(number.id) !== String(numberId)
          )
        );

        // Si el número eliminado es el seleccionado, deseleccionarlo
        if (selectedNumber && String(selectedNumber.id) === String(numberId)) {
          setSelectedNumber(null);
        }
      } catch (error) {
        console.error("❌ Error eliminando número:", error);
      }
    },
    [getToken, isAuthenticated, logout, selectedNumber, whatsappNumbers]
  );

  // Efecto para manejar eventos de socket
  useEffect(() => {
    if (!socket) return;

    if (selectedNumber) {
      socket.emit("join-room", String(selectedNumber.id));
    }

    socket.on("qr-code", (data: QrCodeEvent) => {
      if (data.numberId === selectedNumber?.id) {
        setQrCodes((prev) => ({ ...prev, [data.numberId]: data.qr }));
      }
    });

    socket.on("whatsapp-ready", (data: { numberId: string | number }) => {
      if (data.numberId === selectedNumber?.id) {
        setNumberStatus(data.numberId.toString(), "connected");
        setQrCodes((prev) => ({ ...prev, [data.numberId]: null }));
        setSelectedNumber((prev) =>
          prev ? { ...prev, status: "connected" } : null
        );
      }
    });

    socket.on("whatsapp-numbers-updated", () => {
      whatsappNumbers.forEach((num) => {
        removeNumber(num.id.toString());
        setNumberStatus(num.id.toString(), "disconnected");
      });
      setWhatsappNumbers([]);
      setSelectedNumber(null);
    });

    return () => {
      // Leave room for old selection and remove listeners
      if (selectedNumber) {
        socket.emit("leave-room", String(selectedNumber.id));
      }
      socket.off("qr-code");
      socket.off("whatsapp-ready");
      socket.off("whatsapp-numbers-updated");
    };
  }, [socket, selectedNumber, setNumberStatus, whatsappNumbers, removeNumber]);

  // Función para buscar números
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredNumbers = whatsappNumbers.filter(
      (number) =>
        number.name.toLowerCase().includes(searchTerm) ||
        number.number.toString().includes(searchTerm)
    );
    setWhatsappNumbers(filteredNumbers);
  };

  // Función para agregar un nuevo número de WhatsApp
  const addNumber = async () => {
    if (!newNumber || !newName) {
      alert("Por favor, ingresa un número y un nombre");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("No hay token");
      return;
    }

    try {
      console.log("Enviando solicitud para agregar número:", {
        number: newNumber,
        name: newName,
      });

      const res = await fetch(`${BACKEND_URL}/api/user/add-number`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ number: newNumber, name: newName }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Error al parsear la respuesta:", parseError);
        alert("⚠️ Error: No se pudo procesar la respuesta del servidor");
        return;
      }

      if (!res.ok) {
        console.error("Error en la respuesta del servidor:", data);
        alert(`⚠️ Error: ${data?.message || "No se pudo agregar el número"}`);
        return;
      }

      console.log("Respuesta exitosa:", data);
      const { numberId } = data;

      if (!numberId) {
        alert("⚠️ Error: El servidor no devolvió un ID de número válido");
        return;
      }

      setWhatsappNumbers([
        ...whatsappNumbers,
        {
          id: numberId,
          name: newName,
          number: newNumber,
          status: "disconnected",
        },
      ]);
      // Select the new number to trigger join-room and QR handling
      setSelectedNumber({
        id: numberId,
        name: newName,
        number: newNumber,
        status: "connecting",
      });
      setNumberStatus(numberId, "connecting");
      setNewNumber("");
      setNewName("");

      try {
        const qrRequest = await fetch(
          `${BACKEND_URL}/api/whatsapp/start-whatsapp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ numberId }),
          }
        );

        let errorData;
        try {
          errorData = await qrRequest.json();
        } catch (parseError) {
          console.error("Error al parsear la respuesta QR:", parseError);
        }

        if (!qrRequest.ok) {
          alert(
            `⚠️ Error: ${errorData?.message || "Error al iniciar WhatsApp"}`
          );
          return;
        }

        // Emit join-room for the new number so QR events are received
        socket?.emit("join-room", String(numberId));
      } catch (qrError) {
        console.error("❌ Error al solicitar código QR:", qrError);
        alert("⚠️ Error al solicitar el código QR de WhatsApp");
      }
    } catch (error) {
      console.error("❌ Error agregando número:", error);
      alert("⚠️ Error de conexión al intentar agregar el número");
    } finally {
      // no-op
    }
  };
  const updatePrompt = useCallback(async () => {
    if (!currentAgent || !selectedNumber) return;
    const token = getToken();
    if (!token) {
      alert("No hay token");
      return;
    }
    const res = await fetch(
      `${BACKEND_URL}/api/user/update-prompt/${selectedNumber?.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ aiPrompt: currentAgent.prompt }),
      }
    );
    if (!res.ok) {
      alert("Error al actualizar el prompt");
      return;
    }
  }, [currentAgent, getToken, selectedNumber]);

  useEffect(() => {
    updatePrompt();
  }, [currentAgent, updatePrompt]);

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-white">
      <WhatsAppSideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleSearch={handleSearch}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
        addNumber={addNumber}
        whatsappNumbers={whatsappNumbers}
        newName={newName}
        setNewName={setNewName}
        selectedNumber={selectedNumber}
        setSelectedNumber={setSelectedNumber}
        setWhatsappNumbers={setWhatsappNumbers}
        handleLogout={handleGoBack}
        removeNumber={removeNumber}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-white w-full">
        <WhatsAppHeader
          setSidebarOpen={setSidebarOpen}
          selectedNumber={selectedNumber}
          toggleAi={toggleAi}
          toggleGroups={toggleResponseGroups}
          setSelectedNumber={setSelectedNumber}
          currentAgent={currentAgent}
          setCurrentAgent={setCurrentAgent}
        />
        <WhatsAppMainContent
          qrCodes={qrCodes}
          selectedNumber={selectedNumber}
        />
      </div>
    </div>
  );
}

"use client";
import WhatsAppMainContent from "@/components/WhatsAppMainContent";
import WhatsAppSideBar from "@/components/WhatsAppSideBar";
import WhatsAppHeader from "@/components/WhatsAppHeader";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chatState";
import { Agent, WhatsappNumber } from "@/types/gobal";
import { Contact, Group } from "@/types/global";
import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import SyncedSidebar from "@/components/SyncedSidebar";
import { RefreshCw } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface QrCodeEvent {
  numberId: number;
  qr: string;
}

interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  isMyContact: boolean;
  wa_id?: string;
  lastMessageTimestamp?: number;
  lastMessagePreview?: string;
  agenteHabilitado?: boolean;
  [key: string]: unknown;
}

interface WhatsAppGroup {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  wa_id?: string;
  lastMessageTimestamp?: number;
  lastMessagePreview?: string;
  agenteHabilitado?: boolean;
  [key: string]: unknown;
}

interface SyncedItem {
  type: string;
  wa_id: string;
  id: string;
  lastMessageTimestamp?: number;
  [key: string]: unknown;
}

interface ChatHistoryData {
  to: string;
  lastMessageTimestamp?: number;
  chatHistory?: Array<{
    content: string;
    [key: string]: unknown;
  }>;
}

// Utilidad para eliminar duplicados por id
function uniqueById<T extends { id: string | number }>(arr: T[]): T[] {
  const seen = new Set<string | number>();
  return arr.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// Utilidad para normalizar unsyncedContacts
function normalizeUnsyncedContacts(arr: WhatsAppContact[]): WhatsAppContact[] {
  return arr.map((c) => {
    const wa_id =
      c.wa_id ||
      (typeof c.id === "string" && c.id.match(/^\d+$/) ? c.id + "@c.us" : c.id);
    let id = c.id;
    if (typeof id === "string" && id.match(/^\d+$/)) {
      id = id + "@c.us";
    }
    return { ...c, wa_id, id };
  });
}

export default function Page() {
  const { logout, isAuthenticated, getToken } = useAuth();
  const { setNumberStatus } = useChat();
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsappNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<WhatsappNumber | null>(
    null
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<
    "contact" | "group" | null
  >(null);
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string | null }>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [syncedContacts, setSyncedContacts] = useState<Contact[]>([]);
  const [syncedGroups, setSyncedGroups] = useState<Group[]>([]);
  const [unsyncedContacts, setUnsyncedContacts] = useState<Contact[]>([]);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [lastAutoChat, setLastAutoChat] = useState<{
    wa_id: string;
    timestamp: number;
  } | null>(null);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const router = useRouter();

  // Estados y variables auxiliares restaurados
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "contacts" | "groups">(
    "all"
  );
  const [contactSearch, setContactSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  // Separar contactos y grupos (debe ir antes de cualquier uso)
  const personalContacts = uniqueById(
    contacts
      .filter((c) => !c.isGroup && c.isMyContact) // SOLO contactos guardados
      .map((c) => ({ ...c, id: String(c.id) }))
  );
  const groupContacts = uniqueById(
    contacts.filter((c) => c.isGroup).map((c) => ({ ...c, id: String(c.id) }))
  );
  const unsyncedPersonalContacts = personalContacts.filter(
    (c) => !syncedContacts.some((sc) => sc.id === c.id)
  );
  const unsyncedGroupContacts = groupContacts.filter(
    (g) => !syncedGroups.some((sg) => sg.id === g.id)
  );
  const filteredPersonalContacts = uniqueById<WhatsAppContact>(
    unsyncedPersonalContacts.filter((c: WhatsAppContact) =>
      ((c.name ?? c.number ?? "") as string)
        .toLowerCase()
        .includes(contactSearch.toLowerCase())
    )
  );
  const filteredGroupContacts = uniqueById<WhatsAppGroup>(
    unsyncedGroupContacts.filter((g: WhatsAppGroup) =>
      ((g.name ?? g.number ?? "") as string)
        .toLowerCase()
        .includes(groupSearch.toLowerCase())
    )
  );

  // Variables auxiliares para disabled de los botones
  const isSelectAllDisabled = (() => {
    switch (filterType) {
      case "contacts":
        return filteredPersonalContacts.length === 0;
      case "groups":
        return filteredGroupContacts.length === 0;
      case "all":
      default:
        return (
          filteredPersonalContacts.length === 0 &&
          filteredGroupContacts.length === 0
        );
    }
  })();
  const isDeselectAllDisabled = (() => {
    switch (filterType) {
      case "contacts":
        return selectedContacts.length === 0;
      case "groups":
        return selectedGroups.length === 0;
      case "all":
      default:
        return selectedContacts.length === 0 && selectedGroups.length === 0;
    }
  })();

  // --- fetchSynced global ---
  const fetchSynced = useCallback(async () => {
    if (!selectedNumber) return;
    const token = getToken();
    const res = await fetch(
      `${BACKEND_URL}/api/whatsapp/synced-contacts?numberId=${selectedNumber.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    // Ordenar contactos y grupos por lastMessageTimestamp descendente
    const contacts = data
      .filter((x: SyncedItem) => x.type === "contact")
      .map((x: SyncedItem) => ({
        ...x,
        id: x.id,
        wa_id: x.wa_id,
        name: x.name || x.wa_id || x.id,
        number: x.wa_id || x.id,
        lastMessageTimestamp: x.lastMessageTimestamp || 0,
      }))
      .sort(
        (a: SyncedItem, b: SyncedItem) =>
          (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
      );
    const groups = data
      .filter((x: SyncedItem) => x.type === "group")
      .map((x: SyncedItem) => ({
        ...x,
        id: x.id,
        wa_id: x.wa_id,
        lastMessageTimestamp: x.lastMessageTimestamp || 0,
      }))
      .sort(
        (a: SyncedItem, b: SyncedItem) =>
          (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
      );
    setSyncedContacts(contacts);
    setSyncedGroups(groups);
    // NO limpiar el chat seleccionado aquí
  }, [selectedNumber, getToken]);

  // Efecto para inicializar la aplicación y obtener los números de WhatsApp
  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      return;
    }

    const newSocket = io(BACKEND_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("qr-code", () => {
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
        console.error("Error obteniendo números:", error);
      }
    };

    getNumbers();

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, logout, getToken, setSocket, setWhatsappNumbers]);

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
          body: JSON.stringify({
            enabled: newVal,
            number: selectedNumber?.number,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setSelectedNumber((prev) =>
          prev ? { ...prev, aiEnabled: newVal } : null
        );
        // Ya no se actualizan los contactos sincronizados aquí
      } catch (error) {
        console.error("Error actualizando AI:", error);
      } finally {
        if (!currentAgent) {
          setContactsModalOpen(false);
        }
      }
    },
    [getToken, isAuthenticated, logout, selectedNumber, currentAgent]
  );

  const handleGoBack = async () => {
    router.back();
  };

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
          body: JSON.stringify({
            enabled: newVal,
            number: selectedNumber?.number,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setSelectedNumber((prev) =>
          prev ? { ...prev, responseGroups: newVal } : null
        );

        // NUEVO: Actualizar agenteHabilitado en todos los grupos sincronizados
        if (selectedNumber) {
          // Obtener los grupos sincronizados actuales
          const resGroups = await fetch(
            `${BACKEND_URL}/api/whatsapp/synced-contacts?numberId=${selectedNumber.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          let dataGroups = await resGroups.json();
          if (!Array.isArray(dataGroups)) dataGroups = [];
          const syncedGroups = dataGroups.filter(
            (x: { type: string }) => x.type === "group"
          );
          // Actualizar agenteHabilitado para todos los grupos
          await Promise.all(
            syncedGroups.map((g: { id: string; agenteHabilitado: boolean }) =>
              fetch(`${BACKEND_URL}/api/whatsapp/update-agente-habilitado`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: g.id, agenteHabilitado: newVal }),
              })
            )
          );
          // Actualizar el estado local
          setSyncedGroups((prev) =>
            prev.map((g) => ({ ...g, agenteHabilitado: newVal }))
          );
        }
      } catch (error) {
        console.error("❌ Error actualizando AI:", error);
      }
    },
    [getToken, isAuthenticated, logout, selectedNumber]
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
        // Borra sincronizados de ese número
        localStorage.removeItem(`syncedContacts_${numberId}`);
        localStorage.removeItem(`syncedGroups_${numberId}`);
        // Si el número eliminado es el seleccionado, limpia el estado
        if (selectedNumber && String(selectedNumber.id) === String(numberId)) {
          setSelectedNumber(null);
          setSyncedContacts([]);
          setSyncedGroups([]);
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

    socket.on("whatsapp-ready", async (data: { numberId: string | number }) => {
      if (data.numberId === selectedNumber?.id) {
        setNumberStatus(data.numberId.toString(), "connected");
        setQrCodes((prev) => ({ ...prev, [data.numberId]: null }));
        setSelectedNumber((prev) =>
          prev ? { ...prev, status: "connected" } : null
        );
        setLoadingContacts(true);
        const token = getToken();
        if (token) {
          try {
            const res = await fetch(
              `${BACKEND_URL}/api/whatsapp/contacts?numberId=${data.numberId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (res.ok) {
              const contactList = await res.json();
              setContacts(
                uniqueById(
                  (contactList as WhatsAppContact[]).map(
                    (c: WhatsAppContact) => ({ ...c, id: String(c.id) })
                  )
                )
              );
              setLoadingContacts(false);
              setContactsModalOpen(true);
            } else {
              setLoadingContacts(false);
            }
          } catch (error) {
            setLoadingContacts(false);
            console.error("Error fetching contacts:", error);
          }
        } else {
          setLoadingContacts(false);
        }
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

    // Al recibir un mensaje, selecciona el chat del mensaje más reciente
    socket.on("chat-history", (data: ChatHistoryData) => {
      if (!data || !data.to) return;
      const isGroup = data.to.endsWith("@g.us");
      // Si NO está sincronizado, refresca la lista de no sincronizados y selecciónalo SIEMPRE
      const isSynced =
        (isGroup && syncedGroups.some((g) => g.wa_id === data.to)) ||
        (!isGroup && syncedContacts.some((c) => c.wa_id === data.to));
      if (!isSynced) {
        // Siempre refresca la lista de no sincronizados
        if (selectedNumber) {
          fetch(
            `${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumber.id}`
          )
            .then((res) => res.json())
            .then((data) => {
              const fixed = Array.isArray(data)
                ? normalizeUnsyncedContacts(
                    data.map((c) => ({
                      ...c,
                      agenteHabilitado: !!c.agentehabilitado,
                    }))
                  )
                : [];
              setUnsyncedContacts(fixed);
            })
            .catch(() => setUnsyncedContacts([]));
        }
        // Selecciona el chat recibido
        setSelectedChatId(data.to);
        setSelectedChatType(isGroup ? "group" : "contact");
        setSidebarRefreshKey((k) => k + 1); // Fuerza actualización del sidebar
        return;
      }
      // SIEMPRE priorizar el chat del último mensaje recibido y dejarlo fijo
      setSelectedChatId(data.to);
      setSelectedChatType(isGroup ? "group" : "contact");
      setLastAutoChat({
        wa_id: data.to,
        timestamp: data.lastMessageTimestamp || Date.now(),
      });
      // Actualiza el timestamp y preview del chat correspondiente y reordena la lista
      if (isGroup) {
        setSyncedGroups((prev) => {
          const updated = prev.map((g) =>
            g.wa_id === data.to
              ? {
                  ...g,
                  lastMessageTimestamp: data.lastMessageTimestamp,
                  lastMessagePreview:
                    data.chatHistory?.slice(-1)[0]?.content || "",
                }
              : g
          );
          return [...updated].sort(
            (a, b) =>
              (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
          );
        });
      } else {
        setSyncedContacts((prev) => {
          const updated = prev.map((c) =>
            c.wa_id === data.to
              ? {
                  ...c,
                  lastMessageTimestamp: data.lastMessageTimestamp,
                  lastMessagePreview:
                    data.chatHistory?.slice(-1)[0]?.content || "",
                }
              : c
          );
          return [...updated].sort(
            (a, b) =>
              (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
          );
        });
      }
    });

    // Refuerza el evento unsynced-contacts-updated para que siempre actualice la lista
    socket.on("unsynced-contacts-updated", () => {
      console.log("Evento unsynced-contacts-updated recibido"); // DEPURACIÓN
      if (selectedNumber) {
        fetch(
          `${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumber.id}`
        )
          .then((res) => res.json())
          .then((responseData) => {
            const fixed = Array.isArray(responseData)
              ? normalizeUnsyncedContacts(
                  responseData.map((c) => ({
                    ...c,
                    agenteHabilitado: !!c.agentehabilitado,
                  }))
                )
              : [];
            setUnsyncedContacts(fixed);
            setSidebarRefreshKey((k) => k + 1);
            if (selectedChatId) {
              const updated = fixed.find(
                (c) => c.wa_id === selectedChatId || c.id === selectedChatId
              );
              if (updated) {
                setSelectedChatId(updated.wa_id || updated.id);
              }
            }
          })
          .catch(() => setUnsyncedContacts([]));
      }
    });

    // NUEVO: refrescar sincronizados cuando el backend desactive IA tras email
    socket.on("synced-contacts-updated", () => {
      if (selectedNumber) {
        fetchSynced();
        setSidebarRefreshKey((k) => k + 1);
        if (selectedChatId) {
          const updated = syncedContacts.find(
            (c) => c.wa_id === selectedChatId || c.id === selectedChatId
          );
          if (updated) {
            setSelectedChatId(updated.wa_id || updated.id);
          }
        }
      }
    });

    return () => {
      if (selectedNumber) {
        socket.emit("leave-room", String(selectedNumber.id));
      }
      socket.off("qr-code");
      socket.off("whatsapp-ready");
      socket.off("whatsapp-numbers-updated");
      socket.off("chat-history");
      // Limpiar también los nuevos listeners
      socket.off("synced-contacts-updated");
      socket.off("unsynced-contacts-updated");
    };
  }, [
    socket,
    selectedNumber,
    setNumberStatus,
    whatsappNumbers,
    removeNumber,
    getToken,
    lastAutoChat,
    syncedContacts,
    syncedGroups,
    fetchSynced,
    selectedChatId,
  ]);

  // Resetear lastAutoChat cuando el usuario selecciona manualmente un chat o cambia de número
  useEffect(() => {
    setLastAutoChat(null);
  }, [selectedChatId, selectedNumber]);

  // Loader: mostrar cuando el QR desaparece (después de escanear)
  useEffect(() => {
    if (!selectedNumber) return;
    const qr = qrCodes[selectedNumber.id];
    // Si el QR existía y ahora es null, significa que ya se escaneó
    if (qr === null) {
      setLoadingContacts(true);
    }
  }, [qrCodes, selectedNumber]);

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
      // console.log("Enviando solicitud para agregar número:", {
      //   number: newNumber,
      //   name: newName,
      // });

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

      // console.log("Respuesta exitosa:", data);
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
      } catch (error) {
        console.error("❌ Error al solicitar código QR:", error);
        alert("⚠️ Error al solicitar el código QR de WhatsApp");
      }
    } catch (error) {
      console.error("Error:", error);
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

  const handleContactToggle = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };
  const handleGroupToggle = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (filterType === "all") {
      setSelectedContacts(filteredPersonalContacts.map((c) => c.id));
      setSelectedGroups(filteredGroupContacts.map((g) => g.id));
    } else if (filterType === "contacts") {
      setSelectedContacts(filteredPersonalContacts.map((c) => c.id));
    } else if (filterType === "groups") {
      setSelectedGroups(filteredGroupContacts.map((g) => g.id));
    }
  };
  const handleDeselectAll = () => {
    if (filterType === "all") {
      setSelectedContacts([]);
      setSelectedGroups([]);
    } else if (filterType === "contacts") {
      setSelectedContacts([]);
    } else if (filterType === "groups") {
      setSelectedGroups([]);
    }
  };

  const handleSyncSelected = async () => {
    if (!selectedNumber) return;
    const token = getToken();
    if (!token) return;
    setSyncingContacts(true);
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp/sync-contacts-db`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numberId: selectedNumber.id,
          contacts: uniqueById(
            personalContacts
              .filter((c) => selectedContacts.includes(c.id))
              .filter((c) => typeof c.id === "string" && c.id.endsWith("@c.us"))
          ).map((c) => ({
            ...c,
            id: c.wa_id || c.id,
            wa_id: c.wa_id || c.id,
            name: c.name,
            number: c.number || c.wa_id || c.id,
          })),
          groups: uniqueById(
            groupContacts.filter((g) => selectedGroups.includes(g.id))
          ).map((g) => ({
            ...g,
            id: g.wa_id || g.id,
            wa_id: g.wa_id || g.id,
            name: g.name,
          })),
          clearAll: false,
        }),
      });
      setContactsModalOpen(false); // Cierra el modal automáticamente
      await fetchSynced();
      // Refresca los no sincronizados también
      if (selectedNumber) {
        fetch(
          `${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumber.id}`
        )
          .then((res) => res.json())
          .then((data) => {
            const fixed = Array.isArray(data)
              ? normalizeUnsyncedContacts(
                  data.map((c) => ({
                    ...c,
                    agenteHabilitado: !!c.agentehabilitado,
                  }))
                )
              : [];
            setUnsyncedContacts(fixed);
          })
          .catch(() => setUnsyncedContacts([]));
      }
    } catch {
      alert("Error al sincronizar");
    } finally {
      setLoadingContacts(false);
      setSyncingContacts(false);
    }
  };

  // Funciones requeridas por SyncedSidebar
  const handleRemoveContact = async (id: string) => {
    // Elimina de la base de datos
    const token = getToken();
    // Optimismo visual: elimina localmente si es un contacto no sincronizado
    setUnsyncedContacts((prev) => prev.filter((c) => c.id !== id));
    await fetch(`${BACKEND_URL}/api/whatsapp/delete-synced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    setSyncedContacts((prev) => prev.filter((c) => c.id !== id));
  };
  const handleRemoveGroup = async (id: string) => {
    const token = getToken();
    await fetch(`${BACKEND_URL}/api/whatsapp/delete-synced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    setSyncedGroups((prev) => prev.filter((g) => g.id !== id));
  };
  const handleToggleAgente = async (id: string, newValue: boolean) => {
    const token = getToken();
    // Buscar si el id está en los sincronizados o no sincronizados
    const isSynced =
      syncedContacts.some((c) => c.id === id) ||
      syncedGroups.some((g) => g.id === id);
    if (isSynced) {
      const res = await fetch(
        `${BACKEND_URL}/api/whatsapp/update-agente-habilitado`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, agenteHabilitado: newValue }),
        }
      );
      await res.json().catch(() => ({}));
      setSyncedContacts((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, agenteHabilitado: newValue } : c
        )
      );
      setSyncedGroups((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, agenteHabilitado: newValue } : g
        )
      );
    } else {
      // PATCH para Unsyncedcontact
      const res = await fetch(`${BACKEND_URL}/api/unsyncedcontacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentehabilitado: newValue }),
      });
      await res.json().catch(() => ({}));
      // Refresca la lista de no sincronizados
      if (selectedNumber) {
        fetch(
          `${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumber.id}`
        )
          .then((res) => res.json())
          .then((data) => {
            const fixed = Array.isArray(data)
              ? normalizeUnsyncedContacts(
                  data.map((c) => ({
                    ...c,
                    agenteHabilitado: !!c.agentehabilitado,
                  }))
                )
              : [];
            setUnsyncedContacts(fixed);
          })
          .catch((err) => {
            console.error("Error refrescando unsyncedContacts", err);
            setUnsyncedContacts([]);
          });
      }
    }
  };
  const handleBulkDelete = async () => {
    const token = getToken();
    const allIds = [
      ...syncedContacts.map((c) => c.id),
      ...syncedGroups.map((g) => g.id),
    ];
    await Promise.all(
      allIds.map((id) =>
        fetch(`${BACKEND_URL}/api/whatsapp/delete-synced`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        })
      )
    );
    setSyncedContacts([]);
    setSyncedGroups([]);
  };
  const handleBulkDisable = async () => {
    // Optimismo visual: desactiva todos en el frontend
    setSyncedContacts((prev) =>
      prev.map((c) => ({ ...c, agenteHabilitado: false }))
    );
    setSyncedGroups((prev) =>
      prev.map((g) => ({ ...g, agenteHabilitado: false }))
    );

    const token = getToken();
    const contacts = Array.isArray(syncedContacts) ? syncedContacts : [];
    const groups = Array.isArray(syncedGroups) ? syncedGroups : [];
    const updates = [
      ...contacts.map((c) => ({ id: c.id, agenteHabilitado: false })),
      ...groups.map((g) => ({ id: g.id, agenteHabilitado: false })),
    ];
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp/bulk-update-agente-habilitado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });
      await fetchSynced();
    } catch {
      alert("Error al desactivar todos los agentes");
      await fetchSynced();
    }
  };
  const handleBulkEnable = async () => {
    // Optimismo visual: activa todos en el frontend
    setSyncedContacts((prev) =>
      prev.map((c) => ({ ...c, agenteHabilitado: true }))
    );
    setSyncedGroups((prev) =>
      prev.map((g) => ({ ...g, agenteHabilitado: true }))
    );

    const token = getToken();
    const contacts = Array.isArray(syncedContacts) ? syncedContacts : [];
    const groups = Array.isArray(syncedGroups) ? syncedGroups : [];
    const updates = [
      ...contacts.map((c) => ({ id: c.id, agenteHabilitado: true })),
      ...groups.map((g) => ({ id: g.id, agenteHabilitado: true })),
    ];
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp/bulk-update-agente-habilitado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });
      await fetchSynced();
    } catch {
      alert("Error al activar todos los agentes");
      await fetchSynced();
    }
  };

  // Restaurar la función para selección manual desde la sidebar
  const handleSelectSynced = (
    item: Contact | Group,
    type: "contact" | "group"
  ) => {
    if (type === "contact") {
      const found =
        syncedContacts.find(
          (c) => c.id === item.id || c.wa_id === item.wa_id
        ) ||
        unsyncedContacts.find(
          (c) => c.id === item.id || c.wa_id === item.wa_id
        );
      if (found) {
        // Si no tiene wa_id pero el id termina en @c.us, asígnalo
        const updatedFound =
          !found.wa_id && found.id && found.id.endsWith("@c.us")
            ? { ...found, wa_id: found.id }
            : found;
        setSelectedChatId(
          updatedFound.wa_id
            ? String(updatedFound.wa_id)
            : String(updatedFound.id)
        );
        setSelectedChatType("contact");
        return;
      }
    } else if (type === "group") {
      const found = syncedGroups.find(
        (g) => g.id === item.id || g.wa_id === item.wa_id
      );
      if (found) {
        setSelectedChatId(found.wa_id ? String(found.wa_id) : String(found.id));
        setSelectedChatType("group");
        return;
      }
    }
    // Fallback: usa el id y tipo del item recibido
    setSelectedChatId(item.wa_id ? String(item.wa_id) : String(item.id));
    setSelectedChatType(type);
  };

  // useEffect para limpiar selección si el chat ya no está sincronizado
  useEffect(() => {
    if (
      selectedChatType === "contact" &&
      !syncedContacts.some((c) => c.wa_id === selectedChatId) &&
      !unsyncedContacts.some((c) => c.wa_id === selectedChatId)
    ) {
      setSelectedChatId(null);
      setSelectedChatType(null);
    }
    if (
      selectedChatType === "group" &&
      !syncedGroups.some((g) => g.wa_id === selectedChatId)
    ) {
      setSelectedChatId(null);
      setSelectedChatType(null);
    }
  }, [
    syncedContacts,
    syncedGroups,
    unsyncedContacts,
    selectedChatId,
    selectedChatType,
    setSelectedChatId,
    setSelectedChatType,
  ]);

  // Actualizar sincronizados cada vez que se selecciona un número
  useEffect(() => {
    if (selectedNumber) {
      fetchSynced();
    }
  }, [selectedNumber, fetchSynced]);

  const toggleUnknownAi = useCallback(
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
        const res = await fetch(
          `${BACKEND_URL}/api/whatsapp/toggle-unknown-ai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              enabled: newVal,
              number: selectedNumber?.number,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }
        setSelectedNumber((prev) =>
          prev ? { ...prev, aiUnknownEnabled: newVal } : prev
        );
      } catch {
        alert("Error actualizando IA para no agregados");
      }
    },
    [isAuthenticated, logout, getToken, selectedNumber, setSelectedNumber]
  );

  useEffect(() => {
    if (selectedNumber) {
      fetch(`${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumber.id}`)
        .then((res) => res.json())
        .then((data) => {
          const fixed = Array.isArray(data)
            ? normalizeUnsyncedContacts(
                data.map((c) => ({
                  ...c,
                  agenteHabilitado: !!c.agentehabilitado,
                }))
              )
            : [];
          setUnsyncedContacts(fixed);
        })
        .catch((err) => {
          console.error("Error refrescando unsyncedContacts", err);
          setUnsyncedContacts([]);
        });
    } else {
      setUnsyncedContacts([]);
    }
  }, [selectedNumber]);

  return (
    <div className="flex h-screen min-h-screen overflow-hidden bg-white">
      {/* Sidebar izquierdo */}
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
      {/* Contenido central */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white w-full">
        <WhatsAppHeader
          setSidebarOpen={setSidebarOpen}
          selectedNumber={selectedNumber}
          toggleAi={toggleAi}
          toggleGroups={toggleResponseGroups}
          toggleUnknownAi={toggleUnknownAi}
          setSelectedNumber={setSelectedNumber}
          currentAgent={currentAgent}
          setCurrentAgent={setCurrentAgent}
        />
        <WhatsAppMainContent
          qrCodes={qrCodes}
          selectedNumber={selectedNumber}
          selectedChat={(() => {
            const chat = selectedChatId
              ? selectedChatType === "contact"
                ? syncedContacts.find(
                    (c) => c.wa_id === selectedChatId || c.id === selectedChatId
                  ) ||
                  unsyncedContacts.find(
                    (c) => c.wa_id === selectedChatId || c.id === selectedChatId
                  )
                : selectedChatType === "group"
                ? syncedGroups.find(
                    (g) => g.wa_id === selectedChatId || g.id === selectedChatId
                  )
                : null
              : null;
            return chat;
          })()}
        />
      </div>
      {/* Sidebar derecho */}
      {selectedNumber && (
        <div className="w-64 bg-gray-50 border-l shadow-lg flex flex-col">
          <SyncedSidebar
            key={sidebarRefreshKey}
            contacts={uniqueById(syncedContacts)}
            groups={uniqueById(syncedGroups)}
            onSelect={handleSelectSynced}
            onSyncClick={() => setContactsModalOpen(true)}
            onRemoveContact={handleRemoveContact}
            onRemoveGroup={handleRemoveGroup}
            selectedId={selectedChatId || undefined}
            selectedType={selectedChatType || undefined}
            onToggleAgente={handleToggleAgente}
            onBulkDelete={handleBulkDelete}
            onBulkDisable={handleBulkDisable}
            onBulkEnable={handleBulkEnable}
            selectedNumberId={selectedNumber?.id.toString()}
            unsyncedContacts={unsyncedContacts}
          />
        </div>
      )}
      {/* Modal de sincronización de contactos */}
      <Dialog
        open={contactsModalOpen}
        onOpenChange={(open) => {
          setContactsModalOpen(open);
          if (!open) {
            setLoadingContacts(false);
          }
        }}
      >
        <DialogContent className="max-w-xl w-[500px] h-[600px] min-h-[600px] max-h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2 text-primary">
              Sincronizar contactos y grupos
            </DialogTitle>
            <DialogDescription className="mb-4 text-gray-600">
              Selecciona los contactos y grupos de WhatsApp que deseas
              sincronizar con el agente. Puedes actualizar tu selección en
              cualquier momento.
            </DialogDescription>
          </DialogHeader>
          {loadingContacts && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <span className="ml-2 text-primary">Cargando contactos...</span>
            </div>
          )}
          <div className="flex justify-between gap-2 mb-4 items-center">
            <div className="flex gap-2">
              <button
                className={`px-4 py-1 rounded-full font-semibold border transition ${
                  filterType === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setFilterType("all")}
              >
                Todos
              </button>
              <button
                className={`px-4 py-1 rounded-full font-semibold border transition ${
                  filterType === "contacts"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setFilterType("contacts")}
              >
                Contactos
              </button>
              <button
                className={`px-4 py-1 rounded-full font-semibold border transition ${
                  filterType === "groups"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setFilterType("groups")}
              >
                Grupos
              </button>
            </div>
            <button
              className="p-2 rounded-full border bg-gray-200 text-gray-700 hover:bg-primary hover:text-white text-xs transition flex items-center justify-center"
              onClick={async () => {
                if (!selectedNumber) return;
                setLoadingContacts(true);
                const token = getToken();
                if (!token) return;
                try {
                  const res = await fetch(
                    `${BACKEND_URL}/api/whatsapp/contacts?numberId=${selectedNumber.id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (res.ok) {
                    const contactList = await res.json();
                    setContacts(
                      uniqueById(
                        (contactList as WhatsAppContact[]).map(
                          (c: WhatsAppContact) => ({ ...c, id: String(c.id) })
                        )
                      )
                    );
                  } else {
                    console.error("Error al obtener contactos:", res.status);
                  }
                } catch (error) {
                  console.error("Error fetching contacts:", error);
                } finally {
                  setLoadingContacts(false);
                }
              }}
              title="Refrescar contactos y grupos desde WhatsApp Web"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          {filterType === "all" && (
            <input
              type="text"
              placeholder="Buscar contacto o grupo..."
              className="mb-2 w-full px-3 py-1 rounded border border-gray-200"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
          )}
          <div className="max-h-[400px] overflow-y-auto space-y-6 flex-1">
            {(filterType === "all" || filterType === "contacts") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-secondary">
                    Contactos
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-primary hover:text-white transition"
                      onClick={handleSelectAll}
                      disabled={isSelectAllDisabled}
                    >
                      Seleccionar todos
                    </button>
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-red-400 hover:text-white transition"
                      onClick={handleDeselectAll}
                      disabled={isDeselectAllDisabled}
                    >
                      Deseleccionar todos
                    </button>
                  </div>
                </div>
                {filterType === "contacts" && (
                  <input
                    type="text"
                    placeholder="Buscar contacto..."
                    className="mb-2 w-full px-3 py-1 rounded border border-gray-200"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                  />
                )}
                {filteredPersonalContacts.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No hay contactos disponibles.
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-2">
                    {filteredPersonalContacts.map(
                      (contact: WhatsAppContact) => (
                        <li
                          key={contact.id}
                          className="flex items-center p-2 rounded hover:bg-gray-100 transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleContactToggle(contact.id)}
                            className="mr-3 accent-primary"
                          />
                          <span
                            className="font-medium text-base max-w-[180px] truncate overflow-hidden whitespace-nowrap"
                            title={contact.name || contact.number}
                          >
                            {contact.name || contact.number}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}
            {(filterType === "all" || filterType === "groups") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-secondary">
                    Grupos
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-primary hover:text-white transition"
                      onClick={() =>
                        setSelectedGroups(groupContacts.map((g) => g.id))
                      }
                      disabled={groupContacts.length === 0}
                    >
                      Seleccionar todos
                    </button>
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-red-400 hover:text-white transition"
                      onClick={() => setSelectedGroups([])}
                      disabled={selectedGroups.length === 0}
                    >
                      Deseleccionar todos
                    </button>
                  </div>
                </div>
                {filterType === "groups" && (
                  <input
                    type="text"
                    placeholder="Buscar grupo..."
                    className="mb-2 w-full px-3 py-1 rounded border border-gray-200"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                )}
                {filterType === "all" && <></>}
                {filteredGroupContacts.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No hay grupos disponibles.
                    <br />
                    Asegúrate de que este número esté agregado a los grupos en
                    WhatsApp y que la sesión esté correctamente sincronizada.
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-2">
                    {filteredGroupContacts.map((group: WhatsAppGroup) => (
                      <li
                        key={group.id}
                        className="flex items-center p-2 rounded hover:bg-gray-100 transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="mr-3 accent-primary"
                        />
                        <span
                          className="font-medium text-base max-w-[180px] truncate overflow-hidden whitespace-nowrap"
                          title={group.name || group.number}
                        >
                          {group.name || group.number}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <button
              className="px-6 py-2 bg-primary text-white rounded-full font-semibold shadow hover:bg-secondary transition disabled:opacity-50"
              disabled={
                (selectedContacts.length === 0 &&
                  selectedGroups.length === 0) ||
                syncingContacts
              }
              onClick={handleSyncSelected}
            >
              {syncingContacts ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sincronizando...
                </div>
              ) : (
                "Sincronizar seleccionados"
              )}
            </button>
            <DialogClose asChild>
              <button className="px-6 py-2 bg-gray-200 rounded-full font-semibold">
                Cerrar
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

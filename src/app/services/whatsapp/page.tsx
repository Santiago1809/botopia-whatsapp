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
  DialogClose
} from "@/components/ui/dialog";
import SyncedSidebar from '@/components/SyncedSidebar';

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
}

interface WhatsAppGroup {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  wa_id?: string;
}

type SyncedItem = {
  wa_id: string;
  [key: string]: unknown;
};

// Utilidad para eliminar duplicados por id
function uniqueById<T extends { id: string | number }>(arr: T[]): T[] {
  const seen = new Set<string | number>();
  return arr.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

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
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [syncedContacts, setSyncedContacts] = useState<WhatsAppContact[]>([]);
  const [syncedGroups, setSyncedGroups] = useState<WhatsAppGroup[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'contacts' | 'groups'>('all');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'contact' | 'group' | null>(null);

  // Separar contactos y grupos (debe ir antes de cualquier uso)
  const personalContacts = uniqueById(
    contacts
      .filter((c) => !c.isGroup && c.isMyContact) // SOLO contactos guardados
      .map(c => ({ ...c, id: String(c.id) }))
  );
  const groupContacts = uniqueById(
    contacts.filter((c) => c.isGroup)
      .map(c => ({ ...c, id: String(c.id) }))
  );
  const filteredPersonalContacts = uniqueById<WhatsAppContact>(
    personalContacts.filter((c: WhatsAppContact) =>
      ((c.name ?? c.number ?? "") as string).toLowerCase().includes(contactSearch.toLowerCase())
    )
  );
  const filteredGroupContacts = uniqueById<WhatsAppGroup>(
    groupContacts.filter((g: WhatsAppGroup) =>
      ((g.name ?? g.number ?? "") as string).toLowerCase().includes(groupSearch.toLowerCase())
    )
  );

  // --- fetchSynced global ---
  const fetchSynced = async () => {
    if (!selectedNumber) return;
    const token = getToken();
    const res = await fetch(`${BACKEND_URL}/api/whatsapp/synced-contacts?numberId=${selectedNumber.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    const contacts = data.filter((x: { type: string }) => x.type === 'contact').map((x: SyncedItem) => ({ ...x, id: x.id, wa_id: x.wa_id }));
    const groups = data.filter((x: { type: string }) => x.type === 'group').map((x: SyncedItem) => ({ ...x, id: x.id, wa_id: x.wa_id }));
    setSyncedContacts(contacts);
    setSyncedGroups(groups);
    // Selecciona automáticamente el primer contacto o grupo sincronizado si hay alguno
    if (contacts.length > 0) {
      setSelectedChatId(contacts[0].wa_id || contacts[0].id);
      setSelectedChatType('contact');
    } else if (groups.length > 0) {
      setSelectedChatId(groups[0].wa_id || groups[0].id);
      setSelectedChatType('group');
    } else {
      setSelectedChatId(null);
      setSelectedChatType(null);
    }
  };

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
          body: JSON.stringify({ enabled: newVal, number: selectedNumber?.number }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`⚠️ Error: ${data.message}`);
          return;
        }

        setSelectedNumber((prev) =>
          prev ? { ...prev, aiEnabled: newVal } : null
        );

        // NUEVO: Actualizar agenteHabilitado en todos los contactos sincronizados
        if (selectedNumber) {
          // Obtener los contactos sincronizados actuales
          const resContacts = await fetch(`${BACKEND_URL}/api/whatsapp/synced-contacts?numberId=${selectedNumber.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          let dataContacts = await resContacts.json();
          if (!Array.isArray(dataContacts)) dataContacts = [];
          const syncedContacts = dataContacts.filter((x: { type: string }) => x.type === 'contact');
          // Actualizar agenteHabilitado para todos los contactos
          await Promise.all(
            syncedContacts.map((c: { id: string; agenteHabilitado: boolean }) =>
              fetch(`${BACKEND_URL}/api/whatsapp/update-agente-habilitado`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id: c.id, agenteHabilitado: newVal })
              })
            )
          );
          // Actualizar el estado local
          setSyncedContacts(prev => prev.map(c => ({ ...c, agenteHabilitado: newVal })));
        }
      } catch (error) {
        console.error("Error actualizando AI:", error);
      } finally {
        // NO tocar setLoadingContacts aquí, el loader solo se activa en flujos de carga reales
        if (!currentAgent) {
          setContactsModalOpen(false);
        }
      }
    },
    [getToken, isAuthenticated, logout, selectedNumber, currentAgent]
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
          body: JSON.stringify({ enabled: newVal, number: selectedNumber?.number }),
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
          const resGroups = await fetch(`${BACKEND_URL}/api/whatsapp/synced-contacts?numberId=${selectedNumber.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          let dataGroups = await resGroups.json();
          if (!Array.isArray(dataGroups)) dataGroups = [];
          const syncedGroups = dataGroups.filter((x: { type: string }) => x.type === 'group');
          // Actualizar agenteHabilitado para todos los grupos
          await Promise.all(
            syncedGroups.map((g: { id: string; agenteHabilitado: boolean }) =>
              fetch(`${BACKEND_URL}/api/whatsapp/update-agente-habilitado`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id: g.id, agenteHabilitado: newVal })
              })
            )
          );
          // Actualizar el estado local
          setSyncedGroups(prev => prev.map(g => ({ ...g, agenteHabilitado: newVal })));
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
        // Loader: empieza la carga
        setLoadingContacts(true);
        // Obtener contactos y mostrar modal
        const token = getToken();
        if (token) {
          try {
            const res = await fetch(
              `${BACKEND_URL}/api/whatsapp/contacts?numberId=${data.numberId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            if (res.ok) {
              const contactList = await res.json();
              setContacts(uniqueById((contactList as WhatsAppContact[]).map((c: WhatsAppContact) => ({ ...c, id: String(c.id) }))));
              setLoadingContacts(false); // Loader: termina la carga
              setContactsModalOpen(true); // Abre el modal automáticamente tras escanear el QR
            } else {
              setLoadingContacts(false);
            }
          } catch (err) {
            setLoadingContacts(false);
            console.error("Error fetching contacts:", err);
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

    // Al recibir un mensaje, selecciona automáticamente el chat
    socket.on("chat-history", (data) => {
      if (data && data.to) {
        const isGroup = data.to.endsWith("@g.us");
        // Siempre selecciona el chat del último mensaje recibido
        setSelectedChatId(data.to);
        setSelectedChatType(isGroup ? "group" : "contact");
      }
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
  }, [socket, selectedNumber, setNumberStatus, whatsappNumbers, removeNumber, getToken]);

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

  const handleContactToggle = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };
  const handleGroupToggle = (id: string) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleSyncSelected = async () => {
    if (!selectedNumber) return;
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp/sync-contacts-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          numberId: selectedNumber.id,
          contacts: personalContacts
            .filter(c => selectedContacts.includes(c.id))
            .map(c => ({
              ...c,
              wa_id: c.wa_id || c.id,
              id: c.wa_id || c.id,
              name: c.name
            })),
          groups: groupContacts
            .filter(g => selectedGroups.includes(g.id))
            .map(g => ({
              ...g,
              wa_id: g.wa_id || g.id,
              id: g.wa_id || g.id,
              name: g.name
            }))
        })
      });
      setContactsModalOpen(false);
      // Refresca sincronizados desde la base de datos
      fetchSynced();
    } catch {
      alert('Error al sincronizar');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSelectSynced = (item: Contact | Group, type: 'contact' | 'group') => {
    setLoadingContacts(false);
    setSelectedChatId(item.wa_id || item.id);
    setSelectedChatType(type);
  };

  // Reemplaza el useEffect de fetchSynced por:
  useEffect(() => {
    fetchSynced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNumber, getToken]);

  // NUEVO: Actualizar agenteHabilitado
  const handleToggleAgente = async (id: string, newValue: boolean) => {
    const token = getToken();
    await fetch(`${BACKEND_URL}/api/whatsapp/update-agente-habilitado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, agenteHabilitado: newValue })
    });
    // Solo actualiza el estado local, NO cambia selectedNumber ni loadingContacts
    setSyncedContacts(prev => prev.map(c => c.id === id ? { ...c, agenteHabilitado: newValue } : c));
    setSyncedGroups(prev => prev.map(g => g.id === id ? { ...g, agenteHabilitado: newValue } : g));
  };

  const handleRemoveContact = async (id: string) => {
    // Elimina de la base de datos
    const token = getToken();
    await fetch(`${BACKEND_URL}/api/whatsapp/delete-synced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    });
    setSyncedContacts(prev => prev.filter(c => c.id !== id));
  };
  const handleRemoveGroup = async (id: string) => {
    const token = getToken();
    await fetch(`${BACKEND_URL}/api/whatsapp/delete-synced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    });
    setSyncedGroups(prev => prev.filter(g => g.id !== id));
  };

  const selectedChat =
    selectedChatType === 'contact'
      ? syncedContacts.find(c => c.wa_id === selectedChatId)
      : selectedChatType === 'group'
        ? syncedGroups.find(g => g.wa_id === selectedChatId)
        : null;

  // Bulk actions
  const handleBulkDelete = async () => {
    const token = getToken();
    const allIds = [...syncedContacts.map(c => c.id), ...syncedGroups.map(g => g.id)];
    await Promise.all(allIds.map(id => fetch(`${BACKEND_URL}/api/whatsapp/delete-synced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id })
    })));
    setSyncedContacts([]);
    setSyncedGroups([]);
  };
  const handleBulkDisable = async () => {
    const token = getToken();
    const contacts = Array.isArray(syncedContacts) ? syncedContacts : [];
    const groups = Array.isArray(syncedGroups) ? syncedGroups : [];
    const updates = [
      ...contacts.map(c => ({ id: c.id, agenteHabilitado: false })),
      ...groups.map(g => ({ id: g.id, agenteHabilitado: false }))
    ];
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp/bulk-update-agente-habilitado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ updates })
      });
      await fetchSynced();
    } catch {
      alert('Error al desactivar todos los agentes');
    }
  };
  const handleBulkEnable = async () => {
    const token = getToken();
    const contacts = Array.isArray(syncedContacts) ? syncedContacts : [];
    const groups = Array.isArray(syncedGroups) ? syncedGroups : [];
    const updates = [
      ...contacts.map(c => ({ id: c.id, agenteHabilitado: true })),
      ...groups.map(g => ({ id: g.id, agenteHabilitado: true }))
    ];
    try {
      await fetch(`${BACKEND_URL}/api/whatsapp/bulk-update-agente-habilitado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ updates })
      });
      await fetchSynced();
    } catch {
      alert('Error al activar todos los agentes');
    }
  };

  // Cuando se selecciona un agente, apaga el loader
  useEffect(() => {
    if (currentAgent) {
      setLoadingContacts(false);
    }
  }, [currentAgent]);

  // Timeout de seguridad para el loader
  useEffect(() => {
    if (loadingContacts) {
      const timeout = setTimeout(() => {
        setLoadingContacts(false);
      }, 1000); // 10 segundos
      return () => clearTimeout(timeout);
    }
  }, [loadingContacts]);

  // Efecto para cargar contactos cada vez que se abre el modal
  useEffect(() => {
    if (contactsModalOpen && selectedNumber) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        const token = getToken();
        if (!token) return;
        try {
          const res = await fetch(
            `${BACKEND_URL}/api/whatsapp/contacts?numberId=${selectedNumber.id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (res.ok) {
            const contactList = await res.json();
            console.log('Contactos recibidos del backend:', contactList);
            setContacts(uniqueById((contactList as WhatsAppContact[]).map((c: WhatsAppContact) => ({ ...c, id: String(c.id) }))));
          } else {
            console.error('Error al obtener contactos:', res.status);
          }
        } catch (err) {
          console.error('Error fetching contacts:', err);
        } finally {
          setLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [contactsModalOpen, selectedNumber]);

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
          setSelectedNumber={setSelectedNumber}
          currentAgent={currentAgent}
          setCurrentAgent={setCurrentAgent}
        />
          <WhatsAppMainContent
            qrCodes={qrCodes}
            selectedNumber={selectedNumber}
          selectedChat={selectedChat}
          />
      </div>
      {/* Sidebar derecho */}
      {selectedNumber && (
        <div className="w-64 bg-gray-50 border-l shadow-lg flex flex-col">
          <SyncedSidebar
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
          />
        </div>
      )}
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
            <DialogTitle className="text-2xl font-bold mb-2 text-primary">Sincronizar contactos y grupos</DialogTitle>
            <DialogDescription className="mb-4 text-gray-600">
              Selecciona los contactos y grupos de WhatsApp que deseas sincronizar con el agente. Puedes actualizar tu selección en cualquier momento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between gap-2 mb-4 items-center">
            <div className="flex gap-2">
              <button
                className={`px-4 py-1 rounded-full font-semibold border transition ${filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilterType('all')}
              >
                Todos
              </button>
              <button
                className={`px-4 py-1 rounded-full font-semibold border transition ${filterType === 'contacts' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilterType('contacts')}
              >
                Contactos
              </button>
              <button
                className={`px-4 py-1 rounded-full font-semibold border transition ${filterType === 'groups' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilterType('groups')}
              >
                Grupos
              </button>
            </div>
            <button
              className="px-3 py-1 rounded-full font-semibold border bg-gray-200 text-gray-700 hover:bg-primary hover:text-white text-xs transition"
              onClick={async () => {
                if (!selectedNumber) return;
                setLoadingContacts(true);
                const token = getToken();
                if (!token) return;
                try {
                  const res = await fetch(
                    `${BACKEND_URL}/api/whatsapp/contacts?numberId=${selectedNumber.id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` }
                    }
                  );
                  if (res.ok) {
                    const contactList = await res.json();
                    setContacts(uniqueById((contactList as WhatsAppContact[]).map((c: WhatsAppContact) => ({ ...c, id: String(c.id) }))));
                  } else {
                    console.error('Error al obtener contactos:', res.status);
                  }
                } catch (err) {
                  console.error('Error fetching contacts:', err);
                } finally {
                  setLoadingContacts(false);
                }
              }}
              title="Refrescar contactos y grupos desde WhatsApp Web"
            >
              Refrescar contactos y grupos
            </button>
          </div>
          {(filterType === 'all') && (
            <input
              type="text"
              placeholder="Buscar contacto o grupo..."
              className="mb-2 w-full px-3 py-1 rounded border border-gray-200"
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
            />
          )}
          <div className="max-h-[400px] overflow-y-auto space-y-6 flex-1">
            {(filterType === 'all' || filterType === 'contacts') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-secondary">Contactos</h3>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-primary hover:text-white transition"
                      onClick={() => setSelectedContacts(personalContacts.map((c) => c.id))}
                      disabled={personalContacts.length === 0}
                    >
                      Seleccionar todos
                    </button>
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-red-400 hover:text-white transition"
                      onClick={() => setSelectedContacts([])}
                      disabled={selectedContacts.length === 0}
                    >
                      Deseleccionar todos
                    </button>
                  </div>
                </div>
                {filterType === 'contacts' && (
                  <input
                    type="text"
                    placeholder="Buscar contacto..."
                    className="mb-2 w-full px-3 py-1 rounded border border-gray-200"
                    value={contactSearch}
                    onChange={e => setContactSearch(e.target.value)}
                  />
                )}
                {filteredPersonalContacts.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay contactos disponibles.</div>
                ) : (
                  <ul className="grid grid-cols-1 gap-2">
                    {filteredPersonalContacts.map((contact: WhatsAppContact) => (
                      <li key={contact.id} className="flex items-center p-2 rounded hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleContactToggle(contact.id)}
                          className="mr-3 accent-primary"
                        />
                        <span className="font-medium text-base">{contact.name || contact.number}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {(filterType === 'all' || filterType === 'groups') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-secondary">Grupos</h3>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-3 py-1 bg-gray-200 rounded-full hover:bg-primary hover:text-white transition"
                      onClick={() => setSelectedGroups(groupContacts.map((g) => g.id))}
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
                {filterType === 'groups' && (
                  <input
                    type="text"
                    placeholder="Buscar grupo..."
                    className="mb-2 w-full px-3 py-1 rounded border border-gray-200"
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                  />
                )}
                {filterType === 'all' && (
                  <></>
                )}
                {filteredGroupContacts.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No hay grupos disponibles.<br />
                    Asegúrate de que este número esté agregado a los grupos en WhatsApp y que la sesión esté correctamente sincronizada.
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-2">
                    {filteredGroupContacts.map((group: WhatsAppGroup) => (
                      <li key={group.id} className="flex items-center p-2 rounded hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="mr-3 accent-primary"
                        />
                        <span className="font-medium text-base">{group.name || group.number}</span>
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
              disabled={selectedContacts.length === 0 && selectedGroups.length === 0}
              onClick={handleSyncSelected}
            >
              Sincronizar seleccionados
            </button>
            <DialogClose asChild>
              <button className="px-6 py-2 bg-gray-200 rounded-full font-semibold">Cerrar</button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Trash,
  Users,
  UserCheck,
  UserX,
  RefreshCcw,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { Contact, Group } from "@/types/global";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface SyncedSidebarProps {
  contacts: Contact[];
  groups: Group[];
  unsyncedContacts?: Contact[];
  onSelect: (item: Contact | Group, type: "contact" | "group") => void;
  onSyncClick: () => void;
  onRemoveContact: (id: string) => void;
  onRemoveGroup: (id: string) => void;
  selectedId?: string;
  selectedType?: "contact" | "group";
  onToggleAgente?: (id: string, newValue: boolean) => void;
  onBulkDelete?: () => void;
  onBulkDisable?: () => void;
  onBulkEnable?: () => void;
  selectedNumberId?: string;
}

// Estado local optimista para agenteHabilitado
interface LocalAgenteState { [id: string]: boolean | undefined }

const SyncedSidebar: React.FC<SyncedSidebarProps> = ({
  contacts,
  groups,
  unsyncedContacts = [],
  onSelect,
  onSyncClick,
  onRemoveContact,
  onRemoveGroup,
  selectedId,
  selectedType,
  onToggleAgente,
  onBulkDelete,
  onBulkDisable,
  onBulkEnable,
  selectedNumberId,
}) => {
  // Filtro de búsqueda y tipo
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "contacts" | "groups" | "unsynced"
  >("all");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showActions, setShowActions] = useState(false);

  // Estado local optimista para agenteHabilitado
  const [localAgente, setLocalAgente] = useState<LocalAgenteState>({});

  // Sincroniza el estado local con los props cuando cambian
  useEffect(() => {
    const estado: LocalAgenteState = {};
    contacts.forEach((c) => (estado[c.id.toString()] = c.agenteHabilitado));
    groups.forEach((g) => (estado[g.id.toString()] = g.agenteHabilitado));
    unsyncedContacts.forEach((c) => (estado[c.id.toString()] = c.agenteHabilitado));
    setLocalAgente(estado);
  }, [contacts, groups, unsyncedContacts]);

  // Inicializar socket
  React.useEffect(() => {
    const newSocket = io(BACKEND_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    // Escuchar actualizaciones de contactos no sincronizados
    newSocket.on("unsynced-contacts-updated", (data) => {
      if (
        data.numberid &&
        data.numberid.toString() === selectedNumberId?.toString()
      ) {
        fetch(
          `${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumberId}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              // Actualiza el estado local de los contactos no sincronizados
              if (typeof window !== "undefined" && window.dispatchEvent) {
                window.dispatchEvent(
                  new CustomEvent("updateUnsyncedContacts", { detail: data })
                );
              }
            }
          });
      }
    });

    return () => {
      newSocket.disconnect();
      newSocket.off("unsynced-contacts-updated");
    };
  }, [selectedNumberId]);

  // Escuchar evento global para actualizar la prop unsyncedContacts si el padre lo permite
  React.useEffect(() => {
    function handleUpdateUnsyncedContacts(e: CustomEvent) {
      if (typeof e.detail !== "undefined" && Array.isArray(e.detail)) {
        // Si tienes un setter para unsyncedContacts, úsalo aquí
        // Si no, puedes levantar un callback al padre si lo deseas
        // Por defecto, solo fuerza un re-render si la prop cambia en el padre
      }
    }
    window.addEventListener(
      "updateUnsyncedContacts",
      handleUpdateUnsyncedContacts as EventListener
    );
    return () =>
      window.removeEventListener(
        "updateUnsyncedContacts",
        handleUpdateUnsyncedContacts as EventListener
      );
  }, []);

  // Ordenar contactos y grupos por último mensaje
  const orderedContacts = [...contacts].sort(
    (a: Contact, b: Contact) =>
      (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
  );
  const orderedGroups = [...groups].sort(
    (a: Group, b: Group) =>
      (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)
  );

  // Filtrado
  const filteredContacts = orderedContacts.filter((c) =>
    ((c.name ?? c.number ?? "") + "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const filteredGroups = orderedGroups.filter((g) =>
    ((g.name ?? g.number ?? "") + "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Filter unsynced contacts (excluye grupos y contactos especiales de WhatsApp)
  const filteredUnsyncedContacts = unsyncedContacts.filter((c) => {
    const name = (c.name ?? "").toLowerCase().trim();
    if (
      ["status", "estado", "ia status", "ia", "statuses", "estados"].includes(
        name
      )
    )
      return false;
    // Excluir grupos: si wa_id o id termina en '@g.us' o si el número/id tiene más de 15 dígitos
    const waId = (c.wa_id ?? c.id ?? "").toLowerCase();
    if (waId.endsWith("@g.us")) return false;
    const num = (c.number ?? c.id ?? "").replace(/[^0-9]/g, "");
    if (num.length > 15) return false;
    return ((c.name ?? c.number ?? "") + "")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleSelect = (item: Contact | Group, type: "contact" | "group") => {
    onSelect(item, type);
    if (socket && selectedNumberId) {
      socket.emit("get-chat-history", {
        numberId: selectedNumberId,
        to: item.wa_id || item.id,
      });
    }
  };

  // Función para formatear la hora del último mensaje
  const formatLastMessageTime = (timestamp?: number) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };
  return (
    <div className="h-full w-[320px] flex flex-col relative">
      {/* Cabecera con estilo Botopia */}
      <div className="bg-gradient-to-l h-8 from-[#411E8A] to-[#050044] text-white flex justify-between items-center px-4 py-8 shadow-md z-10">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <Filter className="w-5 h-5 text-white" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>{" "}
        {/* Menú desplegable de acciones */}
        {showActions && (
          <div className="absolute right-4 top-12 bg-white dark:bg-[hsl(240,10%,14%)] rounded-xl py-2 z-50 w-52 border border-gray-100 dark:border-[hsl(240,10%,20%)]">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#FAECD4] text-left transition-colors"
              onClick={async () => {
                setShowActions(false);
                if (
                  window.confirm(
                    "¿Eliminar TODOS los contactos y no sincronizados de este número?"
                  )
                ) {
                  if (selectedNumberId) {
                    await fetch(
                      `${BACKEND_URL}/api/unsyncedcontacts/by-number/${selectedNumberId}`,
                      { method: "DELETE" }
                    );
                  }
                  if (onBulkDelete) onBulkDelete();
                }
              }}
            >
              <Trash className="w-4 h-4 text-red-500" />
              <span className="text-[#010009]">Eliminar todos</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#FAECD4] text-left transition-colors"
              onClick={async () => {
                setShowActions(false);
                if (unsyncedContacts.length > 0) {
                  unsyncedContacts.forEach((c) => {
                    if (onToggleAgente) onToggleAgente(c.id, false);
                  });
                }
                if (onBulkDisable) await onBulkDisable();
                if (selectedNumberId && unsyncedContacts.length > 0) {
                  await Promise.all(
                    unsyncedContacts.map(async (contact) => {
                      await fetch(
                        `${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ agentehabilitado: false }),
                        }
                      );
                    })
                  );
                }
              }}
            >
              <UserX className="w-4 h-4 text-yellow-600" />
              <span className="text-[#010009]">Desactivar todos</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#FAECD4] text-left transition-colors"
              onClick={async () => {
                setShowActions(false);
                if (unsyncedContacts.length > 0) {
                  unsyncedContacts.forEach((c) => {
                    if (onToggleAgente) onToggleAgente(c.id, true);
                  });
                }
                if (onBulkEnable) await onBulkEnable();
                if (selectedNumberId && unsyncedContacts.length > 0) {
                  await Promise.all(
                    unsyncedContacts.map(async (contact) => {
                      await fetch(
                        `${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ agentehabilitado: true }),
                        }
                      );
                    })
                  );
                }
              }}
            >
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-[#010009]">Activar todos</span>
            </button>
            <div className="my-2 border-t border-gray-100"></div>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#FAECD4] text-left transition-colors"
              onClick={() => {
                setShowActions(false);
                onSyncClick();
              }}
            >
              <RefreshCcw className="w-4 h-4 text-[#411E8A]" />
              <span className="text-[#010009]">Sincronizar ahora</span>
            </button>
          </div>
        )}
      </div>{" "}
      {/* Input de búsqueda en la parte superior con estilo Botopia */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#FAECD4]/50 to-white dark:from-[hsl(240,10%,5%)] dark:to-[hsl(240,10%,10%)] px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#411E8A] dark:text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar o iniciar un nuevo chat"
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white dark:bg-[hsl(240,10%,14%)] border border-[#411E8A]/20 dark:border-[hsl(240,10%,20%)] focus:ring-2 focus:ring-[#411E8A]/30 dark:focus:ring-[hsl(240,10%,30%)] focus:border-[#411E8A] focus:outline-none transition-all dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>{" "}
      {/* Filtro visual mejorado tipo Botopia */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white dark:bg-[hsl(240,10%,14%)] border-b border-[#FAECD4] dark:border-[hsl(240,10%,20%)]">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            filterType === "all"
              ? "bg-gradient-to-r from-[#411E8A] to-[#050044] text-white shadow-md"
              : "text-[#050044] dark:text-gray-200 hover:bg-[#FAECD4]/50 dark:hover:bg-[hsl(240,10%,20%)]"
          }`}
          onClick={() => setFilterType("all")}
        >
          Todos
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            filterType === "contacts"
              ? "bg-gradient-to-r from-[#411E8A] to-[#050044] text-white shadow-md"
              : "text-[#050044] dark:text-gray-200 hover:bg-[#FAECD4]/50 dark:hover:bg-[hsl(240,10%,20%)]"
          }`}
          onClick={() => setFilterType("contacts")}
        >
          Contactos
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            filterType === "groups"
              ? "bg-gradient-to-r from-[#411E8A] to-[#050044] text-white shadow-md"
              : "text-[#050044] dark:text-gray-200 hover:bg-[#FAECD4]/50 dark:hover:bg-[hsl(240,10%,20%)]"
          }`}
          onClick={() => setFilterType("groups")}
        >
          Grupos
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            filterType === "unsynced"
              ? "bg-gradient-to-r from-[#411E8A] to-[#050044] text-white shadow-md"
              : "text-[#050044] dark:text-gray-200 hover:bg-[#FAECD4]/50 dark:hover:bg-[hsl(240,10%,20%)]"
          }`}
          onClick={() => setFilterType("unsynced")}
        >
          No Sincronizados
        </button>
      </div>{" "}
      {/* Lista de contactos y grupos con estilo Botopia */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-[#FAECD4]/20 dark:from-[hsl(240,10%,10%)] dark:to-[hsl(240,10%,5%)]">
        {(filterType === "all" || filterType === "contacts") && (
          <div>
            {filteredContacts.length === 0 ? (
              <div className="text-sm text-[#050044] dark:text-gray-300 p-4 text-center">
                No hay contactos sincronizados
              </div>
            ) : (
              <ul>
                {filteredContacts.map((contact) => (
                  <li
                    key={contact.id}
                    className={`py-4 flex items-center px-4 cursor-pointer transition-all hover:bg-[#FAECD4]/30 dark:hover:bg-[hsl(240,10%,15%)] ${
                      selectedId === contact.id && selectedType === "contact"
                        ? "bg-gradient-to-r from-[#FAECD4] to-[#FAECD4]/60 dark:from-[hsl(240,10%,14%)] dark:to-[hsl(240,10%,10%)] border-l-4 border-[#411E8A]"
                        : ""
                    }`}
                    onClick={() => handleSelect(contact, "contact")}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#411E8A] to-[#050044] flex items-center justify-center text-white font-bold flex-shrink-0 mr-3">
                      {contact.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-[#010009] dark:text-white truncate pr-2">
                          {contact.name || contact.number || "Sin nombre"}
                        </h3>
                        <span className="text-xs text-[#411E8A] dark:text-gray-300 whitespace-nowrap font-medium">
                          {formatLastMessageTime(contact.lastMessageTimestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        {" "}
                        <p className="text-sm text-[#050044] dark:text-gray-400 truncate pr-2">
                          {contact.lastMessagePreview || "Sin mensajes"}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleAgente) {
                                setLocalAgente((prev) => ({
                                  ...prev,
                                  [contact.id.toString()]: !localAgente[contact.id.toString()],
                                }));
                                onToggleAgente(contact.id, !localAgente[contact.id.toString()]);
                              }
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                              localAgente[contact.id.toString()]
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                                : "bg-gray-200 text-[#050044] hover:bg-[#FAECD4]"
                            }`}
                            title={
                              localAgente[contact.id.toString()] ? "Desactivar IA" : "Activar IA"
                            }
                          >
                            <UserCheck className="size-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("¿Eliminar este contacto?"))
                                onRemoveContact(contact.id);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
                            title="Eliminar contacto"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}{" "}
        {(filterType === "all" || filterType === "groups") &&
          filteredGroups.length > 0 && (
            <div>
              <ul>
                {filteredGroups.map((group) => (
                  <li
                    key={group.id}
                    className={`py-4 flex items-center px-4 cursor-pointer transition-all hover:bg-[#FAECD4]/30 ${
                      selectedId === group.id && selectedType === "group"
                        ? "bg-gradient-to-r from-[#FAECD4] to-[#FAECD4]/60 border-l-4 border-[#411E8A]"
                        : ""
                    }`}
                    onClick={() => handleSelect(group, "group")}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#411E8A] to-[#050044] flex items-center justify-center text-white flex-shrink-0 mr-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-[#010009] truncate pr-2">
                          {group.name || "Grupo sin nombre"}
                        </h3>
                        <span className="text-xs text-[#411E8A] whitespace-nowrap font-medium">
                          {formatLastMessageTime(group.lastMessageTimestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        {" "}
                        <p className="text-sm text-[#050044] truncate pr-2">
                          {group.lastMessagePreview || "Sin mensajes"}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleAgente) {
                                setLocalAgente((prev) => ({
                                  ...prev,
                                  [group.id.toString()]: !localAgente[group.id.toString()],
                                }));
                                onToggleAgente(group.id, !localAgente[group.id.toString()]);
                              }
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                              localAgente[group.id.toString()]
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                                : "bg-gray-200 text-[#050044] hover:bg-[#FAECD4]"
                            }`}
                            title={
                              localAgente[group.id.toString()] ? "Desactivar IA" : "Activar IA"
                            }
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("¿Eliminar este grupo?"))
                                onRemoveGroup(group.id);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
                            title="Eliminar grupo"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        {(filterType === "all" || filterType === "unsynced") &&
          filteredUnsyncedContacts.length > 0 && (
            <div>
              <div className="py-2 px-4 bg-[#f0f2f5]">
                <h3 className="text-xs font-medium text-[#54656f] uppercase">
                  Contactos no sincronizados
                </h3>
              </div>
              <ul>
                {filteredUnsyncedContacts.map((contact) => (
                  <li
                    key={contact.id}
                    className={`py-3 flex items-center px-3 cursor-pointer ${
                      selectedId === contact.id && selectedType === "contact"
                        ? "bg-[#f0f2f5]"
                        : ""
                    }`}
                    onClick={() => handleSelect(contact, "contact")}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#DFE5E7] flex items-center justify-center text-[#54656f] flex-shrink-0 mr-3 relative">
                      {contact.name?.charAt(0)?.toUpperCase() || "C"}
                      <input
                        type="checkbox"
                        checked={localAgente[contact.id.toString()] === true}
                        onChange={async (e) => {
                          e.stopPropagation();
                          if (onToggleAgente) {
                            setLocalAgente((prev) => ({
                              ...prev,
                              [contact.id.toString()]: e.target.checked,
                            }));
                            onToggleAgente(contact.id, e.target.checked);
                          }
                          try {
                            await fetch(
                              `${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  agentehabilitado: e.target.checked,
                                }),
                              }
                            );
                          } catch (error) {
                            if (onToggleAgente)
                              onToggleAgente(contact.id, !e.target.checked);
                            console.error(
                              "Error al actualizar el estado del agente:",
                              error
                            );
                          }
                        }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 accent-[#25D366] rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-[#111b21] truncate pr-2">
                          {contact.name || contact.number || "Sin nombre"}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-[#667781] truncate pr-2">
                          {localAgente[contact.id.toString()] ? (
                            <span className="text-[#25D366]">IA activada</span>
                          ) : (
                            <span className="text-[#667781]">
                              IA desactivada
                            </span>
                          )}
                        </p>
                        <button
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#f0f2f5] dark:hover:bg-[hsl(240,10%,20%)] text-[#54656f] dark:text-gray-300"
                          title="Eliminar contacto no sincronizado"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "¿Eliminar este contacto no sincronizado?"
                              )
                            ) {
                              try {
                                await fetch(
                                  `${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`,
                                  { method: "DELETE" }
                                );
                                if (onRemoveContact)
                                  onRemoveContact(contact.id);
                              } catch (error) {
                                console.error(
                                  "Error al eliminar el contacto:",
                                  error
                                );
                              }
                            }
                          }}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        {/* Mensajes de estado vacío */}
        {filterType === "contacts" && filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8 text-[#54656f]" />
            </div>
            <h3 className="text-[#111b21] font-medium mb-1">
              No hay contactos sincronizados
            </h3>
            <p className="text-sm text-[#667781] max-w-xs">
              Sincroniza tus contactos para ver tu lista aquí
            </p>
          </div>
        )}
        {filterType === "groups" && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-[#54656f]" />
            </div>
            <h3 className="text-[#111b21] font-medium mb-1">
              No hay grupos sincronizados
            </h3>
            <p className="text-sm text-[#667781] max-w-xs">
              Sincroniza tus grupos para ver tu lista aquí
            </p>
          </div>
        )}
        {filterType === "unsynced" && filteredUnsyncedContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center mb-4">
              <UserX className="w-8 h-8 text-[#54656f]" />
            </div>
            <h3 className="text-[#111b21] font-medium mb-1">
              No hay contactos no sincronizados
            </h3>
            <p className="text-sm text-[#667781] max-w-xs">
              Los contactos que te escriban por primera vez aparecerán aquí
            </p>
          </div>
        )}
      </div>
      {/* Botón flotante de sincronización */}
      <button
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#128C7E] dark:hover:bg-[#0D6D54] transition-colors z-10"
        onClick={onSyncClick}
        title="Sincronizar contactos y grupos"
      >
        <RefreshCcw className="w-6 h-6" />
      </button>
    </div>
  );
};

export default SyncedSidebar;

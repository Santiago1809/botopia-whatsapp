import { Agent, WhatsappNumber } from "@/types/gobal";
import {
  Menu as MenuIcon,
  User,
  Users,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import WhatsAppAgentSelector from "./WhatsAppAgentSelector";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar } from "./ui/avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Contact, Group } from "@/types/global";
import { useState } from "react";

interface WhatsAppHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  selectedNumber: WhatsappNumber | null;
  toggleAi: (numberId: string | number, newVal: boolean) => void;
  toggleGroups: (numberId: string | number, newVal: boolean) => void;
  toggleUnknownAi: (numberId: string | number, newVal: boolean) => void;
  setSelectedNumber: (number: WhatsappNumber | null) => void;
  currentAgent: Agent | null;
  setCurrentAgent: (agent: Agent | null) => void;
  selectedChat?: (Contact | Group) | null;
  syncedContacts?: Contact[];
  syncedGroups?: Group[];
  unsyncedContacts?: Contact[];
  onSelectContact?: (item: Contact | Group, type: "contact" | "group") => void;
  onToggleAgente?: (id: string, newValue: boolean) => void;
  onRemoveContact?: (id: string) => void;
  onRemoveGroup?: (id: string) => void;
}

export default function WhatsAppHeader({
  setSidebarOpen,
  sidebarOpen,
  selectedNumber,
  toggleAi,
  toggleGroups,
  toggleUnknownAi,
  setSelectedNumber,
  currentAgent,
  setCurrentAgent,
  selectedChat,
  syncedContacts = [],
  syncedGroups = [],
  unsyncedContacts = [],
  onSelectContact,
  onToggleAgente,
  onRemoveContact,
  onRemoveGroup,
}: WhatsAppHeaderProps) {
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "contacts" | "groups" | "unsynced"
  >("contacts");

  // Filtrar contactos según el término de búsqueda
  const filteredContacts = syncedContacts.filter((contact) =>
    (contact.name || contact.number || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredGroups = syncedGroups.filter((group) =>
    (group.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnsyncedContacts = unsyncedContacts.filter((contact) =>
    (contact.name || contact.number || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Función para manejar la selección de un contacto
  const handleSelectContact = (
    item: Contact | Group,
    type: "contact" | "group"
  ) => {
    if (onSelectContact) {
      onSelectContact(item, type);
      setContactsModalOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-between h-4 p-8 bg-secondary dark:bg-primary text-white sticky top-0 z-20 w-full">
      <div className="flex items-center gap-2 w-full">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full text-white hover:bg-primary"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </Button>{" "}
        {selectedNumber && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-center gap-2">
              <Avatar className="h-8 w-8 bg-gray-300 flex items-center justify-center">
                {selectedChat ? (
                  "isGroup" in selectedChat && selectedChat.isGroup ? (
                    <Users className="h-5 w-5 text-gray-600" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600 font-semibold">
                      {selectedChat.name?.charAt(0)?.toUpperCase() ||
                        selectedChat.number?.charAt(0)?.toUpperCase() ||
                        "C"}
                    </div>
                  )
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </Avatar>
              <div>
                <span className="text-sm font-semibold text-white">
                  {selectedChat?.name ||
                    (selectedNumber ? selectedNumber.name : "")}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Botón para mostrar contactos en móvil */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full text-white hover:bg-primary"
                onClick={() => setContactsModalOpen(true)}
              >
                <UserPlus className="h-5 w-5" />
              </Button>

              {selectedNumber && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-white bg-primary hover:bg-primary/50 rounded px-2"
                      >
                        {currentAgent
                          ? currentAgent.title
                          : "Seleccionar Agente"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-3xl">
                      <DialogTitle>Seleccionar agente</DialogTitle>
                      <WhatsAppAgentSelector
                        setSelectedNumber={setSelectedNumber}
                        currentAgent={currentAgent}
                        selectedNumber={selectedNumber}
                        setCurrentAgent={setCurrentAgent}
                      />
                    </DialogContent>
                  </Dialog>

                  <div className="hidden md:flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 bg-primary p-1 rounded-full">
                      <Switch
                        id={`ai-${selectedNumber.id}`}
                        checked={Boolean(selectedNumber?.aiEnabled)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                        onCheckedChange={(checked) => {
                          toggleAi(selectedNumber.number, checked);
                        }}
                      />
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        IA
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-primary p-1 rounded-full">
                      <Switch
                        id={`groups-${selectedNumber.id}`}
                        checked={Boolean(selectedNumber?.responseGroups)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                        onCheckedChange={(check) =>
                          toggleGroups(selectedNumber.number, check)
                        }
                      />
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        Grupos
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-primary p-1 rounded-full">
                      <Switch
                        id={`unknown-${selectedNumber.id}`}
                        checked={Boolean(selectedNumber?.aiUnknownEnabled)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                        onCheckedChange={(check) =>
                          toggleUnknownAi(selectedNumber.number, check)
                        }
                      />
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        No agregados
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {!selectedNumber && <div className="text-white font-medium"></div>}
      </div>

      {/* Modal de contactos para móvil */}
      <Dialog open={contactsModalOpen} onOpenChange={setContactsModalOpen}>
        <DialogContent className="sm:max-w-md p-0 h-[85vh] flex flex-col">
          <div className="sticky top-0 bg-white p-4 flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">
              Contactos
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setContactsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Barra de búsqueda */}
          <div className="p-3 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar contactos..."
                className="w-full pl-10 py-2 pr-4 bg-white rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "contacts"
                  ? "text-white bg-primary/20 border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("contacts")}
            >
              Contactos
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "groups"
                  ? "text-white bg-primary/20 border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("groups")}
            >
              Grupos
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "unsynced"
                  ? "text-white bg-primary/20 border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("unsynced")}
            >
              No Sincronizados
            </button>
          </div>

          {/* Lista de contactos */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "contacts" && (
              <div>
                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay contactos sincronizados
                  </div>
                ) : (
                  <ul>
                    {filteredContacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="py-3 px-4 flex items-center"
                        onClick={() => handleSelectContact(contact, "contact")}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 mr-3">
                          {contact.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {contact.name || contact.number || "Sin nombre"}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {contact.agenteHabilitado
                              ? "IA activada"
                              : "IA desactivada"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleAgente) {
                                onToggleAgente(
                                  contact.id,
                                  !contact.agenteHabilitado
                                );
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              contact.agenteHabilitado
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm("¿Eliminar este contacto?") &&
                                onRemoveContact
                              ) {
                                onRemoveContact(contact.id);
                              }
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-200"
                            title="Eliminar contacto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "groups" && (
              <div>
                {filteredGroups.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay grupos sincronizados
                  </div>
                ) : (
                  <ul>
                    {filteredGroups.map((group) => (
                      <li
                        key={group.id}
                        className="py-3 px-4 flex items-center"
                        onClick={() => handleSelectContact(group, "group")}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 mr-3">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {group.name || "Grupo sin nombre"}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {group.agenteHabilitado
                              ? "IA activada"
                              : "IA desactivada"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleAgente) {
                                onToggleAgente(
                                  group.id,
                                  !group.agenteHabilitado
                                );
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              group.agenteHabilitado
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm("¿Eliminar este grupo?") &&
                                onRemoveGroup
                              ) {
                                onRemoveGroup(group.id);
                              }
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-200"
                            title="Eliminar grupo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "unsynced" && (
              <div>
                {filteredUnsyncedContacts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay contactos no sincronizados
                  </div>
                ) : (
                  <ul>
                    {filteredUnsyncedContacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="py-3 px-4 flex items-center"
                        onClick={() => handleSelectContact(contact, "contact")}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0 mr-3">
                          {contact.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {contact.name || contact.number || "Sin nombre"}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {contact.agenteHabilitado
                              ? "IA activada"
                              : "IA desactivada"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleAgente) {
                                onToggleAgente(
                                  contact.id,
                                  !contact.agenteHabilitado
                                );
                              }
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              contact.agenteHabilitado
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "¿Eliminar este contacto no sincronizado?"
                                ) &&
                                onRemoveContact
                              ) {
                                onRemoveContact(contact.id);
                              }
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-200"
                            title="Eliminar contacto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useAuth } from "@/lib/auth";
import { Agent, WhatsappNumber } from "@/types/gobal";
import { Check, Edit, Trash, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Type definitions

interface NewAgent {
  title: string;
  prompt: string;
  allowAdvisor: boolean;
  advisorEmail: string;
}

interface AgentSelectorProps {
  selectedNumber: WhatsappNumber | null;
  setSelectedNumber: (val: WhatsappNumber | null) => void;
  currentAgent: Agent | null;
  setCurrentAgent: (agent: Agent | null) => void;
}

const PROMPT_ASESOR = `\nSi detectas que el cliente quiere hablar con un asesor humano, responde exactamente: "Ya en un momento te ponemos en contacto con uno". No intentes resolver tú la solicitud, solo informa que será transferido a un asesor. No des más detalles ni alternativas. Si el cliente responde con un "gracias" o algo similar, responde: "¡Estamos para servirle!"`;

const PROMPT_IGNORE_CONTEXT = `\nIgnora el contexto de mensajes antiguos. Solo toma en cuenta los mensajes recientes del usuario (por ejemplo, los últimos 2-3 mensajes, o los de los últimos 5 minutos). No uses mensajes de hace más de 5 minutos. Si el usuario solo saluda, olvida el contexto.`;

export default function WhatsAppAgentSelector({
  selectedNumber,
  setSelectedNumber,
  currentAgent,
  setCurrentAgent,
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newAgent, setNewAgent] = useState<NewAgent>({ 
    title: "", 
    prompt: "", 
    allowAdvisor: false,
    advisorEmail: ""
  });
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
  const { token } = useAuth();
  const [editingAllowAdvisor, setEditingAllowAdvisor] = useState(false);
  const [editingAdvisorEmail, setEditingAdvisorEmail] = useState("");

  const handleClick = (agent: Agent) => {
    if (currentAgent?.id !== agent.id) {
      setCurrentAgent(agent);
      if (selectedNumber) {
        setSelectedNumber({ ...selectedNumber, aiPrompt: agent.prompt });
      }
    } else {
      setCurrentAgent(null);
      if (selectedNumber) {
        setSelectedNumber({ ...selectedNumber, aiPrompt: "" });
      }
    }
  };

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(
          `Error obteniendo la lista de agentes: ${res.statusText}`
        );
      }

      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error("❌ Error obteniendo la lista de agentes:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createAgent = async () => {
    if (!newAgent.title || !newAgent.prompt) return;
    try {
      let finalPrompt = newAgent.prompt;
      if (newAgent.allowAdvisor) {
        // Evita duplicar el prompt asesor si ya existe
        if (!finalPrompt.includes('Si detectas que el cliente quiere hablar con un asesor humano')) {
          finalPrompt = `${finalPrompt}\n${PROMPT_ASESOR}`;
        }
        // Añadir instrucción de ignorar contexto si no está
        if (!finalPrompt.includes('Ignora el contexto de mensajes antiguos')) {
          finalPrompt = `${finalPrompt}\n${PROMPT_IGNORE_CONTEXT}`;
        }
      }
      const response = await fetch(`${BACKEND_URL}/api/user/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAgent,
          prompt: finalPrompt,
          allowAdvisor: !!newAgent.allowAdvisor,
          advisorEmail: newAgent.allowAdvisor ? newAgent.advisorEmail : null
        }),
      });
      if (!response.ok) {
        throw new Error("Error creando agente");
      }
      await fetchAgents();
      setNewAgent({ title: "", prompt: "", allowAdvisor: false, advisorEmail: "" });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("❌ Error creando agente:", error);
    }
  };

  const updateAgent = async () => {
    if (!editingAgent?.title || !editingAgent?.prompt) return;
    try {
      let finalPrompt = editingAgent.prompt;
      if (editingAllowAdvisor) {
        // Evita duplicar el prompt asesor si ya existe
        if (!finalPrompt.includes('Si detectas que el cliente quiere hablar con un asesor humano')) {
          finalPrompt = `${finalPrompt}\n${PROMPT_ASESOR}`;
        }
      } else {
        // Si se desactiva, elimina el prompt asesor si estaba
        finalPrompt = finalPrompt.replace(/\n?Si detectas que el cliente quiere hablar con un asesor humano[\s\S]*/, '').trim();
      }
      const response = await fetch(
        `${BACKEND_URL}/api/user/agents/${editingAgent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editingAgent,
            prompt: finalPrompt,
            allowAdvisor: !!editingAllowAdvisor,
            advisorEmail: editingAllowAdvisor ? editingAdvisorEmail : null
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error actualizando agente");
      }
      await fetchAgents();
      setEditingAgent(null);
    } catch (error) {
      console.error("❌ Error actualizando agente:", error);
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user/agents/${agentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Error eliminando agente");
      }

      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    } catch (error) {
      console.error("❌ Error eliminando agente:", error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filtrar solo los agentes del usuario
  const userAgents = agents.filter((agent) => agent.isGlobal === false);

  // Efecto para deseleccionar el texto cuando se abre el modal de edición
  useEffect(() => {
    if (editingAgent) {
      // Pequeño retraso para asegurarnos que el input esté renderizado
      const timer = setTimeout(() => {
        // Deseleccionar cualquier texto seleccionado en el documento
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }

        // También enfocamos en el input pero sin seleccionar su contenido
        const titleInput = document.getElementById("edit-title");
        if (titleInput) {
          titleInput.blur();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [editingAgent]);

  // Cuando se abre el modal de edición, usa los valores reales del agente
  useEffect(() => {
    if (editingAgent) {
      setEditingAllowAdvisor(!!editingAgent.allowAdvisor);
      setEditingAdvisorEmail(editingAgent.advisorEmail || "");
    }
  }, [editingAgent]);

  return (
    <div className="space-y-5 min-h-[500px]">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Mis Agentes</h3>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-primary text-white font-medium flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Crear Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Crear Nuevo Agente
              </DialogTitle>
              <p className="text-gray-500 text-sm">
                Personaliza tu agente con un título y prompt
              </p>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Título
                </label>
                <Input
                  id="title"
                  placeholder="Nombre para tu agente"
                  value={newAgent.title}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, title: e.target.value })
                  }
                  className="focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="text-sm font-medium text-gray-700"
                >
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  placeholder="Instrucciones para tu agente..."
                  value={newAgent.prompt}
                  onChange={(e) =>
                    setNewAgent({ ...newAgent, prompt: e.target.value })
                  }
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAgent.allowAdvisor}
                    onChange={(e) =>
                      setNewAgent({ ...newAgent, allowAdvisor: e.target.checked })
                    }
                    className="accent-primary scale-110"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Permitir enviar mensajes a un asesor
                  </span>
                </label>
                {newAgent.allowAdvisor && (
                  <div className="mt-2">
                    <label
                      htmlFor="advisorEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Correo del asesor
                    </label>
                    <Input
                      id="advisorEmail"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={newAgent.advisorEmail}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, advisorEmail: e.target.value })
                      }
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button
              className="w-full bg-secondary hover:bg-primary text-white font-medium py-2"
              onClick={createAgent}
              disabled={!newAgent.title || !newAgent.prompt || (newAgent.allowAdvisor && !newAgent.advisorEmail)}
            >
              Crear Agente
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div>
          {userAgents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-2">No has creado ningún agente personalizado</p>
              <Button
                className="bg-secondary hover:bg-primary text-white"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Crear mi primer agente
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userAgents.map((agent) => (
                <Card
                  onClick={() => handleClick(agent)}
                  key={agent.id}
                  className={`p-5 cursor-pointer border rounded-lg transition-all hover:shadow-md max-w-64 flex flex-col h-full ${
                    currentAgent?.id === agent.id
                      ? "border-purple-600 bg-purple-50 shadow-sm"
                      : "hover:border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="size-12">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <UserRound className="h-7 w-7 text-purple-600" />
                      </div>
                    </Avatar>
                    <h3 className="font-medium text-base md:text-lg text-gray-800">
                      {agent.title}
                    </h3>
                    {currentAgent?.id === agent.id && (
                      <div className="mt-3 flex items-center gap-1 text-sm text-purple-600 font-medium">
                        <Check className="h-4 w-4" /> Agente activo
                      </div>
                    )}
                  </div>

                  <div className="w-full flex justify-end items-center gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-purple-600 hover:border-purple-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAgent(agent);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("¿Estás seguro de eliminar este agente?")) {
                          deleteAgent(agent.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingAgent(agent);
                      }}
                    >
                      Ver
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Agent Dialog */}
      {editingAgent && (
        <Dialog
          open={!!editingAgent}
          onOpenChange={(open) => !open && setEditingAgent(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Editar Agente
            </DialogTitle>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <label
                  htmlFor="edit-title"
                  className="text-sm font-medium text-gray-700"
                >
                  Título
                </label>
                <Input
                  id="edit-title"
                  value={editingAgent.title}
                  onChange={(e) =>
                    setEditingAgent({ ...editingAgent, title: e.target.value })
                  }
                  className="focus:ring-purple-500 focus:border-purple-500"
                  autoFocus={false}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="edit-prompt"
                  className="text-sm font-medium text-gray-700"
                >
                  Prompt
                </label>
                <textarea
                  id="edit-prompt"
                  value={editingAgent.prompt.replace(/\n?Si detectas que el cliente quiere hablar con un asesor humano[\s\S]*/, "").trim()}
                  onChange={(e) =>
                    setEditingAgent({ ...editingAgent, prompt: e.target.value })
                  }
                  className="w-full min-h-[120px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAllowAdvisor}
                    onChange={(e) => setEditingAllowAdvisor(e.target.checked)}
                    className="accent-primary scale-110"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Permitir enviar mensajes a un asesor
                  </span>
                </label>
                {editingAllowAdvisor && (
                  <div className="mt-2">
                    <label
                      htmlFor="edit-advisorEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Correo del asesor
                    </label>
                    <Input
                      id="edit-advisorEmail"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={editingAdvisorEmail}
                      onChange={(e) => setEditingAdvisorEmail(e.target.value)}
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button
              className="w-full bg-secondary hover:bg-primary text-white"
              onClick={updateAgent}
              disabled={!editingAgent.title || !editingAgent.prompt || (editingAllowAdvisor && !editingAdvisorEmail)}
            >
              Guardar Cambios
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* View Agent Dialog */}
      {viewingAgent && (
        <Dialog
          open={!!viewingAgent}
          onOpenChange={(open) => !open && setViewingAgent(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Información del Agente
            </DialogTitle>
            <div className="space-y-4 py-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Título:</h3>
                <p className="text-gray-800">{viewingAgent.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Prompt:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {viewingAgent.prompt}
                </p>
              </div>
            </div>
            <Button
              className="w-full bg-secondary hover:bg-primary text-white"
              onClick={() => setViewingAgent(null)}
            >
              Cerrar
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

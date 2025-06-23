import { Handle, Position } from 'reactflow';
import { ChevronDown, FileText, Search, Plus, Check as CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, memo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SiNotion } from "react-icons/si";

// Interfaces
interface NotionWorkspace {
  id: string;
  name: string;
  owner: string;
  lastEdited: string;
  connected: boolean;
}

interface NotionProps {
  selectedWorkspace: NotionWorkspace | null;
  workspaces: NotionWorkspace[];
  isLoading: boolean;
  onSelectWorkspace: (workspace: NotionWorkspace) => void;
}

// Componente para los puntos de conexión
const ConnectionHandles = memo(() => (
  <>
    <Handle type="target" position={Position.Top} className="w-3 h-3" id="top-target" />
    <Handle type="source" position={Position.Top} className="w-3 h-3" id="top-source" />
    <Handle type="target" position={Position.Left} className="w-3 h-3" id="left-target" />
    <Handle type="source" position={Position.Left} className="w-3 h-3" id="left-source" />
    <Handle type="target" position={Position.Right} className="w-3 h-3" id="right-target" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" id="right-source" />
    <Handle type="target" position={Position.Bottom} className="w-3 h-3" id="bottom-target" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" id="bottom-source" />
  </>
));
ConnectionHandles.displayName = "ConnectionHandles";

// Componente para el selector de workspace
interface WorkspaceSelectorProps {
  selectedWorkspace: NotionWorkspace | null;
  workspaces: NotionWorkspace[];
  isLoading: boolean;
  onSelectWorkspace: (workspace: NotionWorkspace) => void;
}

const WorkspaceSelector = memo(({
  selectedWorkspace,
  workspaces,
  isLoading,
  onSelectWorkspace
}: WorkspaceSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SiNotion className="h-5 w-5 text-gray-800 dark:text-white" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedWorkspace ? selectedWorkspace.name : 'Seleccionar workspace'}
            </p>
            {selectedWorkspace && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">{selectedWorkspace.owner}</p>
            )}
          </div>
        </div>
        {selectedWorkspace && (
          <Badge 
            variant={selectedWorkspace.connected ? "success" : "destructive"}
            className="dark:text-white"
          >
            {selectedWorkspace.connected ? "Conectado" : "Desconectado"}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
      </div>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" className="w-[240px] dark:bg-gray-800">
      {workspaces.length > 0 ? (
        <>
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Workspaces disponibles
          </div>
          <DropdownMenuSeparator />
          
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace)}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-between gap-2 group cursor-pointer",
                "transition-colors duration-200",
                "hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900",
                "dark:hover:bg-gray-700 dark:hover:text-gray-100",
                "dark:focus:bg-gray-700 dark:focus:text-gray-100"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">
                  {workspace.lastEdited}
                </span>
              </div>
              {selectedWorkspace?.id === workspace.id && (
                <CheckIcon className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay workspaces disponibles
        </div>
      )}
      <DropdownMenuItem 
        className={cn(
          "flex items-center gap-2 cursor-pointer group",
          "transition-colors duration-200"
        )}
      >
        <Plus className="h-4 w-4" />
        <span>Conectar nuevo workspace</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
WorkspaceSelector.displayName = "WorkspaceSelector";

// Tabs para diferentes acciones
type ActionMode = 'create' | 'read' | 'update';

interface ActionTabProps {
  mode: ActionMode;
  activeMode: ActionMode;
  onClick: (mode: ActionMode) => void;
}

const ActionTab = memo(({ mode, activeMode, onClick }: ActionTabProps) => (
  <button
    onClick={() => onClick(mode)}
    className={cn(
      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
      mode === activeMode 
        ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white" 
        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
    )}
  >
    {mode === 'create' && 'Crear'}
    {mode === 'read' && 'Consultar'}
    {mode === 'update' && 'Actualizar'}
  </button>
));
ActionTab.displayName = "ActionTab";

// Componente principal
export function NotionUI({
  selectedWorkspace,
  workspaces,
  isLoading,
  onSelectWorkspace
}: NotionProps) {
  const [actionMode, setActionMode] = useState<ActionMode>('create');
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  
  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-black/30 dark:border-white/30 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay con efecto cristal */}
      <div className="absolute inset-0 bg-gray-600/5 dark:bg-gray-400/10 pointer-events-none" />
      
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Selector de workspace */}
        <WorkspaceSelector 
          selectedWorkspace={selectedWorkspace}
          workspaces={workspaces}
          isLoading={isLoading}
          onSelectWorkspace={onSelectWorkspace}
        />
        
        {selectedWorkspace && (
          <>
            {/* Configuración de Notion */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-gray-300 dark:border-gray-800 p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <ActionTab mode="create" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="read" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="update" activeMode={actionMode} onClick={setActionMode} />
              </div>
              
              <div className="space-y-3">
                {actionMode === 'create' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Título de la página
                      </label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-gray-300 dark:border-gray-800 focus-visible:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Contenido
                      </label>
                      <Textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe tu contenido aquí"
                        className="text-sm bg-white/20 dark:bg-black/20 border-gray-300 dark:border-gray-800 focus-visible:ring-gray-500 min-h-[80px] resize-none"
                      />
                    </div>
                    <Button variant="default" size="sm" className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      Crear página
                    </Button>
                  </>
                )}
                
                {actionMode === 'read' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Buscar página
                      </label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Nombre de la página" 
                          className="text-sm bg-white/20 dark:bg-black/20 border-gray-300 dark:border-gray-800 focus-visible:ring-gray-500"
                        />
                        <Button variant="outline" size="icon" className="border-gray-300 dark:border-gray-800">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">
                        Última página consultada: <span className="font-medium">Reunión Semanal</span>
                      </span>
                    </div>
                  </>
                )}
                
                {actionMode === 'update' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        ID de la página
                      </label>
                      <Input 
                        placeholder="ID o URL de la página" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-gray-300 dark:border-gray-800 focus-visible:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Contenido actualizado
                      </label>
                      <Textarea 
                        placeholder="Nuevo contenido"
                        className="text-sm bg-white/20 dark:bg-black/20 border-gray-300 dark:border-gray-800 focus-visible:ring-gray-500 min-h-[80px] resize-none"
                      />
                    </div>
                    <Button variant="default" size="sm" className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
                      Actualizar página
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Datos de ejemplo para test del componente
export const demoNotionWorkspaces: NotionWorkspace[] = [
  { 
    id: '1', 
    name: 'Espacio de Trabajo', 
    owner: 'usuario@email.com',
    lastEdited: 'Hoy, 10:30',
    connected: true
  },
  { 
    id: '2', 
    name: 'Proyecto Marketing', 
    owner: 'usuario@email.com',
    lastEdited: 'Ayer, 16:45',
    connected: true
  },
  {
    id: '3',
    name: 'Notas Personales',
    owner: 'usuario@email.com',
    lastEdited: 'Hace 3 días',
    connected: false
  }
];
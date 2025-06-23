import { Handle, Position } from 'reactflow';
import { ChevronDown, Table, RefreshCw, Check as CheckIcon, Filter, Plus, Play, Save } from "lucide-react";
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
import { SiSupabase } from "react-icons/si";
import { Tabs, TabsContent,} from "@/components/ui/tabs";

// Interfaces
interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  lastAccessed: string;
  connected: boolean;
}

interface SupabaseProps {
  selectedProject: SupabaseProject | null;
  projects: SupabaseProject[];
  isLoading: boolean;
  onSelectProject: (project: SupabaseProject) => void;
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

// Componente para el selector de proyecto
interface ProjectSelectorProps {
  selectedProject: SupabaseProject | null;
  projects: SupabaseProject[];
  isLoading: boolean;
  onSelectProject: (project: SupabaseProject) => void;
}

const ProjectSelector = memo(({
  selectedProject,
  projects,
  isLoading,
  onSelectProject
}: ProjectSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SiSupabase className="h-5 w-5 text-emerald-600" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedProject ? selectedProject.name : 'Seleccionar proyecto'}
            </p>
            {selectedProject && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">{selectedProject.region}</p>
            )}
          </div>
        </div>
        {selectedProject && (
          <Badge 
            variant={selectedProject.connected ? "success" : "destructive"}
            className="dark:text-white"
          >
            {selectedProject.connected ? "Conectado" : "Desconectado"}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
      </div>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" className="w-[240px] dark:bg-gray-800">
      {projects.length > 0 ? (
        <>
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Proyectos disponibles
          </div>
          <DropdownMenuSeparator />
          
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => onSelectProject(project)}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-between gap-2 group cursor-pointer",
                "transition-colors duration-200",
                "hover:bg-emerald-50 hover:text-emerald-900 focus:bg-emerald-50 focus:text-emerald-900",
                "dark:hover:bg-emerald-900/20 dark:hover:text-emerald-200",
                "dark:focus:bg-emerald-900/20 dark:focus:text-emerald-200",
                "[&_span]:transition-colors [&_span]:duration-200",
                "[&_span]:group-hover:text-emerald-900 [&_span]:group-focus:text-emerald-900",
                "dark:[&_span]:group-hover:text-emerald-200 dark:[&_span]:group-focus:text-emerald-200",
                "[&_svg]:transition-colors [&_svg]:duration-200",
                "[&_svg]:text-emerald-600 [&_svg]:group-hover:text-emerald-700 [&_svg]:group-focus:text-emerald-700",
                "dark:[&_svg]:group-hover:text-emerald-300 dark:[&_svg]:group-focus:text-emerald-300"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{project.name}</span>
                <span className="text-xs text-muted-foreground group-hover:text-emerald-700/70 group-focus:text-emerald-700/70 dark:group-hover:text-emerald-300/70 dark:group-focus:text-emerald-300/70">
                  {project.region}
                </span>
              </div>
              {selectedProject?.id === project.id && <CheckIcon className="h-4 w-4 text-emerald-600" />}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar proyectos</span>
          </DropdownMenuItem>
        </>
      ) : isLoading ? (
        <div className="p-2 text-sm text-center text-muted-foreground">
          Cargando proyectos...
        </div>
      ) : (
        <div className="p-2 text-sm text-center text-muted-foreground">
          No hay proyectos disponibles
        </div>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
));
ProjectSelector.displayName = "ProjectSelector";

// Tabs para diferentes acciones
type ActionMode = 'query' | 'insert' | 'update' | 'delete';

interface ActionTabProps {
  mode: ActionMode;
  activeMode: ActionMode;
  onClick: (mode: ActionMode) => void;
}

const ActionTab = memo(({ mode, activeMode, onClick }: ActionTabProps) => (
  <button
    onClick={() => onClick(mode)}
    className={cn(
      "rounded-lg px-3 py-1 text-sm font-medium transition-colors duration-200",
      mode === activeMode
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
        : "bg-transparent text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
    )}
  >
    {mode === 'query' && 'Consultar'}
    {mode === 'insert' && 'Insertar'}
    {mode === 'update' && 'Actualizar'}
    {mode === 'delete' && 'Eliminar'}
  </button>
));
ActionTab.displayName = "ActionTab";

// Componente principal
export function SupabaseUI({
  selectedProject,
  projects,
  isLoading,
  onSelectProject
}: SupabaseProps) {
  const [activeMode, setActiveMode] = useState<ActionMode>('query');

  return (
    <Card className="w-[360px] bg-white border-emerald-200 dark:bg-gray-900 dark:border-emerald-900/40 shadow-md">
      <ConnectionHandles />
      
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <SiSupabase className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Supabase</h3>
        </div>
        
        <ProjectSelector 
          selectedProject={selectedProject}
          projects={projects}
          isLoading={isLoading}
          onSelectProject={onSelectProject}
        />
        
        {selectedProject && (
          <div className="space-y-3">
            <div className="flex gap-1 overflow-x-auto py-1 no-scrollbar">
              <ActionTab mode="query" activeMode={activeMode} onClick={setActiveMode} />
              <ActionTab mode="insert" activeMode={activeMode} onClick={setActiveMode} />
              <ActionTab mode="update" activeMode={activeMode} onClick={setActiveMode} />
              <ActionTab mode="delete" activeMode={activeMode} onClick={setActiveMode} />
            </div>
            
            <Tabs value={activeMode} className="space-y-3">
              <TabsContent value="query" className="m-0">
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Table className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Tabla:</div>
                  </div>
                  
                  <Input placeholder="Nombre de la tabla" className="text-sm" />
                  
                  <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Condición:</div>
                  </div>
                  
                  <Textarea placeholder="SELECT * FROM tabla WHERE condición" 
                    className="text-sm resize-none h-20" />
                  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Play className="h-4 w-4 mr-2" />
                    Ejecutar consulta
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="insert" className="m-0">
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Table className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Tabla:</div>
                  </div>
                  
                  <Input placeholder="Nombre de la tabla" className="text-sm" />
                  
                  <div className="flex gap-2 items-center">
                    <Plus className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Datos:</div>
                  </div>
                  
                  <Textarea placeholder='{ "campo1": "valor1", "campo2": "valor2" }' 
                    className="text-sm resize-none h-20" />
                  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar datos
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="update" className="m-0">
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Table className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Tabla:</div>
                  </div>
                  
                  <Input placeholder="Nombre de la tabla" className="text-sm" />
                  
                  <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Condición:</div>
                  </div>
                  
                  <Input placeholder="id = 1" className="text-sm" />
                  
                  <div className="flex gap-2 items-center">
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Datos:</div>
                  </div>
                  
                  <Textarea placeholder='{ "campo1": "nuevo valor" }' 
                    className="text-sm resize-none h-20" />
                  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    Actualizar datos
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="delete" className="m-0">
                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <Table className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Tabla:</div>
                  </div>
                  
                  <Input placeholder="Nombre de la tabla" className="text-sm" />
                  
                  <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-emerald-600" />
                    <div className="text-sm font-medium">Condición:</div>
                  </div>
                  
                  <Input placeholder="id = 1" className="text-sm" />
                  
                  <div className="py-2 px-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800/30">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      ⚠️ Esta acción eliminará registros y no se puede deshacer.
                    </p>
                  </div>
                  
                  <Button variant="destructive" className="w-full">
                    Eliminar registros
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </Card>
  );
}

// Datos de ejemplo para test del componente
export const demoSupabaseProjects: SupabaseProject[] = [
  { 
    id: '1', 
    name: 'botopia-production', 
    region: 'us-west-1',
    lastAccessed: 'Hoy, 10:15',
    connected: true
  },
  { 
    id: '2', 
    name: 'botopia-dev', 
    region: 'us-west-1',
    lastAccessed: 'Hace 2 días',
    connected: true
  },
  {
    id: '3',
    name: 'client-database',
    region: 'eu-central-1',
    lastAccessed: 'Hace 1 semana',
    connected: false
  },
  { 
    id: '4', 
    name: 'analytics-db', 
    region: 'ap-southeast-1',
    lastAccessed: 'Hace 3 semanas',
    connected: false
  }
];
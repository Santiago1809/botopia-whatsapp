import { Handle, Position } from 'reactflow';
import { ChevronDown, Table, CheckSquare, FileSpreadsheet, Check as CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, memo, } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiGooglesheets } from "react-icons/si";

// Constantes
/*const UI_SIZES = {
  CONTAINER_WIDTH: "360px",
  MIN_HEIGHT: "160px"
} as const;*/

// Interfaces
interface SpreadSheet {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  connected: boolean;
}

interface GoogleSheetsProps {
  selectedSheet: SpreadSheet | null;
  sheets: SpreadSheet[];
  isLoading: boolean;
  onSelectSheet: (sheet: SpreadSheet) => void;
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

// Componente para el selector de hoja de cálculo
interface SheetSelectorProps {
  selectedSheet: SpreadSheet | null;
  sheets: SpreadSheet[];
  isLoading: boolean;
  onSelectSheet: (sheet: SpreadSheet) => void;
}

const SheetSelector = memo(({
  selectedSheet,
  sheets,
  isLoading,
  onSelectSheet
}: SheetSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SiGooglesheets className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedSheet ? selectedSheet.name : 'Seleccionar hoja'}
            </p>
            {selectedSheet && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">{selectedSheet.owner}</p>
            )}
          </div>
        </div>
        {selectedSheet && (
          <Badge 
            variant={selectedSheet.connected ? "success" : "destructive"}
            className="dark:text-white"
          >
            {selectedSheet.connected ? "Conectado" : "Desconectado"}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
      </div>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" className="w-[240px] dark:bg-gray-800">
      {sheets.length > 0 ? (
        <>
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Hojas disponibles
          </div>
          <DropdownMenuSeparator />
          
          {sheets.map((sheet) => (
            <DropdownMenuItem
              key={sheet.id}
              onClick={() => onSelectSheet(sheet)}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-between gap-2 group cursor-pointer",
                "transition-colors duration-200",
                "hover:bg-green-50 hover:text-green-900 focus:bg-green-50 focus:text-green-900",
                "dark:hover:bg-green-900/20 dark:hover:text-green-200",
                "dark:focus:bg-green-900/20 dark:focus:text-green-200",
                "[&_span]:transition-colors [&_span]:duration-200",
                "[&_span]:group-hover:text-green-900 [&_span]:group-focus:text-green-900",
                "dark:[&_span]:group-hover:text-green-200 dark:[&_span]:group-focus:text-green-200",
                "[&_svg]:transition-colors [&_svg]:duration-200",
                "[&_svg]:text-green-600 [&_svg]:group-hover:text-green-700 [&_svg]:group-focus:text-green-700",
                "dark:[&_svg]:group-hover:text-green-300 dark:[&_svg]:group-focus:text-green-300"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{sheet.name}</span>
                <span className="text-xs text-muted-foreground group-hover:text-green-700/70 group-focus:text-green-700/70 dark:group-hover:text-green-300/70 dark:group-focus:text-green-300/70">
                  {sheet.lastModified}
                </span>
              </div>
              {selectedSheet?.id === sheet.id && (
                <CheckIcon className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay hojas disponibles
        </div>
      )}
      <DropdownMenuItem 
        className={cn(
          "flex items-center gap-2 cursor-pointer group",
          "transition-colors duration-200",
          "hover:bg-green-50 hover:text-green-900 focus:bg-green-50 focus:text-green-900",
          "dark:hover:bg-green-900/20 dark:hover:text-green-200",
          "[&>svg]:transition-colors [&>svg]:duration-200",
          "[&>svg]:text-green-600 [&>svg]:group-hover:text-green-700 [&>svg]:group-focus:text-green-700",
          "dark:[&>svg]:group-hover:text-green-300 dark:[&>svg]:group-focus:text-green-300"
        )}
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span>Conectar nueva hoja</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
SheetSelector.displayName = "SheetSelector";

// Tabs para diferentes acciones
type ActionMode = 'read' | 'write' | 'update' | 'delete';

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
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
    )}
  >
    {mode === 'read' && 'Leer'}
    {mode === 'write' && 'Escribir'}
    {mode === 'update' && 'Actualizar'}
    {mode === 'delete' && 'Eliminar'}
  </button>
));
ActionTab.displayName = "ActionTab";

// Componente principal
export function GoogleSheetsUI({
  selectedSheet,
  sheets,
  isLoading,
  onSelectSheet
}: GoogleSheetsProps) {
  const [actionMode, setActionMode] = useState<ActionMode>('read');
  const [range, setRange] = useState<string>("A1:B10");
  
  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-green-600/30 dark:border-green-500/50 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay verde con efecto cristal */}
      <div className="absolute inset-0 bg-green-600/5 dark:bg-green-600/10 pointer-events-none" />
      
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Selector de hoja de cálculo */}
        <SheetSelector 
          selectedSheet={selectedSheet}
          sheets={sheets}
          isLoading={isLoading}
          onSelectSheet={onSelectSheet}
        />
        
        {selectedSheet && (
          <>
            {/* Configuración de la hoja */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-green-200 dark:border-green-800 p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <ActionTab mode="read" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="write" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="update" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="delete" activeMode={actionMode} onClick={setActionMode} />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Rango de celdas
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      value={range} 
                      onChange={(e) => setRange(e.target.value)}
                      placeholder="Ej: A1:B10" 
                      className="text-sm bg-white/20 dark:bg-black/20 border-green-200 dark:border-green-900 focus-visible:ring-green-500"
                    />
                    <Button variant="outline" size="icon" className="border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/30">
                      <Table className="h-4 w-4 text-green-700 dark:text-green-400" />
                    </Button>
                  </div>
                </div>
                
                {actionMode !== 'read' && (
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                      {actionMode === 'write' ? 'Datos a escribir' : 
                       actionMode === 'update' ? 'Datos a actualizar' : 
                                               'Condición para eliminar'}
                    </label>
                    <Input 
                      placeholder={
                        actionMode === 'write' ? "Datos en formato JSON" : 
                        actionMode === 'update' ? "Actualización en formato JSON" : 
                                                "Condición para filtrar filas"
                      }
                      className="text-sm bg-white/20 dark:bg-black/20 border-green-200 dark:border-green-900 focus-visible:ring-green-500"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Hoja actual: <span className="text-green-700 dark:text-green-300 font-medium">Hoja1</span>
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Datos de ejemplo para test del componente
export const demoGoogleSheets: SpreadSheet[] = [
  { 
    id: '1', 
    name: 'Reporte Trimestral', 
    owner: 'usuario@gmail.com',
    lastModified: 'Ayer, 14:30',
    connected: true
  },
  { 
    id: '2', 
    name: 'Presupuesto 2025', 
    owner: 'usuario@gmail.com',
    lastModified: 'Hace 3 días',
    connected: true
  },
  {
    id: '3',
    name: 'Seguimiento Clientes',
    owner: 'colaborador@gmail.com',
    lastModified: 'Hace 1 semana',
    connected: false
  },
  { 
    id: '4', 
    name: 'Calendario Editorial', 
    owner: 'marketing@empresa.com',
    lastModified: 'Hace 2 semanas',
    connected: false
  }
];
import { Handle, Position } from 'reactflow';
import { ChevronDown, Calendar, Clock, Users, Check as CheckIcon } from "lucide-react";
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
import { SiGooglecalendar } from "react-icons/si";

// Interfaces
interface CalendarAccount {
  id: string;
  email: string;
  name: string;
  lastSync: string;
  connected: boolean;
}

interface GoogleCalendarProps {
  selectedAccount: CalendarAccount | null;
  accounts: CalendarAccount[];
  isLoading: boolean;
  onSelectAccount: (account: CalendarAccount) => void;
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

// Componente para el selector de cuenta
interface AccountSelectorProps {
  selectedAccount: CalendarAccount | null;
  accounts: CalendarAccount[];
  isLoading: boolean;
  onSelectAccount: (account: CalendarAccount) => void;
}

const AccountSelector = memo(({
  selectedAccount,
  accounts,
  isLoading,
  onSelectAccount
}: AccountSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SiGooglecalendar className="h-5 w-5 text-blue-500" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedAccount ? selectedAccount.email : 'Seleccionar cuenta'}
            </p>
            {selectedAccount && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">{selectedAccount.name}</p>
            )}
          </div>
        </div>
        {selectedAccount && (
          <Badge 
            variant={selectedAccount.connected ? "success" : "destructive"}
            className="dark:text-white"
          >
            {selectedAccount.connected ? "Conectado" : "Desconectado"}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
      </div>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" className="w-[240px] dark:bg-gray-800">
      {accounts.length > 0 ? (
        <>
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Cuentas disponibles
          </div>
          <DropdownMenuSeparator />
          
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              onClick={() => onSelectAccount(account)}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-between gap-2 group cursor-pointer",
                "transition-colors duration-200",
                "hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900",
                "dark:hover:bg-blue-900/20 dark:hover:text-blue-200",
                "dark:focus:bg-blue-900/20 dark:focus:text-blue-200",
                "[&_span]:transition-colors [&_span]:duration-200",
                "[&_span]:group-hover:text-blue-900 [&_span]:group-focus:text-blue-900",
                "dark:[&_span]:group-hover:text-blue-200 dark:[&_span]:group-focus:text-blue-200",
                "[&_svg]:transition-colors [&_svg]:duration-200",
                "[&_svg]:text-blue-600 [&_svg]:group-hover:text-blue-700 [&_svg]:group-focus:text-blue-700",
                "dark:[&_svg]:group-hover:text-blue-300 dark:[&_svg]:group-focus:text-blue-300"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{account.email}</span>
                <span className="text-xs text-muted-foreground group-hover:text-blue-700/70 group-focus:text-blue-700/70 dark:group-hover:text-blue-300/70 dark:group-focus:text-blue-300/70">
                  {account.lastSync}
                </span>
              </div>
              {selectedAccount?.id === account.id && (
                <CheckIcon className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay cuentas disponibles
        </div>
      )}
      <DropdownMenuItem 
        className={cn(
          "flex items-center gap-2 cursor-pointer group",
          "transition-colors duration-200",
          "hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900",
          "dark:hover:bg-blue-900/20 dark:hover:text-blue-200",
          "[&>svg]:transition-colors [&>svg]:duration-200",
          "[&>svg]:text-blue-600 [&>svg]:group-hover:text-blue-700 [&>svg]:group-focus:text-blue-700",
          "dark:[&>svg]:group-hover:text-blue-300 dark:[&>svg]:group-focus:text-blue-300"
        )}
      >
        <SiGooglecalendar className="h-4 w-4" />
        <span>Conectar nueva cuenta</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
AccountSelector.displayName = "AccountSelector";

// Tabs para diferentes acciones
type ActionMode = 'create' | 'view' | 'update';

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
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" 
        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
    )}
  >
    {mode === 'create' && 'Crear evento'}
    {mode === 'view' && 'Ver eventos'}
    {mode === 'update' && 'Actualizar evento'}
  </button>
));
ActionTab.displayName = "ActionTab";

// Componente principal
export function GoogleCalendarUI({
  selectedAccount,
  accounts,
  isLoading,
  onSelectAccount
}: GoogleCalendarProps) {
  const [actionMode, setActionMode] = useState<ActionMode>('create');
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  
  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-blue-600/30 dark:border-blue-500/50 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay azul con efecto cristal */}
      <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 pointer-events-none" />
      
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Selector de cuenta */}
        <AccountSelector 
          selectedAccount={selectedAccount}
          accounts={accounts}
          isLoading={isLoading}
          onSelectAccount={onSelectAccount}
        />
        
        {selectedAccount && (
          <>
            {/* Configuración del calendario */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-blue-200 dark:border-blue-800 p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <ActionTab mode="create" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="view" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="update" activeMode={actionMode} onClick={setActionMode} />
              </div>
              
              <div className="space-y-3">
                {actionMode === 'create' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Título del evento
                      </label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Fecha
                      </label>
                      <Input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Hora inicio
                        </label>
                        <Input 
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Hora fin
                        </label>
                        <Input 
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Descripción
                      </label>
                      <Textarea 
                        placeholder="Detalles del evento"
                        className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500 min-h-[60px] resize-none"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                        <Users className="h-4 w-4 text-blue-700 dark:text-blue-400 mr-1" />
                        <span className="text-xs">Invitar</span>
                      </Button>
                      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-xs">Crear evento</span>
                      </Button>
                    </div>
                  </>
                )}
                
                {actionMode === 'view' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Filtrar por fecha
                      </label>
                      <Input 
                        type="date" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="bg-white/20 dark:bg-black/30 rounded-md p-2 border border-blue-100 dark:border-blue-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">Reunión de Equipo</span>
                        <Badge variant="outline" className="text-[10px] h-5 border-blue-300 dark:border-blue-700">
                          10:00 - 11:30
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Sala de conferencias virtual</p>
                    </div>
                    <Button variant="default" size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Cargar más eventos
                    </Button>
                  </>
                )}
                
                {actionMode === 'update' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        ID del evento
                      </label>
                      <Input 
                        placeholder="ID del evento a modificar" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-xs">Reprogramar evento</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Nueva fecha
                        </label>
                        <Input 
                          type="date"
                          className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Nueva hora
                        </label>
                        <Input 
                          type="time"
                          className="text-sm bg-white/20 dark:bg-black/20 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                        />
                      </div>
                    </div>
                    <Button variant="default" size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Actualizar evento
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
export const demoCalendarAccounts: CalendarAccount[] = [
  { 
    id: '1', 
    email: 'usuario@gmail.com', 
    name: 'Usuario Principal',
    lastSync: 'Hace 10 minutos',
    connected: true
  },
  { 
    id: '2', 
    email: 'trabajo@empresa.com', 
    name: 'Calendario Laboral',
    lastSync: 'Hace 1 hora',
    connected: true
  },
  {
    id: '3',
    email: 'personal@gmail.com',
    name: 'Eventos Personales',
    lastSync: 'Hace 2 días',
    connected: false
  }
];
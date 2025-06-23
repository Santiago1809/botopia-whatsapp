import { Handle, Position } from 'reactflow';
import { ChevronDown, Send, Inbox, Star, PaperclipIcon, Check as CheckIcon } from "lucide-react";
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
import { SiGmail } from "react-icons/si";

// Interfaces
interface EmailAccount {
  id: string;
  email: string;
  name: string;
  lastSync: string;
  connected: boolean;
}

interface GmailProps {
  selectedAccount: EmailAccount | null;
  accounts: EmailAccount[];
  isLoading: boolean;
  onSelectAccount: (account: EmailAccount) => void;
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
  selectedAccount: EmailAccount | null;
  accounts: EmailAccount[];
  isLoading: boolean;
  onSelectAccount: (account: EmailAccount) => void;
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
          <SiGmail className="h-5 w-5 text-red-500" />
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
                "hover:bg-red-50 hover:text-red-900 focus:bg-red-50 focus:text-red-900",
                "dark:hover:bg-red-900/20 dark:hover:text-red-200",
                "dark:focus:bg-red-900/20 dark:focus:text-red-200",
                "[&_span]:transition-colors [&_span]:duration-200",
                "[&_span]:group-hover:text-red-900 [&_span]:group-focus:text-red-900",
                "dark:[&_span]:group-hover:text-red-200 dark:[&_span]:group-focus:text-red-200",
                "[&_svg]:transition-colors [&_svg]:duration-200",
                "[&_svg]:text-red-600 [&_svg]:group-hover:text-red-700 [&_svg]:group-focus:text-red-700",
                "dark:[&_svg]:group-hover:text-red-300 dark:[&_svg]:group-focus:text-red-300"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{account.email}</span>
                <span className="text-xs text-muted-foreground group-hover:text-red-700/70 group-focus:text-red-700/70 dark:group-hover:text-red-300/70 dark:group-focus:text-red-300/70">
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
          "hover:bg-red-50 hover:text-red-900 focus:bg-red-50 focus:text-red-900",
          "dark:hover:bg-red-900/20 dark:hover:text-red-200",
          "[&>svg]:transition-colors [&>svg]:duration-200",
          "[&>svg]:text-red-600 [&>svg]:group-hover:text-red-700 [&>svg]:group-focus:text-red-700",
          "dark:[&>svg]:group-hover:text-red-300 dark:[&>svg]:group-focus:text-red-300"
        )}
      >
        <SiGmail className="h-4 w-4" />
        <span>Conectar nueva cuenta</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
AccountSelector.displayName = "AccountSelector";

// Tabs para diferentes acciones
type ActionMode = 'send' | 'receive' | 'filter';

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
        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
    )}
  >
    {mode === 'send' && 'Enviar'}
    {mode === 'receive' && 'Recibir'}
    {mode === 'filter' && 'Filtrar'}
  </button>
));
ActionTab.displayName = "ActionTab";

// Componente principal
export function GmailUI({
  selectedAccount,
  accounts,
  isLoading,
  onSelectAccount
}: GmailProps) {
  const [actionMode, setActionMode] = useState<ActionMode>('send');
  const [to, setTo] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  
  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-red-600/30 dark:border-red-500/50 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay rojo con efecto cristal */}
      <div className="absolute inset-0 bg-red-600/5 dark:bg-red-600/10 pointer-events-none" />
      
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
            {/* Configuración del correo */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-red-200 dark:border-red-800 p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <ActionTab mode="send" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="receive" activeMode={actionMode} onClick={setActionMode} />
                <ActionTab mode="filter" activeMode={actionMode} onClick={setActionMode} />
              </div>
              
              <div className="space-y-3">
                {actionMode === 'send' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Destinatario
                      </label>
                      <Input 
                        value={to} 
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="ejemplo@email.com" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Asunto
                      </label>
                      <Input 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Asunto del correo" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Mensaje
                      </label>
                      <Textarea 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Escribe tu mensaje aquí"
                        className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500 min-h-[80px] resize-none"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30">
                        <PaperclipIcon className="h-4 w-4 text-red-700 dark:text-red-400 mr-1" />
                        <span className="text-xs">Adjuntar</span>
                      </Button>
                      <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        <Send className="h-4 w-4 text-white mr-1" />
                        <span className="text-xs">Enviar</span>
                      </Button>
                    </div>
                  </>
                )}
                
                {actionMode === 'receive' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Filtrar por remitente
                      </label>
                      <Input 
                        placeholder="ejemplo@email.com" 
                        className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                        <Inbox className="h-4 w-4 text-white mr-1" />
                        <span className="text-xs">Bandeja de entrada</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30">
                        <Star className="h-4 w-4 text-red-700 dark:text-red-400 mr-1" />
                        <span className="text-xs">Destacados</span>
                      </Button>
                    </div>
                  </>
                )}
                
                {actionMode === 'filter' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                        Búsqueda por palabra clave
                      </label>
                      <Input 
                        placeholder="Ej: factura, reunión..." 
                        className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Desde
                        </label>
                        <Input 
                          type="date"
                          className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                          Hasta
                        </label>
                        <Input 
                          type="date"
                          className="text-sm bg-white/20 dark:bg-black/20 border-red-200 dark:border-red-900 focus-visible:ring-red-500"
                        />
                      </div>
                    </div>
                    <Button variant="default" size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Aplicar filtros
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
export const demoGmailAccounts: EmailAccount[] = [
  { 
    id: '1', 
    email: 'usuario@gmail.com', 
    name: 'Usuario Principal',
    lastSync: 'Hace 5 minutos',
    connected: true
  },
  { 
    id: '2', 
    email: 'trabajo@gmail.com', 
    name: 'Cuenta de Trabajo',
    lastSync: 'Hace 1 hora',
    connected: true
  },
  {
    id: '3',
    email: 'personal@gmail.com',
    name: 'Cuenta Personal',
    lastSync: 'Hace 2 días',
    connected: false
  }
];
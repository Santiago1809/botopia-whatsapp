import { Handle, Position } from 'reactflow';
import { ChevronDown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BsWhatsapp } from 'react-icons/bs';
import { cn } from "@/lib/utils";
import { Check, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


interface WhatsAppAccount {
  id: string;
  name: string;
  number: string;
  status: string;
}

interface WhatsAppEnviarNodeUIProps {
  selectedAccount: WhatsAppAccount | null;
  connectionStatus: Record<string, string>;
  accounts: WhatsAppAccount[];
  isLoading: boolean;
  onSelectAccount: (account: WhatsAppAccount) => void;
  onAddNewAccount: () => void;
  whatsappMode: 'send' | 'respond';
  setWhatsappMode: (mode: 'send' | 'respond') => void;
}

export function WhatsAppEnviarNodeUI({
  selectedAccount,
  connectionStatus,
  accounts,
  isLoading,
  onSelectAccount,
  onAddNewAccount,
  whatsappMode,
  setWhatsappMode,
}: WhatsAppEnviarNodeUIProps) {
  return (
    <div className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-green-600 dark:border-green-700 px-4 py-3 min-w-[390px] min-h-[160px] relative overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(37,211,102,0.05)] pointer-events-none" />

      {/* Puntos de conexión */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 z-10" id="top-target" />
      <Handle type="source" position={Position.Top} className="w-3 h-3 z-10" id="top-source" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 z-10" id="left-target" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 z-10" id="left-source" />
      <Handle type="target" position={Position.Right} className="w-3 h-3 z-10" id="right-target" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 z-10" id="right-source" />
      <Handle type="target" position={Position.Bottom} className="w-3 h-3 z-10" id="bottom-target" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 z-10" id="bottom-source" />

      <div className="flex flex-col gap-4 relative z-10">
        {/* Fila superior con dropdown y switch invertidos */}
        <div className="flex items-center gap-3 mb-1">
          {/* Dropdown de cuenta */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1">
              <div className="flex items-center justify-between gap-2 px-2 py-1 bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(0,0,0,0.2)] rounded-md border border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <BsWhatsapp className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-sm text-gray-800 dark:text-white">
                      {selectedAccount ? selectedAccount.name : 'Seleccionar cuenta'}
                    </p>
                    {selectedAccount && (
                      <p className="text-xs text-gray-600 dark:text-gray-300">{selectedAccount.number}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectedAccount && (
                    <Badge 
                      variant={connectionStatus[selectedAccount.id] === 'connected' ? "success" : "destructive"}
                      className="dark:text-white"
                    >
                      {connectionStatus[selectedAccount.id] === 'connected' ? "Conectado" : "Desconectado"}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
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
                        "hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                        "[&_span]:transition-colors [&_span]:duration-200",
                        "[&_span]:group-hover:text-white [&_span]:group-focus:text-white",
                        "[&_svg]:transition-colors [&_svg]:duration-200",
                        "[&_svg]:text-green-600 [&_svg]:group-hover:text-white [&_svg]:group-focus:text-white"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-white/70 group-focus:text-white/70">
                          {account.number}
                        </span>
                      </div>
                      {selectedAccount?.id === account.id && (
                        <Check className="h-4 w-4" />
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
                onClick={onAddNewAccount}
                className={cn(
                  "flex items-center gap-2 cursor-pointer group",
                  "transition-colors duration-200",
                  "hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                  "[&>svg]:transition-colors [&>svg]:duration-200",
                  "[&>svg]:text-primary [&>svg]:group-hover:text-white [&>svg]:group-focus:text-white"
                )}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Agregar nueva cuenta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Switch para Enviar/Recibir */}
          <div className="relative h-9 bg-[rgba(0,0,0,0.13)] dark:bg-[rgba(0,0,0,0.22)] rounded-full border border-gray-300 dark:border-gray-600 overflow-hidden px-2 w-[160px] shrink-0 flex items-center">
            {/* Fondo verde (slider) */}
            <div
              className="absolute top-1 bottom-1 w-[68px] bg-green-500 dark:bg-green-600 rounded-full shadow-sm transition-all duration-300"
              style={{
                left: whatsappMode === 'send' ? '8px' : 'calc(50% + 4px)',
                transitionTimingFunction: "cubic-bezier(0.34, 1.15, 0.64, 1)"
              }}
            />
            {/* Opciones */}
            <div className="grid grid-cols-2 h-full w-full relative z-10">
              <div
                onClick={() => setWhatsappMode('send')}
                className={cn(
                  "flex items-center justify-center text-base cursor-pointer select-none",
                  "transition-colors duration-200 font-medium",
                  whatsappMode === 'send'
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                )}
                style={{ zIndex: 2 }}
              >
                Enviar
              </div>
              <div
                onClick={() => setWhatsappMode('respond')}
                className={cn(
                  "flex items-center justify-center text-base cursor-pointer select-none",
                  "transition-colors duration-200 font-medium",
                  whatsappMode === 'respond'
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                )}
                style={{ zIndex: 2 }}
              >
                Recibir
              </div>
            </div>
          </div>
        </div>

        {/* Botón para abrir el modal - Centrado y con espacio uniforme */}
        <Button 
          variant="outline" 
          onClick={() => {}} // Aquí puedes abrir un modal si lo necesitas
          className="bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(0,0,0,0.3)] border-gray-400 dark:border-gray-500 border-[1px] hover:bg-[rgba(255,255,255,0.2)] dark:hover:bg-[rgba(0,0,0,0.4)] text-black dark:text-white hover:text-black dark:hover:text-white flex items-center justify-center gap-2 w-full backdrop-blur-sm"
        >
          <Users size={16} />
          <span className="text-sm font-normal">¿A quiénes enviar?</span>
        </Button>
      </div>
    </div>
  );
}
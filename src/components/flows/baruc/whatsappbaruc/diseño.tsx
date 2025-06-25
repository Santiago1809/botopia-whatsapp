import { Handle, Position } from 'reactflow';
import { ChevronDown, Users,} from "lucide-react";
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
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Importamos los componentes modales
import KeywordsModal from './recibir/modalPalabrasClave';
import ContactsModal from './recibir/modalContactos';
import GroupsModal from './recibir/modalGrupos';

interface WhatsAppAccount {
  id: string;
  name: string; 
  number: string;
  status: string;
}

interface Keyword {
  id: string;
  text: string;
}

export interface WhatsAppNodeUIProps {
  selectedAccount: WhatsAppAccount | null;
  connectionStatus: Record<string, string>;
  accounts: WhatsAppAccount[];
  isLoading: boolean;
  onSelectAccount: (account: WhatsAppAccount) => void;
  onAddNewAccount: () => void;
  whatsappMode: 'send' | 'respond';
  setWhatsappMode: (mode: 'send' | 'respond') => void;
}

export function WhatsAppNodeUI({
  selectedAccount,
  connectionStatus,
  accounts,
  isLoading,
  onSelectAccount,
  onAddNewAccount,
  whatsappMode,
  setWhatsappMode
}: WhatsAppNodeUIProps) {
  // Estados locales
  const [isKeywordsMode, setIsKeywordsMode] = useState(false);
  //const [modalOpen, setModalOpen] = useState(false);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isListenModalOpen, setIsListenModalOpen] = useState(false);
  const [listenTab, setListenTab] = useState<'contacts' | 'groups'>('contacts');
  const [contactsFilter, setContactsFilter] = useState('');
  const [groupsFilter, setGroupsFilter] = useState('');

  return (
    <>
      {/* Bloque principal del nodo */}
      <div className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-green-600 dark:border-green-700 px-4 py-3 min-w-[390px] min-h-[160px] relative overflow-hidden">
        {/* Capa de overlay verde con efecto cristal */}
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
          {/* Fila superior con switch y dropdown mejor espaciados */}
          <div className="flex items-center gap-3 mb-1">
            {/* Dropdown de cuenta con mayor flexibilidad */}
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
                className="absolute top-1 bottom-1 w-[70px] bg-green-500 dark:bg-green-600 rounded-full shadow-sm transition-all duration-300"
                style={{
                  left: whatsappMode === 'send' ? '8px' : 'calc(50% + 1px)',
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
          
          {/* Botón para abrir el modal de escuchar (deja solo este) */}
          <Button 
            variant="outline" 
            onClick={() => setIsListenModalOpen(true)}
            className="bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(0,0,0,0.3)] border-gray-400 dark:border-gray-500 border-[1px] hover:bg-[rgba(255,255,255,0.2)] dark:hover:bg-[rgba(0,0,0,0.4)] text-black dark:text-white hover:text-black dark:hover:text-white flex items-center justify-center gap-2 w-full backdrop-blur-sm"
          >
            <Users size={16} />
            <span className="text-sm font-normal">¿A quiénes escuchar?</span>
          </Button>
          
          {/* Switch con animación mejorada - Ancho completo para equilibrar el espacio */}
          <div className="relative h-11 bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(0,0,0,0.3)] rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden w-full p-1 backdrop-blur-sm">
            {/* Selector móvil con transición suavizada */}
            <div 
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-2px)] bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(0,0,0,0.4)] rounded-md shadow-sm border border-gray-200 dark:border-gray-700",
                "transition-all duration-400 ease-out",
                isKeywordsMode ? "right-1 left-auto" : "left-1 right-auto"
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.34, 1.15, 0.64, 1)"
              }}
            />
            
            {/* Contenedor de opciones */}
            <div className="grid grid-cols-2 h-full">
              {/* Opción 1: Cualquier mensaje */}
              <button 
                onClick={() => setIsKeywordsMode(false)} 
                className={cn(
                  "flex items-center justify-center z-10 mx-1",
                  "transition-colors duration-400 ease-out",
                  !isKeywordsMode 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-300"
                )}
              >
                <span className="text-sm font-medium whitespace-nowrap">Cualquier mensaje</span>
              </button>
              
              {/* Opción 2: Palabras clave */}
              <button 
                onClick={() => setIsKeywordsMode(true)} 
                className={cn(
                  "flex items-center justify-center z-10 mx-1",
                  "transition-colors duration-400 ease-out",
                  isKeywordsMode 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-300"
                )}
              >
                <span className="text-sm font-medium whitespace-nowrap">Palabras clave</span>
              </button>
            </div>
          </div>
          
          {/* Modal de Palabras Clave */}
          <KeywordsModal 
            isVisible={isKeywordsMode}
            keywords={keywords}
            onKeywordsChange={setKeywords}
          />
        </div>
      </div>

      {/* Modal combinado de contactos y grupos - FUERA del bloque principal */}
      {isListenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
              onClick={() => setIsListenModalOpen(false)}
            >
              ×
            </button>
            {/* Tabs para alternar entre contactos y grupos */}
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  listenTab === 'contacts'
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => setListenTab('contacts')}
              >
                Contactos
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  listenTab === 'groups'
                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => setListenTab('groups')}
              >
                Grupos
              </button>
            </div>
            {/* Renderiza el modal correspondiente */}
            {listenTab === 'contacts' ? (
              <ContactsModal
                contactsFilter={contactsFilter}
                setContactsFilter={setContactsFilter}
              />
            ) : (
              <GroupsModal
                groupsFilter={groupsFilter}
                setGroupsFilter={setGroupsFilter}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
import { Handle, Position } from 'reactflow';
import { ChevronDown, Users, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BsWhatsapp } from 'react-icons/bs';
import { cn } from "@/lib/utils";
import { Check, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Importamos los componentes modales
import ContactsModal from './recibir/modalContactos';
import GroupsModal from './recibir/modalGrupos';
import KeywordsModal from './recibir/modalPalabrasClave';

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

interface WhatsAppNodeUIProps {
  selectedAccount: WhatsAppAccount | null;
  connectionStatus: Record<string, string>;
  accounts: WhatsAppAccount[];
  isLoading: boolean;
  onSelectAccount: (account: WhatsAppAccount) => void;
  onAddNewAccount: () => void;
}

export function WhatsAppNodeUI({
  selectedAccount,
  connectionStatus,
  accounts,
  isLoading,
  onSelectAccount,
  onAddNewAccount
}: WhatsAppNodeUIProps) {
  // Estados locales
  const [isKeywordsMode, setIsKeywordsMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [contactsFilter, setContactsFilter] = useState("all");
  const [groupsFilter, setGroupsFilter] = useState("all");
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  return (
    <div className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-green-600 dark:border-green-700 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden">
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
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Dropdown de cuenta */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center justify-between gap-2">
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
        
        {/* Botón para abrir el modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-[rgba(255,255,255,0.1)] dark:bg-[rgba(0,0,0,0.3)] border-gray-400 dark:border-gray-500 border-[1px] hover:bg-[rgba(255,255,255,0.2)] dark:hover:bg-[rgba(0,0,0,0.4)] text-black dark:text-white hover:text-black dark:hover:text-white flex items-center justify-center gap-2 mx-auto w-[330px] backdrop-blur-sm"
            >
              <Users size={16} />
              <span className="text-sm font-normal">¿A quiénes escuchar?</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-center">Configurar destinatarios</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="contacts" className="w-full mt-2">
              <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                <TabsTrigger value="contacts" className="flex items-center gap-2">
                  <UserRound size={16} />
                  <span>Contactos</span>
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Grupos</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="contacts" className="mt-4">
                <ContactsModal contactsFilter={contactsFilter} setContactsFilter={setContactsFilter} />
              </TabsContent>
              
              <TabsContent value="groups" className="mt-4">
                <GroupsModal groupsFilter={groupsFilter} setGroupsFilter={setGroupsFilter} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        {/* Switch con animación mejorada */}
        <div className="relative h-11 bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(0,0,0,0.3)] rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden mx-auto w-[330px] p-1 backdrop-blur-sm">
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
        
        {/* Modal de Palabras Clave - Aparece solo cuando isKeywordsMode = true */}
        <KeywordsModal 
          isVisible={isKeywordsMode}
          keywords={keywords}
          onKeywordsChange={setKeywords}
        />
      </div>
    </div>
  );
}
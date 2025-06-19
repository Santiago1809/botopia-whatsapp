import { Handle, Position } from 'reactflow';
import { ChevronDown, Check as CheckIcon, SendIcon, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, memo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BsWhatsapp } from 'react-icons/bs';

// Interfaces
interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  components: string[];
  createdAt: string;
}

interface WhatsAppApiProps {
  selectedTemplate: WhatsAppTemplate | null;
  templates: WhatsAppTemplate[];
  isLoading: boolean;
  onSelectTemplate: (template: WhatsAppTemplate) => void;
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

// Props para el selector de plantilla
interface TemplateSelectorProps {
  selectedTemplate: WhatsAppTemplate | null;
  templates: WhatsAppTemplate[];
  isLoading: boolean;
  onSelectTemplate: (template: WhatsAppTemplate) => void;
}

// Componente para el selector de plantilla
const TemplateSelector = memo(({
  selectedTemplate,
  templates,
  isLoading,
  onSelectTemplate
}: TemplateSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BsWhatsapp className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedTemplate ? selectedTemplate.name : 'Seleccionar plantilla'}
            </p>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">Categoría: {selectedTemplate.category}</p>
            )}
          </div>
        </div>
        {selectedTemplate && (
          <Badge 
            variant={
              selectedTemplate.status === 'approved' ? "success" : 
              selectedTemplate.status === 'pending' ? "secondary" : "destructive"
            }
            className="dark:text-white"
          >
            {selectedTemplate.status === 'approved' ? "Aprobada" : 
             selectedTemplate.status === 'pending' ? "Pendiente" : "Rechazada"}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
      </div>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent 
      side="bottom"
      align="start"
      sideOffset={5}
      avoidCollisions={false}
      collisionPadding={20}
      className="w-[240px] dark:bg-gray-800 max-h-[280px] overflow-auto z-50"
      forceMount
    >
      {templates.length > 0 ? (
        <>
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground sticky top-0 bg-background dark:bg-gray-800 z-30 border-b">
            Plantillas disponibles
          </div>
          
          {/* Agrupar plantillas por categoría */}
          {Array.from(new Set(templates.map(t => t.category))).map((category) => {
            const categoryTemplates = templates.filter(t => t.category === category);
            
            return (
              <div key={category} className="py-1">
                {/* Encabezado de categoría */}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground capitalize sticky top-[28px] bg-background dark:bg-gray-800 z-20 border-t border-b border-border/40 dark:border-gray-700/40">
                  {category}
                </div>
                
                {/* Plantillas de esta categoría */}
                <div className="py-1">
                  {categoryTemplates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      disabled={isLoading || template.status === 'rejected'}
                      className={cn(
                        "flex items-center justify-between gap-2 group cursor-pointer",
                        "transition-colors duration-200",
                        "hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900",
                        "dark:hover:bg-blue-900/20 dark:hover:text-blue-200",
                        "dark:focus:bg-blue-900/20 dark:focus:text-blue-200",
                        "py-1.5",
                        "[&_span]:transition-colors [&_span]:duration-200",
                        "[&_span]:group-hover:text-blue-900 [&_span]:group-focus:text-blue-900",
                        "dark:[&_span]:group-hover:text-blue-200 dark:[&_span]:group-focus:text-blue-200",
                        "[&_svg]:transition-colors [&_svg]:duration-200",
                        "[&_svg]:text-blue-500 [&_svg]:group-hover:text-blue-700 [&_svg]:group-focus:text-blue-700",
                        "dark:[&_svg]:group-hover:text-blue-300 dark:[&_svg]:group-focus:text-blue-300",
                        template.status === 'rejected' && "opacity-50"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{template.name}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-blue-700/70 group-focus:text-blue-700/70 dark:group-hover:text-blue-300/70 dark:group-focus:text-blue-300/70">
                          Componentes: {template.components.length}
                        </span>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <CheckIcon className="h-4 w-4 flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay plantillas disponibles
        </div>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
));
TemplateSelector.displayName = "TemplateSelector";

// Componente principal
export function WhatsAppApiUI({
  selectedTemplate,
  templates,
  isLoading,
  onSelectTemplate
}: WhatsAppApiProps) {
  const [, setIsDarkMode] = useState(false);
  const [messageType, setMessageType] = useState<'template' | 'session'>('template');
  
  // Detector de tema
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          checkTheme();
          break;
        }
      }
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-blue-600/30 dark:border-blue-600/50 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay azul con efecto cristal */}
      <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 pointer-events-none" />
      
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Selector de plantilla */}
        <TemplateSelector 
          selectedTemplate={selectedTemplate}
          templates={templates}
          isLoading={isLoading}
          onSelectTemplate={onSelectTemplate}
        />
        
        {selectedTemplate && (
          <>
            {/* Tipo de mensaje */}
            <div className="relative h-10 bg-[rgba(0,0,0,0.15)] dark:bg-[rgba(0,0,0,0.3)] rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden mx-auto w-full p-1 backdrop-blur-sm">
              {/* Selector móvil con transición suavizada */}
              <div 
                className={cn(
                  "absolute top-1 bottom-1 w-[calc(50%-2px)] bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(0,0,0,0.4)] rounded-md shadow-sm border border-gray-200 dark:border-gray-700",
                  "transition-all duration-400 ease-out",
                  messageType === 'session' ? "right-1 left-auto" : "left-1 right-auto"
                )}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.34, 1.15, 0.64, 1)"
                }}
              />
              
              {/* Contenedor de opciones */}
              <div className="grid grid-cols-2 h-full">
                {/* Opción 1: Plantilla */}
                <button 
                  onClick={() => setMessageType('template')} 
                  className={cn(
                    "flex items-center justify-center z-10 mx-1",
                    "transition-colors duration-400 ease-out",
                    messageType === 'template' 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium whitespace-nowrap">Plantilla</span>
                </button>
                
                {/* Opción 2: Sesión */}
                <button 
                  onClick={() => setMessageType('session')} 
                  className={cn(
                    "flex items-center justify-center z-10 mx-1",
                    "transition-colors duration-400 ease-out",
                    messageType === 'session' 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <SendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium whitespace-nowrap">Sesión</span>
                </button>
              </div>
            </div>
            
            {/* Configuración de la plantilla */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-blue-200 dark:border-blue-800 p-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Componentes de plantilla
              </h3>
              
              <div className="space-y-1.5">
                {selectedTemplate.components.map((component, index) => (
                  <div key={index} className="flex items-center px-2 py-1 rounded-md bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                    {component}
                  </div>
                ))}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>Creada: {new Date(selectedTemplate.createdAt).toLocaleDateString()}</span>
                  <span className="capitalize">Estado: {selectedTemplate.status}</span>
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
export const demoTemplates: WhatsAppTemplate[] = [
  {
    id: '1',
    name: 'Confirmación de compra',
    category: 'Transaccional',
    status: 'approved',
    components: ['Header', 'Body', 'Footer', 'Buttons'],
    createdAt: '2023-05-21T14:35:00Z'
  },
  {
    id: '2',
    name: 'Notificación de envío',
    category: 'Transaccional',
    status: 'approved',
    components: ['Header', 'Body', 'Footer'],
    createdAt: '2023-06-12T09:20:00Z'
  },
  {
    id: '3',
    name: 'Recordatorio de cita',
    category: 'Utilidad',
    status: 'approved',
    components: ['Header', 'Body', 'Buttons'],
    createdAt: '2023-04-05T11:45:00Z'
  },
  {
    id: '4',
    name: 'Mensaje de bienvenida',
    category: 'Marketing',
    status: 'approved',
    components: ['Header', 'Body', 'Footer', 'Buttons'],
    createdAt: '2023-07-15T16:30:00Z'
  },
  {
    id: '5',
    name: 'Oferta especial',
    category: 'Marketing',
    status: 'pending',
    components: ['Header', 'Body', 'Footer'],
    createdAt: '2023-08-01T13:20:00Z'
  },
  {
    id: '6',
    name: 'Encuesta de satisfacción',
    category: 'Utilidad',
    status: 'rejected',
    components: ['Header', 'Body', 'Footer', 'Buttons'],
    createdAt: '2023-03-18T10:10:00Z'
  }
];
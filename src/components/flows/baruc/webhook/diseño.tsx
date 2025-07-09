import { Handle, Position } from 'reactflow';
import { ChevronDown, Check as CheckIcon, Webhook, Zap } from "lucide-react";
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

// Interfaces para Webhook
interface WebhookService {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  createdAt: string;
}

interface WebhookProps {
  selectedService: WebhookService | null;
  services: WebhookService[];
  isLoading: boolean;
  onSelectService: (service: WebhookService) => void;
}

// Puntos de conexión
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

// Selector de servicios
interface ServiceSelectorProps {
  selectedService: WebhookService | null;
  services: WebhookService[];
  isLoading: boolean;
  onSelectService: (service: WebhookService) => void;
}

const ServiceSelector = memo(({
  selectedService,
  services,
  isLoading,
  onSelectService
}: ServiceSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-gray-500" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedService ? selectedService.name : 'Seleccionar servicio'}
            </p>
            {selectedService && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">Proveedor: {selectedService.provider}</p>
            )}
          </div>
        </div>
        {selectedService && (
          <Badge 
            variant={
              selectedService.status === 'connected' ? "success" : 
              selectedService.status === 'disconnected' ? "secondary" : "destructive"
            }
            className="dark:text-white"
          >
            {selectedService.status === 'connected' ? "Conectado" : 
             selectedService.status === 'disconnected' ? "Desconectado" : "Error"}
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
      {services.length > 0 ? (
        <>
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground sticky top-0 bg-background dark:bg-gray-800 z-30 border-b">
            Servicios disponibles
          </div>
          {services.map((service) => (
            <DropdownMenuItem
              key={service.id}
              onClick={() => onSelectService(service)}
              disabled={isLoading || service.status === 'error'}
              className={cn(
                "flex items-center justify-between gap-2 group cursor-pointer",
                "transition-colors duration-200",
                "hover:bg-green-50 hover:text-green-900 focus:bg-green-50 focus:text-green-900",
                "dark:hover:bg-green-900/20 dark:hover:text-green-200",
                "dark:focus:bg-green-900/20 dark:focus:text-green-200",
                "py-1.5",
                "[&_span]:transition-colors [&_span]:duration-200",
                "[&_span]:group-hover:text-green-900 [&_span]:group-focus:text-green-900",
                "dark:[&_span]:group-hover:text-green-200 dark:[&_span]:group-focus:text-green-200",
                "[&_svg]:transition-colors [&_svg]:duration-200",
                "[&_svg]:text-green-500 [&_svg]:group-hover:text-green-700 [&_svg]:group-focus:text-green-700",
                "dark:[&_svg]:group-hover:text-green-300 dark:[&_svg]:group-focus:text-green-300",
                service.status === 'error' && "opacity-50"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">{service.name}</span>
                <span className="text-xs text-muted-foreground group-hover:text-green-700/70 group-focus:text-green-700/70 dark:group-hover:text-green-300/70 dark:group-focus:text-green-300/70">
                  {service.description}
                </span>
              </div>
              {selectedService?.id === service.id && (
                <CheckIcon className="h-4 w-4 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay servicios disponibles
        </div>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
));
ServiceSelector.displayName = "ServiceSelector";

export function WebhookUI({
  selectedService,
  services,
  isLoading,
  onSelectService
}: WebhookProps) {
  const [, setIsDarkMode] = useState(false);
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
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-gray-400/40 dark:border-gray-500/60 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gray-200/30 dark:bg-gray-700/20 pointer-events-none" />
      <ConnectionHandles />
      <div className="flex flex-col gap-3 relative z-10">
        <ServiceSelector 
          selectedService={selectedService}
          services={services}
          isLoading={isLoading}
          onSelectService={onSelectService}
        />
        {selectedService && (
          <Card className="bg-gray-100/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-300 dark:border-gray-700 p-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Conexión Webhook
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center px-2 py-1 rounded-md bg-gray-200/50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 text-xs">
                <Zap className="h-4 w-4 mr-2 text-gray-400" />
                {selectedService.description}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>Creado: {new Date(selectedService.createdAt).toLocaleDateString()}</span>
                <span className="capitalize">Estado: {selectedService.status}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Datos demo para test
export const demoWebhookServices: WebhookService[] = [
  {
    id: '1',
    name: '8n8 Webhook',
    provider: '8n8',
    status: 'connected',
    description: 'Conecta flujos de 8n8 con tu sistema.',
    createdAt: '2024-06-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Webhook Custom',
    provider: 'Custom',
    status: 'disconnected',
    description: 'Conexión personalizada para cualquier servicio.',
    createdAt: '2024-06-10T12:30:00Z'
  },
  {
    id: '3',
    name: 'Webhook Error',
    provider: 'ErrorProvider',
    status: 'error',
    description: 'Error de conexión detectado.',
    createdAt: '2024-06-15T09:15:00Z'
  }
];

// Agrega la opción al sidebar para visualizar el bloque Webhook
export const WebhookSidebarOption = {
  id: 'webhook',
  name: 'Webhook',
  icon: Webhook, // Usa el icono Webhook
  color: 'gray',
  description: 'Conecta servicios externos vía Webhook (ej: 8n8, Custom, etc.)',
  nodeComponent: 'WebhookUI',
};

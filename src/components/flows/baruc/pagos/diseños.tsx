import { Handle, Position } from 'reactflow';
import { ChevronDown, CreditCard, Check as CheckIcon, DollarSign } from "lucide-react";
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

// Interfaces
interface PaymentGateway {
  id: string;
  name: string;
  icon: string; // Nombre del icono que podríamos usar
  supportedCurrencies: string[];
  fee: number; // Comisión en porcentaje
  status: 'active' | 'inactive';
}

interface PaymentProps {
  selectedGateway: PaymentGateway | null;
  gateways: PaymentGateway[];
  isLoading: boolean;
  onSelectGateway: (gateway: PaymentGateway) => void;
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

// Props para el selector de pasarela de pago
interface GatewaySelectorProps {
  selectedGateway: PaymentGateway | null;
  gateways: PaymentGateway[];
  isLoading: boolean;
  onSelectGateway: (gateway: PaymentGateway) => void;
}

// Componente para el selector de pasarela
const GatewaySelector = memo(({
  selectedGateway,
  gateways,
  isLoading,
  onSelectGateway
}: GatewaySelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-500" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedGateway ? selectedGateway.name : 'Seleccionar pasarela de pago'}
            </p>
            {selectedGateway && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">Comisión: {selectedGateway.fee}%</p>
            )}
          </div>
        </div>
        {selectedGateway && (
          <Badge 
            variant={selectedGateway.status === 'active' ? "success" : "destructive"}
            className="dark:text-white"
          >
            {selectedGateway.status === 'active' ? "Activa" : "Inactiva"}
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
      {gateways.length > 0 ? (
        <>
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground sticky top-0 bg-background dark:bg-gray-800 z-30 border-b">
            Pasarelas disponibles
          </div>
          
          <div className="py-1">
            {gateways.map((gateway) => (
              <DropdownMenuItem
                key={gateway.id}
                onClick={() => onSelectGateway(gateway)}
                disabled={isLoading || gateway.status === 'inactive'}
                className={cn(
                  "flex items-center justify-between gap-2 group cursor-pointer",
                  "transition-colors duration-200",
                  "hover:bg-purple-50 hover:text-purple-900 focus:bg-purple-50 focus:text-purple-900",
                  "dark:hover:bg-purple-900/20 dark:hover:text-purple-200",
                  "dark:focus:bg-purple-900/20 dark:focus:text-purple-200",
                  "py-1.5",
                  "[&_span]:transition-colors [&_span]:duration-200",
                  "[&_span]:group-hover:text-purple-900 [&_span]:group-focus:text-purple-900",
                  "dark:[&_span]:group-hover:text-purple-200 dark:[&_span]:group-focus:text-purple-200",
                  "[&_svg]:transition-colors [&_svg]:duration-200",
                  "[&_svg]:text-purple-500 [&_svg]:group-hover:text-purple-700 [&_svg]:group-focus:text-purple-700",
                  "dark:[&_svg]:group-hover:text-purple-300 dark:[&_svg]:group-focus:text-purple-300",
                  gateway.status === 'inactive' && "opacity-50"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{gateway.name}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-purple-700/70 group-focus:text-purple-700/70 dark:group-hover:text-purple-300/70 dark:group-focus:text-purple-300/70">
                    Comisión: {gateway.fee}%
                  </span>
                </div>
                {selectedGateway?.id === gateway.id && (
                  <CheckIcon className="h-4 w-4 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay pasarelas disponibles
        </div>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
));
GatewaySelector.displayName = "GatewaySelector";

// Componente principal
export function PaymentUI({
  selectedGateway,
  gateways,
  isLoading,
  onSelectGateway
}: PaymentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [, setIsDarkMode] = useState(false);
  
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

  // Cambiar moneda
  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(event.target.value);
  };

  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-purple-500/30 dark:border-purple-500/50 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay morado con efecto cristal */}
      <div className="absolute inset-0 bg-purple-500/5 dark:bg-purple-500/10 pointer-events-none" />
      
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Selector de pasarela */}
        <GatewaySelector 
          selectedGateway={selectedGateway}
          gateways={gateways}
          isLoading={isLoading}
          onSelectGateway={onSelectGateway}
        />
        
        {selectedGateway && (
          <>
            {/* Configuración del pago */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-purple-200 dark:border-purple-800 p-3">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                Configuración de pago
              </h3>
              
              <div className="space-y-3">
                {/* Selector de moneda */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <label htmlFor="currency" className="text-xs text-gray-600 dark:text-gray-400">
                      Moneda:
                    </label>
                  </div>
                  
                  <select
                    id="currency"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    className={cn(
                      "w-full h-8 rounded px-2 text-sm",
                      "border border-purple-200 dark:border-purple-700",
                      "bg-white/80 dark:bg-black/30",
                      "focus:outline-none focus:ring-1 focus:ring-purple-500"
                    )}
                    disabled={!selectedGateway.supportedCurrencies.length}
                  >
                    {selectedGateway.supportedCurrencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                
                {/* Detalles */}
                <div className="flex justify-between items-center text-xs px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  <span>Comisión por transacción:</span>
                  <span className="font-medium">{selectedGateway.fee}%</span>
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
export const demoGateways: PaymentGateway[] = [
  { 
    id: '1', 
    name: 'Stripe', 
    icon: 'stripe', 
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN'], 
    fee: 2.9,
    status: 'active'
  },
  { 
    id: '2', 
    name: 'PayPal', 
    icon: 'paypal', 
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], 
    fee: 3.4,
    status: 'active'
  },
  { 
    id: '3', 
    name: 'Mercado Pago', 
    icon: 'mercadopago', 
    supportedCurrencies: ['USD', 'MXN', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'UYU'], 
    fee: 3.99,
    status: 'active'
  },
  { 
    id: '4', 
    name: 'WePay', 
    icon: 'wepay', 
    supportedCurrencies: ['USD', 'CAD', 'GBP'], 
    fee: 2.9,
    status: 'active'
  },
  { 
    id: '5', 
    name: 'Square', 
    icon: 'square', 
    supportedCurrencies: ['USD', 'CAD', 'JPY', 'AUD', 'GBP'], 
    fee: 2.6,
    status: 'active'
  },
  { 
    id: '6', 
    name: 'Authorize.net', 
    icon: 'authorize', 
    supportedCurrencies: ['USD'], 
    fee: 2.9,
    status: 'inactive'
  }
];

// Datos de ejemplo para testing
export const demoPaymentMethods = [
  { 
    id: '1', 
    name: 'Tarjeta de crédito', 
    provider: 'Stripe', 
    type: 'card',
    status: 'active',
    fee: '2.9% + $0.30',
    icon: 'credit-card'
  },
  { 
    id: '2', 
    name: 'PayPal', 
    provider: 'PayPal', 
    type: 'digital',
    status: 'active',
    fee: '3.5% + $0.49',
    icon: 'paypal'
  },
  { 
    id: '3', 
    name: 'Transferencia bancaria', 
    provider: 'Bank', 
    type: 'transfer',
    status: 'active',
    fee: '$1.00',
    icon: 'bank'
  },
  { 
    id: '4', 
    name: 'Criptomonedas', 
    provider: 'Coinbase', 
    type: 'crypto',
    status: 'inactive',
    fee: '1.0%',
    icon: 'bitcoin'
  }
];
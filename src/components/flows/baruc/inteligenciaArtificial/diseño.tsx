import { Handle, Position } from 'reactflow';
import { ChevronDown, Brain, Check as CheckIcon } from "lucide-react";
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

// Constantes
/*const UI_SIZES = {
  CONTAINER_WIDTH: "360px",
  MIN_HEIGHT: "160px"
} as const;*/

// Interfaces
interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: AIModelType;
  status: 'available' | 'unavailable';
}

type AIModelType = 'text' | 'image' | 'audio' | 'video' | 'multimodal';

interface AINodeProps {
  selectedModel: AIModel | null;
  models: AIModel[];
  isLoading: boolean;
  onSelectModel: (model: AIModel) => void;
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

// Props para el selector de modelo de IA
interface ModelSelectorProps {
  selectedModel: AIModel | null;
  models: AIModel[];
  isLoading: boolean;
  onSelectModel: (model: AIModel) => void;
}

// Componente para el selector de modelo de IA
const ModelSelector = memo(({
  selectedModel,
  models,
  isLoading,
  onSelectModel
}: ModelSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-amber-500" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-800 dark:text-white">
              {selectedModel ? selectedModel.name : 'Seleccionar modelo de IA'}
            </p>
            {selectedModel && (
              <p className="text-xs text-muted-foreground dark:text-gray-300">{selectedModel.provider}</p>
            )}
          </div>
        </div>
        {selectedModel && (
          <Badge 
            variant={selectedModel.status === 'available' ? "success" : "destructive"}
            className="dark:text-white"
          >
            {selectedModel.status === 'available' ? "Modelo" : "No disponible"}
          </Badge>
        )}
        <ChevronDown className="h-4 w-4 opacity-50 dark:text-white" />
      </div>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent 
      side="bottom"                // Fuerza posición abajo
      align="start"                // Alinea con el inicio del trigger
      sideOffset={5}               // Espacio entre trigger y dropdown
      avoidCollisions={false}      // Previene que el dropdown cambie de lado para evitar colisiones
      collisionPadding={20}        // Da espacio para evitar colisiones con bordes de la pantalla
      className="w-[240px] dark:bg-gray-800 max-h-[280px] overflow-auto z-50"
      forceMount                   // Fuerza el montaje incluso si normalmente no sería visible
    >
      {models.length > 0 ? (
        <>
          <div className="px-2 py-1 text-sm font-medium text-muted-foreground sticky top-0 bg-background dark:bg-gray-800 z-30 border-b">
            Modelos disponibles
          </div>
          
          {/* Agrupa modelos por tipo */}
          {(['text', 'image', 'audio', 'video', 'multimodal'] as AIModelType[]).map((type) => {
            const typeModels = models.filter(model => model.type === type);
            
            if (typeModels.length === 0) return null;
            
            return (
              <div key={type} className="py-1">
                {/* Encabezado de categoría con fondo sólido y mejor espaciado */}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground capitalize sticky top-[28px] bg-background dark:bg-gray-800 z-20 border-t border-b border-border/40 dark:border-gray-700/40">
                  {type === 'text' ? 'Texto' : 
                   type === 'image' ? 'Imagen' : 
                   type === 'audio' ? 'Audio' : 
                   type === 'video' ? 'Video' : 'Multimodal'}
                </div>
                
                {/* Los elementos se muestran en un contenedor normal (no sticky) */}
                <div className="py-1">
                  {typeModels.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => onSelectModel(model)}
                      disabled={isLoading || model.status === 'unavailable'}
                      className={cn(
                        "flex items-center justify-between gap-2 group cursor-pointer",
                        "transition-colors duration-200",
                        "hover:bg-amber-50 hover:text-amber-900 focus:bg-amber-50 focus:text-amber-900",
                        "dark:hover:bg-amber-900/20 dark:hover:text-amber-200",
                        "dark:focus:bg-amber-900/20 dark:focus:text-amber-200",
                        "py-1.5", // Padding reducido
                        "[&_span]:transition-colors [&_span]:duration-200",
                        "[&_span]:group-hover:text-amber-900 [&_span]:group-focus:text-amber-900",
                        "dark:[&_span]:group-hover:text-amber-200 dark:[&_span]:group-focus:text-amber-200",
                        "[&_svg]:transition-colors [&_svg]:duration-200",
                        "[&_svg]:text-amber-500 [&_svg]:group-hover:text-amber-700 [&_svg]:group-focus:text-amber-700",
                        "dark:[&_svg]:group-hover:text-amber-300 dark:[&_svg]:group-focus:text-amber-300",
                        model.status === 'unavailable' && "opacity-50"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{model.name}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-amber-700/70 group-focus:text-amber-700/70 dark:group-hover:text-amber-300/70 dark:group-focus:text-amber-300/70">
                          {model.provider}
                        </span>
                      </div>
                      {selectedModel?.id === model.id && (
                        <CheckIcon className="h-4 w-4 flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
                
                {/* Eliminamos el separador delgado ya que usamos bordes */}
              </div>
            );
          })}
        </>
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No hay modelos disponibles
        </div>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
));
ModelSelector.displayName = "ModelSelector";

// Componente principal
export function AINodeUI({
  selectedModel,
  models,
  isLoading,
  onSelectModel
}: AINodeProps) {
  const [temperature, setTemperature] = useState<number>(0.7);
  const [, setIsDarkMode] = useState(false); // Añadimos el estado aquí
  
  // Detector de tema
  useEffect(() => {
    // Simplificamos esta función para eliminar la variable isDark no utilizada
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Observer para detectar cambios de tema
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
  
  // Handler para cambiar la temperatura del modelo
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(e.target.value));
  };

  return (
    <div 
      className="bg-transparent backdrop-blur-sm backdrop-filter rounded-lg shadow-lg border-2 border-amber-500/30 dark:border-amber-500/50 px-4 py-3 min-w-[360px] min-h-[160px] relative overflow-hidden"
    >
      {/* Capa de overlay amber con efecto cristal */}
      <div className="absolute inset-0 bg-amber-500/5 dark:bg-amber-500/10 pointer-events-none" />
      
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3 relative z-10">
        {/* Selector de modelo de IA */}
        <ModelSelector 
          selectedModel={selectedModel}
          models={models}
          isLoading={isLoading}
          onSelectModel={onSelectModel}
        />
        
        {selectedModel && (
          <>
            {/* Configuración del modelo */}
            <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-amber-200 dark:border-amber-800 p-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                Configuración del modelo
              </h3>
              
              <div className="space-y-3">
                {/* Control de temperatura */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Temperatura: {temperature}</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {temperature < 0.3 ? 'Preciso' : temperature > 0.7 ? 'Creativo' : 'Balanceado'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={handleTemperatureChange}
                    className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900/50 appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                
                {/* Tipo de salida */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Tipo:</span>
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                    {selectedModel.type === 'text' ? 'Texto' : 
                     selectedModel.type === 'image' ? 'Imagen' : 
                     selectedModel.type === 'audio' ? 'Audio' : 
                     selectedModel.type === 'video' ? 'Video' : 'Multimodal'}
                  </Badge>
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
export const demoAIModels: AIModel[] = [
  { id: '1', name: 'Claude Sonnet 3.7', provider: 'Anthropic', type: 'text', status: 'available' },
  { id: '2', name: 'GPT-4o', provider: 'OpenAI', type: 'text', status: 'available' },
  { id: '3', name: 'Gemini Pro', provider: 'Google', type: 'text', status: 'available' },
  { id: '4', name: 'Mixtral 8x7B', provider: 'Mistral AI', type: 'text', status: 'available' },
  { id: '5', name: 'DALL-E 3', provider: 'OpenAI', type: 'image', status: 'available' },
  { id: '6', name: 'Midjourney v6', provider: 'Midjourney', type: 'image', status: 'available' },
  { id: '7', name: 'Stable Diffusion XL', provider: 'Stability AI', type: 'image', status: 'available' },
  { id: '8', name: 'Claude Opus', provider: 'Anthropic', type: 'multimodal', status: 'unavailable' },
  { id: '9', name: 'Whisper', provider: 'OpenAI', type: 'audio', status: 'available' },
  { id: '10', name: 'Sora', provider: 'OpenAI', type: 'video', status: 'unavailable' },
];


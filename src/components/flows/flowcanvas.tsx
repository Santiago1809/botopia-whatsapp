import { Node, Edge, Connection, NodeChange, EdgeChange, ReactFlowInstance } from 'reactflow'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2, Save } from "lucide-react"
import { ThemeSwitcher } from '@/components/flows/ThemeSwitcher'
import './flow-controls.css'
import { nodeTypes } from './nodeTypes';
import { Copilot } from './copilot/copilot';
import { Sidebar } from './sidebar';

type FlowCanvasProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  nodeTypes?: Record<string, React.ComponentType<NodeProps>>;
};

// Usa NodeProps de reactflow para los componentes de nodo personalizados
import type { NodeProps } from 'reactflow';

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  // Estado compartido para saber si el chat de Copilot está abierto
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  
  // Detecta orientación de pantalla
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }
    };

    // Verificar orientación inicial
    checkOrientation();
    
    // Actualizar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkOrientation);
    
    // Limpiar event listener
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Detectar móvil vertical
  const [isMobileVertical, setIsMobileVertical] = useState(false);
  useEffect(() => {
    const checkMobileVertical = () => {
      if (typeof window !== 'undefined') {
        setIsMobileVertical(window.innerWidth < 1024 && window.innerHeight > window.innerWidth);
      }
    };
    checkMobileVertical();
    window.addEventListener('resize', checkMobileVertical);
    window.addEventListener('orientationchange', checkMobileVertical);
    return () => {
      window.removeEventListener('resize', checkMobileVertical);
      window.removeEventListener('orientationchange', checkMobileVertical);
    };
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    if (!reactFlowWrapper.current || !reactFlowInstance) {
      return;
    }

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');
    
    console.log('Intentando crear nodo de tipo:', type);
    console.log('Tipos disponibles:', Object.keys(nodeTypes));
    
    // Comprobar si el tipo existe antes de crear el nodo
    if (!(type in nodeTypes)) {
      console.error(`Error: El tipo de nodo "${type}" no está registrado en nodeTypes`);
      alert(`Error: El tipo de nodo "${type}" no está registrado. 
           Tipos disponibles: ${Object.keys(nodeTypes).join(', ')}`);
      return;
    }
    
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNode = {
      id: `${type}-${Date.now()}`,
      type: type,
      position: position,
      data: {},
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = useCallback(async () => {
    const flow = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };

    try {
      const file = new Blob([JSON.stringify(flow, null, 2)], { 
        type: 'application/json' 
      });
      
      // Crear un elemento <a> para descargar el archivo
      const a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = `flow-${flow.timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);

      console.log('Flujo guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el flujo:', error);
    }
  }, [nodes, edges]);

  // Detectamos el tema actual
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mejorar el detector de tema para evitar re-renderizados innecesarios
  useEffect(() => {
    // Función para detectar el tema actual
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark !== isDarkMode) {
        setIsDarkMode(isDark);
      }
    };
    
    checkTheme();
    
    // Crear un observer para detectar cambios en el tema
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          checkTheme();
          break;
        }
      }
    });
    
    // Observar cambios en el elemento html
    observer.observe(document.documentElement, { attributes: true });
    
    // Limpiar observer
    return () => observer.disconnect();
  }, [isDarkMode]);

  // Permite agregar un nodo al centro del canvas (para móvil)
  const addNodeAtCenter = (type: string) => {
    if (!reactFlowWrapper.current || !reactFlowInstance) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const center = reactFlowInstance.project({
      x: bounds.width / 2,
      y: bounds.height / 2,
    });
    if (!(type in nodeTypes)) return;
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: center,
      data: {},
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Memoizar nodeTypes para evitar recreación en cada renderizado
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  // Ocultar explícitamente cualquier botón de menú hamburguesa cuando el chat está abierto en móvil vertical
  useEffect(() => {
    if (isCopilotOpen && isMobileVertical) {
      // Seleccionar todos los posibles botones hamburguesa en la app
      const menuButtons = document.querySelectorAll('.menu-button-hamburger');
      menuButtons.forEach(button => {
        (button as HTMLElement).style.display = 'none';
      });
    } else {
      // Restaurar la visibilidad
      const menuButtons = document.querySelectorAll('.menu-button-hamburguesa');
      menuButtons.forEach(button => {
        (button as HTMLElement).style.display = '';
      });
    }
  }, [isCopilotOpen, isMobileVertical]);

  return (
    <div className={`h-screen bg-[hsl(var(--canvas))] relative ${isLandscape ? 'w-auto' : 'w-screen'} md:ml-[320px] md:w-[calc(100vw-320px)]`}>
      {/* Contenedor para móvil que agrupa Copilot y los botones principales */}
      <div className={`fixed z-[900] flex flex-col md:hidden top-4 transition-all duration-300
        ${isMobileVertical && isCopilotOpen ? 'left-6' : isCopilotOpen ? 'right-[330px]' : 'right-4'}
        ${!isLandscape ? 'flex-col-reverse gap-4' : 'gap-4'}`}
      >
        {/* Copilot para móvil - con animación y estilo igual a escritorio, sin div externo */}
        <Copilot isMobile={true} onOpenChange={setIsCopilotOpen} isOpen={isCopilotOpen} />
        
        {/* CAMBIO AQUÍ: Eliminar la condición para que siempre se muestren los botones */}
        <div className="flex flex-col gap-2 bg-[hsl(var(--sidebar))] p-3 rounded-lg backdrop-blur shadow-md border w-[58px]">
          <ThemeSwitcher />
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => setNodes([])}
            title="Limpiar Canvas"
            className="clear-button action-button" // Añade clase action-button
          >
            <Trash2 className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <Button 
            onClick={handleSave}
            size="icon"
            className="bg-primary text-white hover:bg-primary/90 dark:text-white dark:hover:bg-primary/70 save-button action-button" // Añade clase action-button
            title="Guardar flujo"
          >
            <Save className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>
      </div>

      {/* Contenedor para escritorio que agrupa Copilot y los botones principales */}
      <div className={`fixed z-[900] hidden md:flex flex-row top-4 transition-all duration-300 ${
        isCopilotOpen ? 'gap-1 right-[350px]' : 'gap-10 right-8'
      }`}>
        {/* Botones principales para escritorio */}
        <div className="flex flex-row gap-3 bg-[hsl(var(--sidebar))] p-2.5 rounded-lg backdrop-blur shadow-md border w-[400px] h-[55px]">
          <ThemeSwitcher />
          
          <Button 
            variant="destructive" 
            onClick={() => setNodes([])}
            className="flex items-center clear-button" // Añade esta clase
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Canvas
          </Button>
          
          <Button 
            onClick={handleSave}
            className="bg-primary text-white hover:bg-primary/90 dark:text-white dark:hover:bg-primary/70 flex items-center save-button" // Añade esta clase
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar flujo
          </Button>
        </div>

        {/* Copilot para escritorio - Con efecto de brillo */}
        <div className="copilot-glow-wrapper relative flex items-center h-[55px] mr-1">
          <div className="absolute inset-0 animate-pulse-slow rounded-full bg-amber-300/20 blur-md"></div>
          <div className="absolute inset-0 animate-pulse-slow animate-delay-500 rounded-full bg-amber-400/10 blur-lg"></div>
          <Copilot isMobile={false} onOpenChange={setIsCopilotOpen} isOpen={isCopilotOpen} />
        </div>
      </div>
    
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={memoizedNodeTypes} // <-- Usar la versión memoizada
          fitView
          nodesDraggable={true} // Permite mover nodos libremente
          panOnDrag={[1, 2]} // Permite panear el canvas con touch (1 dedo) y mouse (2 clicks)
          className={`h-full w-full border rounded-lg bg-[hsl(var(--canvas))] ${isDarkMode ? 'dark-flow-controls' : ''}`}
          proOptions={{ hideAttribution: true }}
        >
          <Controls 
            className="flow-controls !bg-background dark:!bg-[hsl(var(--canvas))] border dark:border-gray-700 !shadow-md"
            showInteractive={false}
          />
          <Background 
            color={isDarkMode ? "#555" : "#ccc"} 
            gap={16} 
            size={1}
            className="dark:bg-[hsl(var(--canvas))]" 
          />
          <MiniMap 
            className="!bg-background dark:!bg-[hsl(var(--canvas))] border dark:border-gray-700 rounded-lg !shadow-md"
            maskColor={isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(240, 240, 240, 0.3)"}
            nodeBorderRadius={4}
          />
        </ReactFlow>
        
        {/* SOLUCIÓN: Renderizado condicional del Sidebar basado en múltiples factores */}
        {typeof window !== 'undefined' && (
          // No renderizar el Sidebar en absoluto si el chat está abierto y es móvil vertical
          !(isCopilotOpen && isMobileVertical) && 
          // Solo permitir agregar nodos con touch en móvil y tablet
          (window.innerWidth < 1280 || /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile|Tablet/i.test(navigator.userAgent)) && (
            <Sidebar 
              onMobileAddNode={addNodeAtCenter} 
              isCopilotOpen={isCopilotOpen} 
              isMobileVertical={isMobileVertical}
            />
          )
        )}
      </div>
    </div>
  );
}
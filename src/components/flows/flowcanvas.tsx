import { Node, Edge, Connection, NodeChange, EdgeChange, ReactFlowInstance } from 'reactflow'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import { useCallback, useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2, Save } from "lucide-react" // Eliminado icono Bot
import { ThemeSwitcher } from '@/components/flows/ThemeSwitcher'
import './flow-controls.css'
import { nodeTypes } from './nodeTypes';
import { Copilot } from './copilot'; // Importar el componente Copilot

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

  return (
    <div className={`h-screen bg-[hsl(var(--canvas))] relative ${isLandscape ? 'w-auto' : 'w-screen'} md:ml-[320px] md:w-[calc(100vw-320px)]`}>
      {/* Botones para móvil */}
      <div className="fixed right-4 top-4 z-[1000] flex flex-col gap-3 sm:flex-row sm:gap-3 md:hidden bg-[hsl(var(--sidebar))] p-3 rounded-lg backdrop-blur shadow-md border">
        <ThemeSwitcher />
        
        <Button 
          variant="destructive" 
          size="icon"
          onClick={() => setNodes([])}
          title="Limpiar Canvas"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={handleSave}
          size="icon"
          className="bg-primary text-white hover:bg-primary/90 dark:text-white dark:hover:bg-primary/70"
          title="Guardar flujo"
        >
          <Save className="h-4 w-4" />
        </Button>

        {/* Componente Copilot para móvil */}
        <Copilot isMobile={true} />
      </div>

      {/* Botones para escritorio */}
      <div className="fixed right-4 top-4 z-[1000] hidden md:flex flex-row gap-3 bg-[hsl(var(--sidebar))] p-2.5 rounded-lg backdrop-blur shadow-md border">
        <ThemeSwitcher />
        
        <Button 
          variant="destructive" 
          onClick={() => setNodes([])}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpiar Canvas
        </Button>
        
        <Button 
          onClick={handleSave}
          className="bg-primary text-white hover:bg-primary/90 dark:text-white dark:hover:bg-primary/70 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar flujo
        </Button>

        {/* Componente Copilot para escritorio */}
        <Copilot isMobile={false} />
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
          nodeTypes={nodeTypes} // Asegurarse de que este nodeTypes contenga la referencia correcta
          fitView
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
      </div>
    </div>
  );
}
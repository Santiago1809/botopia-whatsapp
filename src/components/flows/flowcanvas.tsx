import { Node, Edge, Connection, NodeChange, EdgeChange, ReactFlowInstance, NodeProps as ReactFlowNodeProps } from 'reactflow'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import { useCallback, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2, Save } from "lucide-react"

// Use ReactFlow's NodeProps type instead of creating our own
/*interface NodeData {
  label: string;
  [key: string]: unknown;
}*/

// Remove our custom NodeProps interface and use ReactFlow's
interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  nodeTypes: {
    [key: string]: React.ComponentType<ReactFlowNodeProps>
  }
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes,
  nodeTypes,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dragData = event.dataTransfer.getData('application/reactflow');

      if (!dragData) {
        console.error('No data received in drag and drop');
        return;
      }

      try {
        const { type, label } = JSON.parse(dragData);

        // Get the position where the node was dropped
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: { label },
        };

        onNodesChange([{
          type: 'add',
          item: newNode,
        }]);
      } catch (error) {
        console.error('Error processing drag and drop data:', error);
      }
    },
    [reactFlowInstance, onNodesChange]
  );

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

  return (
    <div className="h-screen w-screen md:ml-[320px] bg-background relative">
      {/* Panel fijo de botones */}
      <div className="fixed right-4 top-4 z-[1000] flex gap-2 bg-background/80 p-2 rounded-lg backdrop-blur shadow-md">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setNodes([])}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Canvas
        </Button>
        <Button 
          onClick={handleSave}
          size="sm"
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          Guardar flujo
        </Button>
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
          nodeTypes={nodeTypes}
          fitView
          className="h-full w-full border rounded-lg"
        >
          <Controls className="!bg-background" />
          <Background />
          <MiniMap className="!bg-background border rounded-lg" />
        </ReactFlow>
      </div>
    </div>
  )
}
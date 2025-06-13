import { useCallback } from 'react'
import { type Node, type Edge, type Connection, type NodeChange, type EdgeChange } from 'reactflow'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useReactFlow,
} from 'reactflow'
import { Button } from "@/components/ui/button"
import { Trash2, Save } from "lucide-react"


interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: React.Dispatch<React.SetStateAction<Node[]>> // Añadimos esta línea
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setNodes, // Añadimos este prop
}: FlowCanvasProps) {
  const { project } = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const reactFlowBounds = event.currentTarget.getBoundingClientRect()
      const data = JSON.parse(event.dataTransfer.getData('application/reactflow'))

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode = {
        id: `${data.type}-${Date.now()}`,
        type: data.type,
        position,
        data: { label: data.label },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [project, setNodes]
  )

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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="h-full w-full border rounded-lg"
      >
        <Controls className="!bg-background" />
        <Background />
        <MiniMap className="!bg-background border rounded-lg" />
      </ReactFlow>
    </div>
  )
}
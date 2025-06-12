import { useCallback } from 'react'
import { type Node, type Edge, type Connection, type NodeChange, type EdgeChange } from 'reactflow'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useReactFlow,
  Panel
} from 'reactflow'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"


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
    [project]
  )

  return (
    <div className="h-screen w-screen md:ml-[320px] bg-background relative">
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="border rounded-lg"
      >
        <Panel position="top-right" className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setNodes([])}
          >
            <Trash2 className="h-4 w-4" />
            Clear Canvas
          </Button>
        </Panel>
        <Background />
        <Controls />
        <MiniMap className="border rounded-lg" />
      </ReactFlow>
    </div>
  )
}
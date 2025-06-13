import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DraggableNodeProps {
  type: string
  label: string
  icon?: React.ReactNode
}

export function DraggableNode({ type, label, icon }: DraggableNodeProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-colors",
        "border-2 border-dashed hover:border-solid",
        "hover:bg-primary hover:text-white",
        "active:bg-primary active:text-white",
        "group" // Agregamos la clase group para poder usar group-hover
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div className="text-primary group-hover:text-white group-active:text-white transition-colors">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </CardContent>
    </Card>
  )
}
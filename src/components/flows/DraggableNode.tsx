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
        "cursor-grab active:cursor-grabbing hover:bg-accent transition-colors",
        "border-2 border-dashed hover:border-solid"
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <span className="font-medium">{label}</span>
      </CardContent>
    </Card>
  )
}
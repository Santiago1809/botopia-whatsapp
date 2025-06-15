import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft } from "lucide-react" // Remove Phone
import Link from "next/link"
import { 
  CircleDot,
  MessageSquare,
  CircleOff,
} from "lucide-react"
import { BsWhatsapp } from 'react-icons/bs'
import React from "react" // Remove useState

export function Sidebar() {
  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="fixed left-4 top-4 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] p-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/services/flows/principal">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="hover:text-white group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:text-white transition-colors" />
                  <span className="sr-only">Volver a productos</span>
                </Button>
              </Link>
              <SheetTitle>herramientas de flujo</SheetTitle>
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-[320px] border-r bg-background p-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/services/flows/principal">
            <Button 
              variant="outline" 
              size="icon"
              className="hover:text-white group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:text-white transition-colors" />
              <span className="sr-only">Volver a productos</span>
            </Button>
          </Link>
          <h2 className="text-lg font-semibold">herramientas de flujo</h2>
        </div>
        <SidebarContent />
      </div>
    </>
  )
}

// Componente auxiliar para el contenido del sidebar
function SidebarContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Elementos de flujo</h3>
        <div className="grid gap-3">
          <DraggableNode
            type="input"
            label="Entrada"
            icon={<CircleDot className="h-4 w-4" />}
          />
          <DraggableNode
            type="default"
            label="Proceso"
            icon={<MessageSquare className="h-4 w-4" />}
          />
          <DraggableNode
            type="output"
            label="Salida"
            icon={<CircleOff className="h-4 w-4" />}
          />
          <DraggableNode
            type="whatsappNode"
            label="WhatsApp baruc"
            icon={<BsWhatsapp className="h-4 w-4 text-green-500" />}
          />
          <DraggableNode
            type="whatsappBusinessApi"
            label="WhatsApp Business API"
            icon={<BsWhatsapp className="h-4 w-4 text-green-500" />}
          />
        </div>
      </div>
    </div>
  )
}

// Modifica o agrega el componente DraggableNode
interface DraggableNodeProps {
  type: string;
  label: string;
  icon: React.ReactNode;
}

export function DraggableNode({ type, label, icon }: DraggableNodeProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Asegúrate de que el formato de los datos sea consistente
    const nodeData = {
      type,
      label,
    };
    
    // Establece el tipo MIME correcto
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center gap-2 p-3 border rounded-lg cursor-move hover:border-primary transition-colors"
      draggable
      onDragStart={onDragStart}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
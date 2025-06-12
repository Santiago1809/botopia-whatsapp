import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { 
  CircleDot, // Reemplazamos Input
  MessageSquare,
  CircleOff // Reemplazamos Output
} from "lucide-react"
import { DraggableNode } from "./DraggableNode"
import React from "react"

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
              <Link href="/services">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
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
          <Link href="/services">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
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
    <div className="space-y-4">
      <div className="grid gap-3">
        <DraggableNode
          type="input"
          label="Nodo de entrada"
          icon={<CircleDot className="h-4 w-4 text-primary" />}
        />
        <DraggableNode
          type="default"
          label="Nodo de proceso"
          icon={<MessageSquare className="h-4 w-4 text-primary" />}
        />
        <DraggableNode
          type="output"
          label="Nodo de salida"
          icon={<CircleOff className="h-4 w-4 text-primary" />}
        />
      </div>
    </div>
  )
}
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft } from "lucide-react"
import Link from "next/link"
import React, { useState, useEffect } from "react"

// Importar las secciones separadas
import { BarucSection } from "./baruc/ensamble"
import { AccionesSection } from "./acciones/ensamble"
import { ElementosSection } from "./elementos/ensamble"
import { DraggableNode } from "./DraggableNode"

export function Sidebar() {
  // Estado para detectar orientación horizontal en móvil
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  // Detectar orientación de pantalla
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        // Es móvil horizontal si ancho > alto y ancho < 768px (breakpoint md)
        setIsLandscapeMobile(
          window.innerWidth > window.innerHeight && 
          window.innerWidth < 768
        );
      }
    };

    // Verificar orientación inicial
    checkOrientation();
    
    // Actualizar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkOrientation);
    
    // Limpiar event listener
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

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
          <SheetContent 
            side="left" 
            className={`
              w-[320px] 
              p-4 pt-3
              bg-background dark:bg-[hsl(var(--sidebar))] 
              overflow-hidden
            `}
          >
            <div className={`
              flex items-center gap-4 
              ${isLandscapeMobile ? 'mb-1' : 'mb-3'}
            `}>
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
              <SheetTitle>Herramientas de flujo</SheetTitle>
            </div>
            
            {/* Contenedor con scroll - ajustado para modo horizontal */}
            <div className={`
              overflow-y-auto overflow-x-auto
              ${isLandscapeMobile 
                ? 'max-h-[calc(100vh-60px)] pr-1.5 pb-0.5' 
                : 'max-h-[calc(100vh-80px)] pr-2 pb-1'
              }
            `}>
              <SidebarContent isLandscapeMobile={isLandscapeMobile} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - este permanece sin cambios */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-[320px] border-r bg-background dark:bg-[hsl(var(--sidebar))] p-4 pt-3 overflow-hidden">
        <div className="flex items-center gap-4 mb-3">
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
          <h2 className="text-lg font-semibold">Herramientas de flujo</h2>
        </div>
        
        {/* Contenedor con scroll para escritorio - sin cambios */}
        <div className="overflow-y-auto overflow-x-auto max-h-[calc(100vh-70px)] pr-2 pb-1">
          <SidebarContent isLandscapeMobile={false} />
        </div>
      </div>
    </>
  )
}

// Componente auxiliar para el contenido del sidebar
function SidebarContent({ isLandscapeMobile }: { isLandscapeMobile: boolean }) {
  return (
    <div className={isLandscapeMobile ? "space-y-2" : "space-y-4"}>
      <BarucSection />
      <AccionesSection />
      <ElementosSection />
    </div>
  );
}

// Exportamos DraggableNode para mantener compatibilidad hacia atrás
export { DraggableNode };
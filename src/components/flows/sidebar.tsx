import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft, Brain, CreditCard, Phone, Lock, Link2, Webhook } from "lucide-react"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { BsWhatsapp } from "react-icons/bs"
import { SiGmail, SiNotion, SiGooglecalendar, SiSupabase, SiGooglesheets } from "react-icons/si"
import { FaHashtag, FaClock, FaBolt } from "react-icons/fa"
import { TbRepeat, TbArrowFork } from "react-icons/tb"

// Importar las secciones para la funcionalidad de arrastrar y soltar
import { BarucSection } from "./baruc/ensamble"
import { AccionesSection } from "./acciones/ensamble"
import { ElementosSection } from "./elementos/ensamble"
import { DraggableNode } from "./DraggableNode"

export function Sidebar({ onMobileAddNode, hideTrigger, isCopilotOpen, isMobileVertical }: { onMobileAddNode?: (type: string) => void, hideTrigger?: boolean, isCopilotOpen?: boolean, isMobileVertical?: boolean } = {}) {
  // Estado para detectar orientación horizontal en móvil
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  // Estado para mostrar/ocultar el sidebar en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Cierra el sidebar automáticamente si el chat se abre en móvil vertical
  useEffect(() => {
    if (isCopilotOpen && !isLandscapeMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isCopilotOpen, isLandscapeMobile, isSidebarOpen]);

  // Elimina el cálculo local de isMobileVertical, ahora viene por prop

  // Si el chat está abierto y es móvil vertical, no renderizar NADA del sidebar móvil ni el botón hamburguesa
  if (typeof window !== 'undefined' && isCopilotOpen && isMobileVertical) {
    return null; // <-- Esto oculta sidebar y botón hamburguesa completamente
  }

  const shouldShowMobileSidebar = (!hideTrigger || isLandscapeMobile);

  return (
    <>
      {/* Mobile Sidebar */}
      {shouldShowMobileSidebar && (
        <div className="md:hidden">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            {/* Solo mostrar el botón si NO está abierto el copilot en móvil vertical */}
            {(!isCopilotOpen || !isMobileVertical) && !hideTrigger && (
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="fixed left-4 z-50 transition-all duration-300 top-4 menu-button-hamburger" // Añadir clase específica
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            )}
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
                <Button 
                  variant="outline" 
                  size="icon"
                  className="hover:text-white group"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <ArrowLeft className="h-4 w-4 group-hover:text-white transition-colors" />
                  <span className="sr-only">Cerrar menú</span>
                </Button>
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
                <SidebarVisualContent isLandscapeMobile={isLandscapeMobile} onMobileAddNode={onMobileAddNode} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

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
          <SidebarVisualContent isLandscapeMobile={false} onMobileAddNode={onMobileAddNode} />
        </div>
      </div>
    </>
  )
}

// Componente auxiliar para el contenido visual del sidebar (tarjetas/bloques)
function SidebarVisualContent({ isLandscapeMobile, onMobileAddNode }: { isLandscapeMobile: boolean, onMobileAddNode?: (type: string) => void }) {
  return (
    <div className={isLandscapeMobile ? "space-y-2" : "space-y-6"}>
      {/* Sección Baruc */}
      <div>
        <h3 className="font-medium text-base mb-3">Baruc</h3>
        {/* Reorganizado en grid de 2 filas x 3 columnas */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2">
          {/* Fila 1, Columna 1: Llamadas con IA */}
          <DraggableNode 
            type="phoneWithIA" 
            label="Llamadas con IA" 
            icon={<Phone className="h-5 w-5 text-orange-500" />}
            section="baruc"
            bgColor="rgba(249, 168, 212, 0.1)"
            borderColor="rgba(249, 168, 212, 0.3)"
            onMobileAddNode={onMobileAddNode}
          />
          
          {/* Fila 1, Columna 2: Pagos */}
          <DraggableNode 
            type="payment" 
            label="Pagos" 
            icon={<CreditCard className="h-5 w-5 text-purple-500" />}
            section="baruc"
            bgColor="rgba(216, 180, 254, 0.1)"
            borderColor="rgba(216, 180, 254, 0.3)"
            onMobileAddNode={onMobileAddNode}
          />
          
          {/* Fila 1, Columna 3: Inteligencia Artificial */}
          <DraggableNode 
            type="IA" 
            label="Inteligencia Artificial" 
            icon={<Brain className="h-5 w-5 text-amber-500" />}
            section="baruc"
            bgColor="rgba(251, 191, 36, 0.1)"
            borderColor="rgba(251, 191, 36, 0.3)"
            onMobileAddNode={onMobileAddNode}
          />
          
          {/* Fila 2, Columna 1: WhatsApp baruc */}
          <DraggableNode 
            type="whatsappNode" 
            label="WhatsApp baruc" 
            icon={<BsWhatsapp className="h-5 w-5 text-green-600" />}
            section="baruc"
            bgColor="rgba(52, 211, 153, 0.1)"
            borderColor="rgba(52, 211, 153, 0.3)"
            onMobileAddNode={onMobileAddNode}
          />
          
          {/* Fila 2, Columna 2: WhatsApp API */}
          <DraggableNode 
            type="whatsappApi" 
            label="WhatsApp API" 
            icon={<BsWhatsapp className="h-5 w-5 text-blue-600" />}
            section="baruc"
            bgColor="rgba(147, 197, 253, 0.1)"
            borderColor="rgba(147, 197, 253, 0.3)"
            onMobileAddNode={onMobileAddNode}
          />
          
          {/* Webhook block for Baruc section */}
          <DraggableNode 
            type="webhookNode" 
            label="Webhook" 
            icon={<Webhook className="h-5 w-5 text-gray-500" />} 
            section="baruc"
            bgColor="rgba(156, 163, 175, 0.08)" // gris claro
            borderColor="rgba(156, 163, 175, 0.3)" // gris medio
            darkBgColor="rgba(75, 85, 99, 0.15)" // gris oscuro
            darkBorderColor="rgba(75, 85, 99, 0.4)" // gris más oscuro
            onMobileAddNode={onMobileAddNode}
          />
        </div>
      </div>
      
      {/* Sección Acciones */}
      <div>
        <h3 className="font-medium text-base mb-3">Acciones</h3>
        {/* Reorganizado en grid de 2 filas x 3 columnas */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2">
          {/* Fila 1, Columna 1: Gmail */}
          <LockedDraggableNode 
            type="gmail" 
            label="Gmail" 
            icon={<SiGmail className="h-5 w-5 text-red-500" />}
            section="acciones"
            bgColor="rgba(252, 165, 165, 0.1)"
            borderColor="rgba(252, 165, 165, 0.3)"
          />
          
          {/* Fila 1, Columna 2: Notion */}
          <LockedDraggableNode 
            type="notion" 
            label="Notion" 
            icon={<SiNotion className="h-5 w-5 text-gray-800 dark:text-gray-400" />}
            section="acciones"
            bgColor="rgba(8, 8, 8, 0.1)"      // Este color se usa en modo claro
            darkBgColor="rgba(150, 150, 150, 0.2)"  // Este color se usará en modo oscuro
            borderColor="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Fila 1, Columna 3: Calendar */}
          <LockedDraggableNode 
            type="googleCalendar" 
            label="Calendar" 
            icon={<SiGooglecalendar className="h-5 w-5 text-blue-500" />}
            section="acciones"
            bgColor="rgba(147, 197, 253, 0.1)"
            borderColor="rgba(147, 197, 253, 0.3)"
          />
          
          {/* Fila 2, Columna 1: Supabase */}
          <LockedDraggableNode 
            type="supabase" 
            label="Supabase" 
            icon={<SiSupabase className="h-5 w-5 text-green-600" />}
            section="acciones"
            bgColor="rgba(52, 211, 153, 0.1)"
            borderColor="rgba(52, 211, 153, 0.3)"
          />
          
          {/* Fila 2, Columna 2: Google Sheets */}
          <DraggableNode
            type="sheetsNode" 
            label="Sheets" 
            icon={<SiGooglesheets className="h-5 w-5 text-green-600" />}
            section="acciones"
            bgColor="rgba(52, 211, 153, 0.1)"
            borderColor="rgba(52, 211, 153, 0.3)"
          />
          
          {/* Fila 2, Columna 3: Vacío (para mantener el grid 2x3) */}
          <div className="invisible"></div>
        </div>
      </div>
      
      {/* Sección Elementos */}
      <div>
        <h3 className="font-medium text-base mb-3">Elementos</h3>
        {/* Reorganizado en grid de 2 filas x 3 columnas */}
        <div className="grid grid-cols-3 grid-rows-2 gap-2">
          {/* Fila 1, Columna 1: Disparador */}
          <LockedDraggableNode 
            type="trigger" 
            label="Disparador" 
            icon={<FaBolt className="h-5 w-5 text-yellow-500" />}
            section="elementos"
            bgColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Fila 1, Columna 2: Retraso */}
          <LockedDraggableNode 
            type="delay" 
            label="Retraso" 
            icon={<FaClock className="h-5 w-5 text-blue-400" />}
            section="elementos"
            bgColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Fila 1, Columna 3: Contador */}
          <LockedDraggableNode 
            type="counter" 
            label="Contador" 
            icon={<FaHashtag className="h-5 w-5 text-purple-500" />}
            section="elementos"
            bgColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Fila 2, Columna 1: Bucle */}
          <LockedDraggableNode 
            type="loop" 
            label="Bucle" 
            icon={<TbRepeat className="h-5 w-5 text-orange-400" />}
            section="elementos"
            bgColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Fila 2, Columna 2: Condición */}
          <LockedDraggableNode 
            type="condition" 
            label="Condición" 
            icon={<TbArrowFork className="h-5 w-5 text-cyan-500" />}
            section="elementos"
            bgColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(0, 0, 0, 0.3)"
          />
          
          {/* Fila 2, Columna 3: Vacío (para mantener el grid 2x3) */}
          <div className="invisible"></div>
        </div>
      </div>
      
      {/* Componentes originales para drag and drop - ocultos pero funcionales */}
      <div className="hidden">
        <BarucSection />
        <AccionesSection />
        <ElementosSection />
      </div>
    </div>
  );
}

// Exportamos DraggableNode para mantener compatibilidad hacia atrás
export { DraggableNode };

// Crear un componente wrapper para el overlay
function LockedDraggableNode(props: React.ComponentProps<typeof DraggableNode>) {
  return (
    <div className="relative group">
      <DraggableNode {...props} />
      {/* Overlay con efecto de desenfoque y semi-transparencia */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <Lock className="h-5 w-5 text-white mb-1" />
        <span className="text-white text-xs font-medium">Próximamente</span>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, RefreshCw } from "lucide-react";
import { CopilotAnimation, useCopilotAnimation } from "@/components/flows/copilot/copilotAnimation";
import "@/styles/jarvis-animation.css";

interface CopilotProps {
  isMobile?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isOpen?: boolean;
}

export function Copilot({ isMobile = false, onOpenChange, isOpen: externalIsOpen }: CopilotProps) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(externalIsOpen || false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hola, soy J.A.R.V.I.S. ¿En qué puedo ayudarte con tu flujo de WhatsApp?' }
  ]);
  const panelRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const {
    createCellParticles,
    animateIconTransition
  } = useCopilotAnimation(isCopilotOpen);

  // Función para reiniciar la conversación
  const resetConversation = useCallback(() => {
    setCopilotMessages([
      { role: 'assistant', content: 'Hola, soy J.A.R.V.I.S. ¿En qué puedo ayudarte con tu flujo de WhatsApp?' }
    ]);
  }, []);

  // Sincronizar con el estado externo
  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen !== isCopilotOpen) {
      setIsCopilotOpen(externalIsOpen);
    }
  }, [externalIsOpen, isCopilotOpen]);

  // Scroll al último mensaje cuando se añade uno nuevo
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages]);

  // Manejar envío de mensaje
  const handleSendMessage = () => {
    if (!copilotMessage.trim()) return;
    
    // Añadir mensaje del usuario
    setCopilotMessages(prev => [...prev, { role: 'user', content: copilotMessage }]);
    
    // Simular respuesta del asistente
    setTimeout(() => {
      setCopilotMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `He recibido tu mensaje: "${copilotMessage}". Estoy procesando tu solicitud...` 
        }
      ]);
    }, 1000);
    
    setCopilotMessage('');
  };

  // Manejar cambio de estado
  const toggleOpen = () => {
    const newState = !isCopilotOpen;
    setIsCopilotOpen(newState);
    
    if (onOpenChange) {
      onOpenChange(newState);
    }
    
    // Ejecutar las animaciones
    createCellParticles(newState ? 'in' : 'out');
    
    if (newState) {
      // Abrir chat - animar el icono del botón al chat
      animateIconTransition('to-chat', panelRef);
      
      // Asegurar que el icono aparezca después de todas las animaciones
      setTimeout(() => {
        // Este código ya se maneja en el componente de animación
      }, 1500);
    } else {
      // Cerrar chat - animar el icono del chat al botón
      animateIconTransition('to-button', panelRef);
    }
  };

  return (
    <div className="relative bg-transparent">
      {/* Componente de animación */}
      <CopilotAnimation 
        isMobile={isMobile} 
        isCopilotOpen={isCopilotOpen} 
        toggleOpen={toggleOpen}
        panelRef={panelRef}
      />

      {/* Panel de chat */}
      {isCopilotOpen && (
        <div 
          ref={panelRef}
          className="absolute left-full ml-4 z-[1001] bg-card border rounded-lg shadow-lg w-80 md:w-[320px] transition-all duration-500"
          style={{ 
            top: '-12px',
            height: isMobile ? 'calc(98vh)' : 'calc(100vh - 1rem)',
            transform: `translateX(${isCopilotOpen ? '0' : '-30px'}) scale(${isCopilotOpen ? '1' : '0.8'})`,
            opacity: isCopilotOpen ? 1 : 0,
            transformOrigin: 'left top',
            animation: isCopilotOpen ? 'panel-emerge 0.5s ease-out forwards' : 'none',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 8px 10px -6px rgba(245, 158, 11, 0.2)'
          }}
        >
          {/* Encabezado - icono visible cuando el chat está abierto y la animación terminó */}
          <div className="bg-muted/50 p-3 border-b flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5">
                {/* El ícono se maneja en el componente de animación */}
              </div>
              <h3 className="font-medium text-md">J.A.R.V.I.S.</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 hover:bg-primary hover:text-white transition-colors" 
              onClick={toggleOpen}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botón de nueva conversación */}
          <div className="px-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
              onClick={resetConversation}
            >
              <RefreshCw className="h-3 w-3" />
              Nueva conversación
            </Button>
          </div>
          
          {/* Contenido del chat */}
          <div className="flex flex-col h-[calc(100%-130px)] p-3 overflow-hidden">
            <div className="overflow-y-auto flex-1 space-y-3 pb-2">
              {copilotMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`${
                    msg.role === 'user' 
                      ? 'bg-primary/10 ml-auto' 
                      : 'bg-muted/50'
                  } p-3 rounded-lg max-w-[85%]`}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            
            {/* Input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={copilotMessage}
                onChange={(e) => setCopilotMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 p-2 rounded-md border bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                size="icon" 
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleSendMessage}
                disabled={!copilotMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
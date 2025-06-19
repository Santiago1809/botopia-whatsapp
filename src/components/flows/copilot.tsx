import { useState } from 'react'
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CopilotProps {
  isMobile?: boolean;  // Para renderizar versión móvil o escritorio
}

export function Copilot({ /* isMobile */ }: CopilotProps) {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);

  // Función para enviar mensaje a Copilot
  const handleSendMessage = () => {
    if (!copilotMessage.trim()) return;
    
    // Añadir mensaje del usuario a la conversación
    const newMessages = [
      ...copilotMessages,
      { role: 'user' as const, content: copilotMessage }
    ];
    setCopilotMessages(newMessages);
    
    // En una implementación real, aquí se enviaría la petición a la API de Copilot
    // Por ahora solo agregamos una respuesta simulada
    setTimeout(() => {
      setCopilotMessages([
        ...newMessages,
        {
          role: 'assistant' as const,
          content: "Soy GitHub Copilot, tu asistente de IA. ¿En qué puedo ayudarte con tu flujo actual?"
        }
      ]);
    }, 500);
    
    setCopilotMessage('');
  };

  return (
    <>
      {/* Botón de Copilot siempre como icono, independiente del tamaño de pantalla */}
      <Button 
        onClick={() => setIsCopilotOpen(true)}
        size="icon"
        className="bg-blue-600 text-white hover:bg-blue-700 dark:text-white"
        title="Abrir Copilot"
      >
        <Bot className="h-4 w-4" />
      </Button>

      {/* Diálogo de Copilot */}
      <Dialog open={isCopilotOpen} onOpenChange={setIsCopilotOpen}>
        <DialogContent className="sm:max-w-[500px] h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              GitHub Copilot
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-grow pr-4 mb-4">
            <div className="space-y-4">
              {copilotMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Haz una pregunta a Copilot sobre tu flujo de trabajo
                </div>
              ) : (
                copilotMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-8' 
                        : 'bg-muted mr-8'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Textarea 
              placeholder="Escribe tu mensaje para Copilot..." 
              value={copilotMessage}
              onChange={(e) => setCopilotMessage(e.target.value)}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
              Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
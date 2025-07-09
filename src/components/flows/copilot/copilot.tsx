import { useState, useRef, useEffect, useCallback } from "react";
import { JarvisIcon } from "@/components/icons/jarvis-icon";
import "@/styles/jarvis-animation.css";
// Importamos las funciones de animación
import {
  CellParticle,
  IconTransitionState,
  createCellParticles,
  animateIconTransition
} from "@/lib/animations/jarvis-animations";

// Importamos los componentes UI factorizados
import {
  AIModel,
  ChatMessage,
  ChatToolbar,
  ChatMessages,
  FileAttachments,
  RecordingUI,
  AudioPreview,
  MessageInput
} from "./copilot-ui-components";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CopilotProps {
  isMobile?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isOpen?: boolean;
}

export function Copilot({ isMobile = false, onOpenChange, isOpen: externalIsOpen }: CopilotProps) {
  // State declarations
  const [isCopilotOpen, setIsCopilotOpen] = useState(externalIsOpen || false);
  const [copilotMessage, setCopilotMessage] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hola, soy A.T.O.M. ¿En qué puedo ayudarte con tu flujo de WhatsApp?' }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cellParticles, setCellParticles] = useState<CellParticle[]>([]);
  const [showHeaderIcon, setShowHeaderIcon] = useState(false);
  const [iconTransition, setIconTransition] = useState<IconTransitionState>({
    active: false,
    direction: 'to-chat',
    style: {}
  });

  // Nuevos estados para las funcionalidades adicionales
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [aiModel, setAiModel] = useState<AIModel>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para controlar la visibilidad del panel durante la animación de cierre
  const [showPanel, setShowPanel] = useState(isCopilotOpen);
  
  // Referencias
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Estado para hover del botón Copilot
  const [isHovering, setIsHovering] = useState(false);
  const [hoverParticles, setHoverParticles] = useState<{ id: number; top: number; left: number }[]>([]);

  // Nuevos estados para la animación tipo Dynamic Island
  const [copilotBtnFade, setCopilotBtnFade] = useState('visible'); // 'visible', 'fading', 'hidden'
  const [chatPanelAnim, setChatPanelAnim] = useState('hidden'); // 'hidden', 'fading-in', 'visible', 'fading-out'

  // Dynamic Island: calcula la posición y tamaño para la burbuja/gota
  const [islandStyle, setIslandStyle] = useState({});

  // Funciones de animación factorizadas
  const handleCreateCellParticles = useCallback((direction: 'in' | 'out') => {
    createCellParticles(
      direction,
      setIsAnimating,
      setShowHeaderIcon,
      setCellParticles
      // Eliminar el parámetro isCopilotOpen
    );
  }, []);
  
  const handleAnimateIconTransition = useCallback((direction: 'to-chat' | 'to-button') => {
    // Solo llamar a la función si las referencias existen
    if (buttonRef.current && panelRef.current) {
      animateIconTransition(
        direction,
        buttonRef as React.RefObject<HTMLButtonElement>,
        panelRef as React.RefObject<HTMLDivElement>,
        setShowHeaderIcon,
        setIconTransition
        // Eliminar el parámetro isCopilotOpen
      );
    }
  }, []);

  // Función para abrir el selector de archivos
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  // Función para manejar la selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convertir FileList a array y limitar a máximo 3 archivos
      const filesArray = Array.from(e.target.files).slice(0, 3);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Función para eliminar un archivo seleccionado
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Funciones para manejo de grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        // Detener todas las pistas del stream para liberar el micrófono
        stream.getTracks().forEach(track => track.stop());
      };
      
      setIsRecording(true);
      setRecordingTime(0);
      mediaRecorder.start();
      
      // Iniciar temporizador para mostrar tiempo de grabación
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Detener el temporizador
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };
  
  // Convertir segundos a formato mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Función para cancelar la grabación de audio
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioBlob(null);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Función para reiniciar la conversación
  const resetConversation = useCallback(() => {
    setCopilotMessages([
      { role: 'assistant', content: 'Hola, soy A.T.O.M. ¿En qué puedo ayudarte con tu flujo de WhatsApp?' }
    ]);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setSelectedFiles([]);
    setAudioBlob(null);
  }, []);
  
  // Sincronizar con el estado externo
  useEffect(() => {
    if (externalIsOpen !== undefined && externalIsOpen !== isCopilotOpen) {
      setIsCopilotOpen(externalIsOpen);
      
      if (externalIsOpen) {
        setShowHeaderIcon(false);
        handleCreateCellParticles('in');
        handleAnimateIconTransition('to-chat');
      } else {
        setShowHeaderIcon(false);
        handleAnimateIconTransition('to-button');
      }
    }
  }, [externalIsOpen, isCopilotOpen, handleCreateCellParticles, handleAnimateIconTransition]);

  // Limpiar recursos de audio al desmontar
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Scroll al último mensaje cuando se añade uno nuevo
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages]);

  // Manejar envío de mensaje actualizado con archivos y audio
  const handleSendMessage = () => {
    // No enviar si no hay contenido (mensaje, archivos o audio)
    if (!copilotMessage.trim() && selectedFiles.length === 0 && !audioBlob) return;
    
    // Crear attachments para archivos
    let attachments: string[] = [];
    
    // Simular URLs para archivos adjuntos (en producción, habría que subirlos a un servidor)
    if (selectedFiles.length > 0) {
      attachments = selectedFiles.map(file => URL.createObjectURL(file));
    }
    
    // Agregar audio si existe
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      attachments.push(audioUrl);
    }
    
    // Añadir mensaje del usuario
    setCopilotMessages(prev => [
      ...prev, 
      { 
        role: 'user', 
        content: copilotMessage.trim() || (attachments.length > 0 ? 'Archivos adjuntos' : ''),
        ...(attachments.length > 0 && { attachments })
      }
    ]);
    
    // Limpiar estados
    setCopilotMessage('');
    setSelectedFiles([]);
    setAudioBlob(null);
    setIsProcessing(true);
    
    // Simular respuesta del asistente según el modelo de IA seleccionado
    setTimeout(() => {
      setIsProcessing(false);
      let responseContent = '';
      
      switch (aiModel) {
        case 'creative':
          responseContent = `¡Ideas creativas para tu mensaje! 💡 He recibido ${attachments.length > 0 ? 'tus archivos adjuntos' : 'tu mensaje'}. Déjame pensar de forma innovadora...`;
          break;
        case 'precise':
          responseContent = `Análisis preciso: He procesado ${attachments.length > 0 ? `${attachments.length} archivos adjuntos` : 'tu consulta'}. Trabajando para darte una respuesta exacta.`;
          break;
        default:
          responseContent = `He recibido tu mensaje${attachments.length > 0 ? ' y archivos adjuntos' : ''}. Estoy procesando tu solicitud...`;
      }
      
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    }, 1500);
  };

  // Manejar cambio de estado
  const toggleOpen = () => {
    const newState = !isCopilotOpen;
    setIsCopilotOpen(newState);

    if (onOpenChange) {
      onOpenChange(newState);
    }

    // Ejecutar las animaciones
    handleCreateCellParticles(newState ? 'in' : 'out');

    if (newState) {
      // Abrir chat - animar el icono del botón al chat
      handleAnimateIconTransition('to-chat');
      setShowHeaderIcon(false);
      // Asegurarnos de que el icono esté oculto inicialmente
      // Usando newState directamente en lugar de isCopilotOpen para evitar problemas de closure
      const iconTimer = setTimeout(() => {
        setShowHeaderIcon(true);
        // Forzar actualización del componente
        setIconTransition(prev => ({ ...prev }));
      }, 1800);
      
      // Sistema de respaldo - más simple y efectivo
      const backupTimer = setTimeout(() => {
        setShowHeaderIcon(true);
        // Forzar actualización del componente
        setIconTransition(prev => ({ ...prev, active: false }));
      }, 2500);
      
      // Tercer respaldo por si todo lo demás falla
      const lastResortTimer = setTimeout(() => {
        setShowHeaderIcon(true);
      }, 3000);
      
      // Limpiar temporizadores si el componente se desmonta
      return () => {
        clearTimeout(iconTimer);
        clearTimeout(backupTimer);
        clearTimeout(lastResortTimer);
      };
    } else {
      // Al cerrar, cancelar grabación si está activa
      if (isRecording) {
        cancelRecording();
      }
      // Cerrar chat - animar el icono del chat al botón
      handleAnimateIconTransition('to-button');
      // Ocultar el icono del header durante la animación de cierre
      setShowHeaderIcon(false);
      // Mostrar el icono del botón JARVIS después de la animación de cierre (500ms)
      setTimeout(() => {
        setShowHeaderIcon(true);
      }, 500);
    }
  };

  // Agregar este useEffect después de los otros useEffects existentes
  useEffect(() => {
    // Si el chat está abierto pero el icono no está visible después de un tiempo
    if (isCopilotOpen && !showHeaderIcon) {
      const forceShowTimer = setTimeout(() => {
        setShowHeaderIcon(true);
      }, 2000);
      
      return () => clearTimeout(forceShowTimer);
    }
  }, [isCopilotOpen, showHeaderIcon]);

  // Sincronizar showPanel con isCopilotOpen para animación de cierre
  useEffect(() => {
    if (isCopilotOpen) {
      setShowPanel(true);
    } else if (showPanel) {
      // Esperar la duración de la animación antes de ocultar el panel
      const timeout = setTimeout(() => setShowPanel(false), 500); // 500ms igual que la animación
      return () => clearTimeout(timeout);
    }
  }, [isCopilotOpen, showPanel]);

  // Manejo de partículas de hover
  const handleMouseEnter = () => {
    setIsHovering(true);
    // Generar partículas de hover (10 aleatorias)
    const particles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      top: Math.random() * 100,
      left: 40 + Math.random() * 20 // alrededor del centro del botón
    }));
    setHoverParticles(particles);
  };
  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverParticles([]);
  };

  // --- Dynamic Island tipo gota/burbuja ---
  const [isIslandActive, setIsIslandActive] = useState(false);
  const [isIslandExpanding, setIsIslandExpanding] = useState(false);
  const [showCopilotBtn, setShowCopilotBtn] = useState(true);
  const [showChatPanel, setShowChatPanel] = useState(showPanel);

  // Sincroniza la animación visual con la apertura/cierre del chat
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      if (externalIsOpen) {
        // Al abrir: inicia expansión, oculta botón, muestra chat al final
        setIsIslandActive(true);
        setIsIslandExpanding(true);
        setCopilotBtnFade('fading');
        setTimeout(() => setCopilotBtnFade('hidden'), 320); // fade más suave
        setTimeout(() => {
          setShowChatPanel(true);
          setChatPanelAnim('fading-in');
          setIsIslandExpanding(false);
        }, 380); // chat aparece justo cuando la burbuja "llega"
        setTimeout(() => setChatPanelAnim('visible'), 800); // chat completamente visible
        setTimeout(() => setIsIslandActive(false), 1100); // isla se apaga después de la elasticidad
      } else {
        // Al cerrar: inicia contracción, oculta chat, muestra botón al final
        setIsIslandActive(true);
        setIsIslandExpanding(false);
        setChatPanelAnim('fading-out');
        setTimeout(() => setShowChatPanel(false), 380); // chat desaparece progresivo
        setTimeout(() => setCopilotBtnFade('fading'), 380); // botón empieza a aparecer
        setTimeout(() => setCopilotBtnFade('visible'), 800); // botón completamente visible
        setTimeout(() => setIsIslandActive(false), 1100); // isla se apaga
      }
    }
  }, [externalIsOpen]);

  // Calcula la posición/tamaño de la burbuja para cubrir del botón al chat, pero la hace más grande para un efecto impactante
  useEffect(() => {
    if (isIslandActive && buttonRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      let style = {
        top: (btnRect.top - btnRect.height * 0.3) + 'px',
        left: (btnRect.left - btnRect.width * 0.3) + 'px',
        width: (btnRect.width * 1.6) + 'px',
        height: (btnRect.height * 1.6) + 'px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 60% 40%, rgba(245,158,11,0.18) 0%, rgba(59,130,246,0.10) 100%)',
        boxShadow: '0 0 32px 8px rgba(245,158,11,0.15)',
        transition: 'all 0.38s cubic-bezier(0.22,1,0.36,1)',
        pointerEvents: 'none',
        transform: 'translateX(0)' // default
      };
      if (isIslandExpanding && panelRef.current) {
        const panelRect = panelRef.current.getBoundingClientRect();
        const minTop = Math.min(btnRect.top, panelRect.top) - 40;
        const minLeft = Math.min(btnRect.left, panelRect.left) - 40;
        const maxRight = Math.max(btnRect.right, panelRect.right) + 40;
        const maxBottom = Math.max(btnRect.bottom, panelRect.bottom) + 40;
        style = {
          top: minTop + 'px',
          left: minLeft + 'px',
          width: (maxRight - minLeft) + 'px',
          height: (maxBottom - minTop) + 'px',
          borderRadius: '20px',
          background: 'radial-gradient(circle at 60% 40%, rgba(245,158,11,0.18) 0%, rgba(59,130,246,0.10) 100%)',
          boxShadow: '0 8px 48px 0 rgba(245,158,11,0.22)',
          transition: 'all 0.62s cubic-bezier(0.22,1.2,0.36,1)',
          pointerEvents: 'none',
          transform: 'translateX(0)'
        };
      } else if (!isIslandExpanding && panelRef.current) {
        // Animación de cierre: burbuja se contrae hacia la derecha (de chat a botón)
        const panelRect = panelRef.current.getBoundingClientRect();
        const minTop = Math.min(btnRect.top, panelRect.top) - 40;
        const minLeft = Math.min(btnRect.left, panelRect.left) - 40;
        const maxRight = Math.max(btnRect.right, panelRect.right) + 40;
        const maxBottom = Math.max(btnRect.bottom, panelRect.bottom) + 40;
        // Calcula la distancia horizontal del chat al botón
        const deltaX = btnRect.left - panelRect.left;
        style = {
          top: minTop + 'px',
          left: minLeft + 'px',
          width: (maxRight - minLeft) + 'px',
          height: (maxBottom - minTop) + 'px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 40%, rgba(245,158,11,0.18) 0%, rgba(59,130,246,0.10) 100%)',
          boxShadow: '0 0 32px 8px rgba(245,158,11,0.15)',
          transition: 'all 0.52s cubic-bezier(0.22,1.2,0.36,1)',
          pointerEvents: 'none',
          // Efecto de cierre: mueve la burbuja de derecha a izquierda
          transform: `translateX(${deltaX}px)`
        };
      }
      setIslandStyle(style);
    }
  }, [isIslandActive, isIslandExpanding, showChatPanel]);

  // --- Renderizado ---
  return (
    <>
      {/* Dynamic Island tipo gota/burbuja: animación con clip-path */}
      {isIslandActive && (
        <div
          className={`dynamic-island-bubble pointer-events-none ${isIslandExpanding ? 'island-bubble-expand' : 'island-bubble-contract'}`}
          style={{
            position: 'fixed',
            ...islandStyle,
            zIndex: 2000,
          }}
        />
      )}

      {/* Botón Copilot: fade y scale progresivo */}
      {copilotBtnFade !== 'hidden' && (
        <button
          ref={buttonRef}
          onClick={toggleOpen}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`w-full h-full flex items-center justify-center rounded-md transition-all duration-300 bg-transparent shadow-none text-amber-400 hover:bg-transparent hover:bg-opacity-0 custom-pointer copilot-btn-fade-${copilotBtnFade}`}
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            position: 'relative',
            filter: copilotBtnFade === 'hidden' ? 'none' : undefined // Elimina el brillo al ocultar
          }}
          aria-label="Abrir asistente A.T.O.M."
          title="Asistente A.T.O.M."
        >
          {!iconTransition.active && (
            <div className={`relative w-9 h-9 bg-transparent copilot-icon-fade-${copilotBtnFade}`}
              style={{ opacity: copilotBtnFade === 'hidden' ? 0 : 1, transition: 'opacity 0.3s', filter: copilotBtnFade === 'hidden' ? 'none' : undefined }}>
              <JarvisIcon className={`w-9 h-9 transition-transform duration-300 ${(!isMobile && isHovering) ? 'scale-150' : ''} ${isAnimating ? 'animate-pulse' : ''}`} />
              {isAnimating && cellParticles.map(particle => (
                <div
                  key={particle.id}
                  className={`absolute w-1 h-1 bg-amber-300 rounded-full pointer-events-none cellular-particle-${particle.direction}`}
                  style={{
                    top: `${particle.top}%`,
                    left: '50%',
                    animationDelay: `${particle.delay}s`
                  }}
                />
              ))}
            </div>
          )}
        </button>
      )}
      {iconTransition.active && (
        <div style={iconTransition.style as React.CSSProperties} className="pointer-events-none">
          <JarvisIcon className={`w-full h-full text-amber-400 ${isAnimating ? 'animate-pulse' : ''}`} />
        </div>
      )}

      {/* Panel de chat: fade y scale progresivo */}
      {showChatPanel && (
        <div
          ref={panelRef}
          className={`absolute left-full ml-4 z-[1001] bg-card border rounded-lg shadow-lg w-80 md:w-[320px] transition-all duration-500 chat-panel-anim-${chatPanelAnim}`}
          style={{
            top: '1px', // <-- Alineado con los botones superiores
            height: isMobile ? 'calc(98vh)' : 'calc(100vh - 1rem)',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 8px 10px -6px rgba(245, 158, 11, 0.2)'
          }}
        >
          {/* Encabezado - icono visible cuando el chat está abierto y la animación terminó */}
          <div className="bg-muted/50 p-3 border-b flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Garantizar que el icono se muestre */}
                {showHeaderIcon && (
                  <JarvisIcon 
                    className="w-5 h-5 text-amber-400" 
                    style={{ 
                      display: 'block', 
                      opacity: 1,
                      animation: 'fadeIn 0.3s ease-in'
                    }} 
                  />
                )}
              </div>
              <h3 className="font-medium text-md">A.T.O.M.</h3>
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
          
          <ChatToolbar 
            resetConversation={resetConversation}
            aiModel={aiModel}
            setAiModel={setAiModel}
          />
          
          <div className="flex flex-col h-[calc(100%-100px)] p-3 overflow-hidden">
            <ChatMessages 
              messages={copilotMessages}
              isProcessing={isProcessing}
              messageEndRef={messageEndRef as React.RefObject<HTMLDivElement>}
            />
            
            <FileAttachments 
              selectedFiles={selectedFiles}
              removeFile={removeFile}
            />
            
            <RecordingUI 
              isRecording={isRecording}
              recordingTime={recordingTime}
              stopRecording={stopRecording}
              formatTime={formatTime}
            />
            
            <AudioPreview 
              audioBlob={audioBlob}
              isRecording={isRecording}
              clearAudio={() => setAudioBlob(null)}
            />
            
            {/* Espaciador que empuja los controles de entrada hacia el borde inferior */}
            <div className="mt-auto" style={{ height: '2px' }}></div>
            
            <MessageInput 
              message={copilotMessage}
              setMessage={setCopilotMessage}
              handleSend={handleSendMessage}
              handleAttachFile={handleAttachFile}
              isRecording={isRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              selectedFiles={selectedFiles}
              audioBlob={audioBlob}
              isProcessing={isProcessing}
              fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
              handleFileSelect={handleFileSelect}
            />
          </div>
        </div>
      )}
    </>
  );
}

// CSS global recomendado (agregar en el archivo CSS principal):
//
// .custom-pointer, button, [role="button"] {
//   cursor: url('/public/cursor-pointer-hand.cur'), pointer;
// }
//
// Asegúrate de tener el archivo 'cursor-pointer-hand.cur' en tu carpeta 'public' o la ruta correspondiente.

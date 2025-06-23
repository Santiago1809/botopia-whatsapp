import React, { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, RefreshCw, Paperclip, Mic, StopCircle, BrainCircuit, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JarvisIcon } from "@/components/icons/jarvis-icon";

// Tipos reutilizables
export type AIModel = 'standard' | 'creative' | 'precise';
export type MessageRole = 'user' | 'assistant';
export type ChatMessage = {
  role: MessageRole;
  content: string;
  attachments?: string[];
};

// Componente: Encabezado del chat
interface HeaderProps {
  showHeaderIcon: boolean;
  isTransitioning: boolean;
  onClose: () => void;
}

export const ChatHeader: React.FC<HeaderProps> = ({ 
  showHeaderIcon, 
  isTransitioning, 
  onClose 
}) => (
  <div className="bg-muted/50 p-3 border-b flex justify-between items-center rounded-t-lg">
    <div className="flex items-center gap-2">
      <div className="relative w-5 h-5">
        {showHeaderIcon && !isTransitioning && (
          <JarvisIcon className="w-5 h-5 text-amber-400 animate-fade-in" />
        )}
      </div>
      <h3 className="font-medium text-md">J.A.R.V.I.S.</h3>
    </div>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-7 w-7 hover:bg-primary hover:text-white transition-colors" 
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
);

// Componente: Barra de herramientas
interface ToolbarProps {
  resetConversation: () => void;
  aiModel: AIModel;
  setAiModel: (model: AIModel) => void;
}

export const ChatToolbar: React.FC<ToolbarProps> = ({ 
  resetConversation, 
  aiModel, 
  setAiModel 
}) => {
  const getAIModelName = (model: AIModel): string => {
    switch (model) {
      case 'creative': return 'Creativo';
      case 'precise': return 'Preciso';
      default: return 'Estándar';
    }
  };

  return (
    <div className="px-3 pt-2 flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        className="text-xs flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
        onClick={resetConversation}
      >
        <RefreshCw className="h-3 w-3" />
        Nueva conversación
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center gap-1"
          >
            <BrainCircuit className="h-3 w-3" />
            {getAIModelName(aiModel)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className={aiModel === 'standard' ? 'bg-muted/50' : ''} 
            onClick={() => setAiModel('standard')}
          >
            Estándar
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={aiModel === 'creative' ? 'bg-muted/50' : ''} 
            onClick={() => setAiModel('creative')}
          >
            Creativo
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={aiModel === 'precise' ? 'bg-muted/50' : ''} 
            onClick={() => setAiModel('precise')}
          >
            Preciso
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Componente: Mensajes de chat
interface ChatMessagesProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  messageEndRef: RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isProcessing, 
  messageEndRef 
}) => (
  <div className="overflow-y-auto flex-1 space-y-3 pb-2">
    {messages.map((msg, idx) => (
      <div 
        key={idx} 
        className={`${
          msg.role === 'user' 
            ? 'bg-primary/10 ml-auto' 
            : 'bg-muted/50'
        } p-3 rounded-lg max-w-[85%]`}
      >
        <p>{msg.content}</p>
        
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {msg.attachments.map((attachment, i) => (
              attachment.includes('audio/webm') ? (
                <div key={i} className="mt-2">
                  <audio 
                    src={attachment} 
                    controls 
                    className="w-full h-8"
                    controlsList="nodownload" 
                  />
                </div>
              ) : (
                <div key={i} className="flex items-center gap-1 text-xs p-1 bg-white/30 dark:bg-black/30 rounded">
                  <Paperclip className="h-3 w-3" />
                  <span className="truncate">Archivo adjunto {i + 1}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    ))}
    
    {isProcessing && (
      <div className="bg-muted/50 p-3 rounded-lg max-w-[85%] flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-sm">Procesando...</span>
      </div>
    )}
    
    <div ref={messageEndRef} />
  </div>
);

// Componente: Selector de archivos
interface FileAttachmentsProps {
  selectedFiles: File[];
  removeFile: (index: number) => void;
}

export const FileAttachments: React.FC<FileAttachmentsProps> = ({
  selectedFiles,
  removeFile
}) => {
  if (selectedFiles.length === 0) return null;
  
  return (
    <div className="mb-2 p-2 border rounded-md bg-muted/30">
      <p className="text-xs mb-1">Archivos seleccionados:</p>
      <div className="flex flex-wrap gap-1">
        {selectedFiles.map((file, index) => (
          <div key={index} className="flex items-center bg-white/50 dark:bg-black/50 rounded-full px-2 py-0.5 text-xs">
            <Paperclip className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[100px]">{file.name}</span>
            <button 
              onClick={() => removeFile(index)} 
              className="ml-1 text-gray-500 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente: UI de grabación de audio
interface RecordingUIProps {
  isRecording: boolean;
  recordingTime: number;
  stopRecording: () => void;
  formatTime: (seconds: number) => string;
}

export const RecordingUI: React.FC<RecordingUIProps> = ({
  isRecording,
  recordingTime,
  stopRecording,
  formatTime
}) => {
  if (!isRecording) return null;
  
  return (
    <div className="mb-2 p-2 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm">Grabando {formatTime(recordingTime)}</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0" 
        onClick={stopRecording}
      >
        <StopCircle className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};

// Componente: Visualizador de audio grabado
interface AudioPreviewProps {
  audioBlob: Blob | null;
  isRecording: boolean;
  clearAudio: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioBlob,
  isRecording,
  clearAudio
}) => {
  if (!audioBlob || isRecording) return null;
  
  return (
    <div className="mb-2 p-2 border rounded-md bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-xs">Audio grabado:</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={clearAudio}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <audio 
        src={URL.createObjectURL(audioBlob)} 
        controls 
        className="w-full h-8 mt-1"
      />
    </div>
  );
};

// Componente: Entrada de mensajes
interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSend: () => void;
  handleAttachFile: () => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  selectedFiles: File[];
  audioBlob: Blob | null;
  isProcessing: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSend,
  handleAttachFile,
  isRecording,
  startRecording,
  stopRecording,
  selectedFiles,
  audioBlob,
  isProcessing,
  fileInputRef,
  handleFileSelect
}) => (
  <div className="mt-3">
    <div className="relative flex items-center">
      {/* Campo de texto con contenedor que aloja los iconos */}
      <div className="flex-1 flex items-center gap-1 px-1 py-1 rounded-md border bg-background relative">
        {/* Botón adjuntar archivo */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 shrink-0 hover:bg-muted" 
          onClick={handleAttachFile}
          disabled={isRecording}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        {/* Input oculto para seleccionar archivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
        />
        
        {/* Campo de texto */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          disabled={isRecording}
        />

        {/* Botón de micrófono */}
        <Button 
          variant={isRecording ? "destructive" : "ghost"} 
          size="icon" 
          className="h-7 w-7 shrink-0 hover:bg-muted" 
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Botón enviar */}
      <Button 
        size="icon" 
        className="h-9 w-9 ml-1 bg-primary text-white hover:bg-primary/90 rounded-full"
        onClick={handleSend}
        disabled={(isRecording || (!message.trim() && selectedFiles.length === 0 && !audioBlob)) && !isProcessing}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
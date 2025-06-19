import React, { useState, memo,} from 'react';
import { Handle, Position } from 'reactflow';
import { Phone, ChevronDown, Check, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces
export interface VoiceModel {
  id: string;
  name: string;
  provider: string;
  gender: 'male' | 'female' | 'neutral';
  language: string; 
  status: 'available' | 'unavailable';
}

export interface CallServiceProps {
  selectedVoice: VoiceModel | null;
  voices: VoiceModel[];
  isLoading: boolean;
  onSelectVoice: (voice: VoiceModel) => void;
}

// Componente para los puntos de conexión
const ConnectionHandles = memo(() => (
  <>
    <Handle type="target" position={Position.Top} className="w-3 h-3" id="top-target" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" id="bottom-source" />
    <Handle type="target" position={Position.Left} className="w-3 h-3" id="left-target" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" id="right-source" />
  </>
));
ConnectionHandles.displayName = "ConnectionHandles";

// Componente principal 
export function CallServiceUI({
  selectedVoice,
  voices,
  isLoading,
  onSelectVoice
}: CallServiceProps) {
  const [callDuration, setCallDuration] = useState<number>(30);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-blue-500/30 px-4 py-3 min-w-[280px]">
      <ConnectionHandles />
      
      <div className="flex flex-col gap-3">
        {/* Selector de voz */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-sm dark:text-white">
                    {selectedVoice ? selectedVoice.name : 'Seleccionar voz'}
                  </p>
                  {selectedVoice && (
                    <p className="text-xs text-muted-foreground">{selectedVoice.provider}</p>
                  )}
                </div>
              </div>
              {selectedVoice && (
                <Badge 
                  variant={selectedVoice.status === 'available' ? "success" : "destructive"}
                >
                  {selectedVoice.status === 'available' ? "Disponible" : "No disponible"}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-[240px] max-h-[280px] overflow-auto">
            {voices.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => onSelectVoice(voice)}
                disabled={isLoading}
              >
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="font-medium">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.provider}</p>
                  </div>
                  {selectedVoice?.id === voice.id && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {selectedVoice && (
          <Card className="p-3 border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">
              Configuración de llamada
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Duración: {callDuration} segundos</span>
                  <span className="text-blue-600">
                    {callDuration <= 30 ? 'Corta' : callDuration >= 60 ? 'Larga' : 'Media'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={callDuration}
                  onChange={(e) => setCallDuration(parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-full accent-blue-500"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Datos de ejemplo para testing
export const demoVoices: VoiceModel[] = [
  { 
    id: '1', 
    name: 'Juan', 
    provider: 'Eleven Labs', 
    gender: 'male', 
    language: 'Español', 
    status: 'available' 
  },
  { 
    id: '2', 
    name: 'María', 
    provider: 'Eleven Labs', 
    gender: 'female', 
    language: 'Español', 
    status: 'available' 
  },
  { 
    id: '3', 
    name: 'John', 
    provider: 'Google TTS', 
    gender: 'male', 
    language: 'Inglés', 
    status: 'available' 
  }
];
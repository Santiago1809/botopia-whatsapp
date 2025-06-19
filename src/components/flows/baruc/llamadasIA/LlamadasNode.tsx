import { useState } from 'react';
import { NodeProps } from 'reactflow';
import { CallServiceUI, demoVoices } from './diseño';

export function LlamadasIANode(props: NodeProps) {
  console.log('Renderizando LlamadasIANode', props.id);
  
  const [selectedVoice, setSelectedVoice] = useState(demoVoices[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectVoice = (voice: typeof demoVoices[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedVoice(voice);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <CallServiceUI
      selectedVoice={selectedVoice}
      voices={demoVoices}
      isLoading={isLoading}
      onSelectVoice={handleSelectVoice}
    />
  );
}
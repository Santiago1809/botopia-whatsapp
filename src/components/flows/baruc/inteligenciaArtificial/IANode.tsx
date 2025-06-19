import { useState } from 'react';
import { NodeProps } from 'reactflow';
import { AINodeUI, demoAIModels } from './diseño';

export function IANode(props: NodeProps) {
  // Logueamos para depurar
  console.log("Renderizando IANode", props);

  const [selectedModel, setSelectedModel] = useState(demoAIModels[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectModel = (model: typeof demoAIModels[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedModel(model);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <div style={{ width: '360px' }}>
      <AINodeUI
        selectedModel={selectedModel}
        models={demoAIModels}
        isLoading={isLoading}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
}
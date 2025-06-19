import { useState } from 'react';
import { WhatsAppApiUI, demoTemplates } from './diseños';

export function WhatsAppApiNode(/* _props: NodeProps */) {
  const [selectedTemplate, setSelectedTemplate] = useState(demoTemplates[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectTemplate = (template: typeof demoTemplates[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedTemplate(template);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <WhatsAppApiUI
      selectedTemplate={selectedTemplate}
      templates={demoTemplates}
      isLoading={isLoading}
      onSelectTemplate={handleSelectTemplate}
    />
  );
}
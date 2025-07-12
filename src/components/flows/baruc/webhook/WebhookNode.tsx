import { useState } from 'react';
import { WebhookUI, demoWebhookServices } from './diseño';

export function WebhookNode(/* _props: NodeProps */) {
  const [selectedService, setSelectedService] = useState(demoWebhookServices[0] || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectService = (service: typeof demoWebhookServices[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedService(service);
      setIsLoading(false);
    }, 300);
  };

  return (
    <WebhookUI
      selectedService={selectedService}
      services={demoWebhookServices}
      isLoading={isLoading}
      onSelectService={handleSelectService}
    />
  );
}

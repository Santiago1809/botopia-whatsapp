import { useState } from 'react';
import { PaymentUI, demoGateways } from './diseños'; // Cambiar demoPaymentMethods a demoGateways

export function PaymentNode(/* props: NodeProps */) {
  // Usar demoGateways en lugar de demoPaymentMethods
  const [selectedGateway, setSelectedGateway] = useState(demoGateways[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Renombrar method a gateway
  const handleSelectGateway = (gateway: typeof demoGateways[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedGateway(gateway);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <PaymentUI
      selectedGateway={selectedGateway} // Cambiar selectedMethod a selectedGateway
      gateways={demoGateways} // Cambiar methods a gateways
      isLoading={isLoading}
      onSelectGateway={handleSelectGateway} // Cambiar onSelectMethod a onSelectGateway
    />
  );
}
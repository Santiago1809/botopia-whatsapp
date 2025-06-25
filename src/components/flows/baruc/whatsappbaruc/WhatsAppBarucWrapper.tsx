import { useState } from "react";
import { BloqueWhatsAppBaruc } from "./BloqueWhatsAppBaruc";
import { WhatsAppNodeUIProps } from "./diseño";

export function WhatsAppBarucWrapper(props: Omit<WhatsAppNodeUIProps, "whatsappMode" | "setWhatsappMode">) {
  const [whatsappMode, setWhatsappMode] = useState<'send' | 'respond'>('send');

  return (
    <BloqueWhatsAppBaruc
      {...props}
      whatsappMode={whatsappMode}
      setWhatsappMode={setWhatsappMode}
    />
  );
}
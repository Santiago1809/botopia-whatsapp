import { WhatsAppNodeUI, WhatsAppNodeUIProps } from "./diseño";
import { WhatsAppEnviarNodeUI } from "./enviar/WhatsAppEnviarNodeUI";

export function BloqueWhatsAppBaruc(props: WhatsAppNodeUIProps) {
  const { whatsappMode, setWhatsappMode, ...rest } = props;

  return whatsappMode === "send" ? (
    <WhatsAppEnviarNodeUI
      {...rest}
      whatsappMode={whatsappMode}
      setWhatsappMode={setWhatsappMode}
    />
  ) : (
    <WhatsAppNodeUI
      {...rest}
      whatsappMode={whatsappMode}
      setWhatsappMode={setWhatsappMode}
    />
  );
}
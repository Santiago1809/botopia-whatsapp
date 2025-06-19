import { WhatsAppNode } from './baruc/whatsappbaruc/bloquewhatsapp';
import { IANode } from './baruc/inteligenciaArtificial/IANode';
import { LlamadasIANode } from './baruc/llamadasIA/LlamadasNode';
import { PaymentNode } from './baruc/pagos/PaymentNode';
import { WhatsAppApiNode } from './baruc/whatsappApi/WhatsAppApiNode';
import { GoogleSheetsNode } from './acciones/sheets/SheetNode';

// Añadir phoneWithIA como alias para LlamadasIANode
export const nodeTypes = {
  whatsappNode: WhatsAppNode,
  IA: IANode,
  llamadasIA: LlamadasIANode,
  phoneWithIA: LlamadasIANode, // Para compatibilidad con sidebar.tsx
  payment: PaymentNode,
  whatsappApi: WhatsAppApiNode,
  whatsappAPI: WhatsAppApiNode, // Alias para manejar la versión con mayúsculas
  sheetsNode: GoogleSheetsNode,
};
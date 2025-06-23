import { WhatsAppNode } from './baruc/whatsappbaruc/bloquewhatsapp';
import { IANode } from './baruc/inteligenciaArtificial/IANode';
import { LlamadasIANode } from './baruc/llamadasIA/LlamadasNode';
import { PaymentNode } from './baruc/pagos/PaymentNode';
import { WhatsAppApiNode } from './baruc/whatsappApi/WhatsAppApiNode';
import { GoogleSheetsNode } from './acciones/sheets/SheetNode';

// Nuevos imports para los nodos adicionales
import SupabaseNode from './acciones/supabase/node';

// Estos imports deberán agregarse cuando crees los archivos correspondientes
import { GmailNode } from './acciones/gmail/GmailNode';
import { NotionNode } from './acciones/notion/NotionNode';
import { GoogleCalendarNode } from './acciones/calendar/CalendarNode';

// Importamos los nuevos componentes de elementos de flujo
import TriggerNode from './elementos/disparador/diseño';
import DelayNode from './elementos/retraso/diseño';
import CounterNode from './elementos/contador/diseño';
import LoopNode from './elementos/bucle/diseño';
import ConditionNode from './elementos/condicion/diseño';

// Añadir phoneWithIA como alias para LlamadasIANode
export const nodeTypes = {
  // Nodos existentes
  whatsappNode: WhatsAppNode,
  IA: IANode,
  llamadasIA: LlamadasIANode,
  phoneWithIA: LlamadasIANode, // Para compatibilidad con sidebar.tsx
  payment: PaymentNode,
  whatsappApi: WhatsAppApiNode,
  whatsappAPI: WhatsAppApiNode, // Alias para manejar la versión con mayúsculas
  sheetsNode: GoogleSheetsNode,
  
  // Nodos adicionales
  supabase: SupabaseNode,
  gmail: GmailNode,
  notion: NotionNode,
  googleCalendar: GoogleCalendarNode,
  
  // Nuevos elementos de flujo
  trigger: TriggerNode,
  delay: DelayNode,
  counter: CounterNode,
  loop: LoopNode,
  condition: ConditionNode
};
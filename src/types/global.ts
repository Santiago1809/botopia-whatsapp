export interface Contact {
  id: string;
  name: string;
  number: string;
  agenteHabilitado?: boolean;
  wa_id?: string;
  lastMessageTimestamp?: number;
  lastMessagePreview?: string;
}

export interface Group {
  id: string;
  name: string;
  number: string;
  agenteHabilitado?: boolean;
  wa_id?: string;
  lastMessageTimestamp?: number;
  lastMessagePreview?: string;
} 
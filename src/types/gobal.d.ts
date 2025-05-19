export interface WhatsappNumber {
  number: string | number;
  id: number;
  name: string;
  aiEnabled?: boolean;
  aiPrompt?: string;
  aiModel?: string;
  responseGroups?: boolean;
  aiUnknownEnabled?: boolean;
  status: "disconnected" | "connected" | 'connecting';
}
export interface QrCodeEvent {
  numberId: string | number;
  qr: string;
}

export interface Agent {
  id: string;
  title: string;
  prompt: string;
  owner: string;
  isGlobal: boolean;
  allowAdvisor?: boolean;
  advisorEmail?: string | null;
}
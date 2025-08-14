export interface Contact {
  id: string;
  identificacion: string;
  telefono: string;
  nombre: string;
  etapaDelEmbudo: string;
  prioridad: string;
  estaAlHabilitado: boolean;
  etiquetas: string[];
  ultimaActividad: string;
  creadoEn: string;
  idDeUsuario: string;
  proveedor: string;
  numeroLinea: string;
  status: 'pendiente-documentacion' | 'nuevo-lead' | 'en-contacto' | 'cita-agendada' | 'atencion-cliente' | 'cerrado';
  ultimoMensaje?: {
    mensaje: string;
    timestamp: string;
    remitente: string;
  } | null;
}

export interface Line {
  id: string;
  numero: string;
  proveedor: string;
  estaActivo: boolean;
  creadoEn: string;
  idDeUsuario: string;
  contactsCount: number;
  activeContacts: number;
  lastActivity: string;
}

export interface LineStats {
  totalContacts: number;
  activeContacts: number;
  newLeads: number;
  inProgress: number;
  scheduled: number;
  closed: number;
  conversionRate: number;
  averageResponseTime: string;
  todayMessages: number;
  weeklyMessages: number;
}

export interface LineDashboardData {
  line: Line;
  stats: LineStats;
  recentContacts: Contact[];
}

export interface AnalyticsStats {
  total: number;
  pendienteDocumentacion: number;
  nuevoLead: number;
  enContacto: number;
  citaAgendada: number;
  atencionCliente: number;
  cerrado: number;
  conversion: number;
}

export type ViewMode = 'dashboard' | 'kanban' | 'chat' | 'analytics';

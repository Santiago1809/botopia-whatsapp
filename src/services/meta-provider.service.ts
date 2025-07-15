/**
 * @file meta-provider.service.ts
 * @description Servicio para comunicación con el backend de Meta Provider
 */

// Este archivo ha sido migrado. Todas las llamadas a Meta Provider deben pasar por la API Gateway.
// Usa los servicios y endpoints del API Gateway para comunicación con Meta Business API.

// Tipos para Meta Business API
export type MetaAccount = {
  id: number;
  metaUserId: string;
  status?: string;
  createdAt?: string;
  expiresAt?: string;
};
export type WhatsAppTemplate = {
  id: number;
  name: string;
  category?: string;
  language?: string;
  status?: string;
  updated_at?: string;
};
export type FacebookPage = {
  id: number;
  name: string;
  category?: string;
  fan_count?: number;
  picture_url?: string;
  verification_status?: string;
};
export type InstagramAccount = {
  id: number;
  username?: string;
  profile_picture_url?: string;
  follower_count?: number;
  biography?: string;
};
export type MessageLog = {
  id: number;
  platform: string;
  recipient: string;
  type: string;
  status: string;
  sent_at?: string;
};
export type WhatsAppMetrics = {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  responseRate: number;
  templates: { name: string; rate: number }[];
  byDay: { label: string; value: number }[];
};

export class MetaProviderService {
  static async getMetaAccounts(): Promise<MetaAccount[]> {
    return [];
  }
  static async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    return [];
  }
  static async getFacebookPages(): Promise<FacebookPage[]> {
    return [];
  }
  static async syncFacebookPages(): Promise<FacebookPage[]> {
    return [];
  }
  static async getInstagramAccounts(): Promise<InstagramAccount[]> {
    return [];
  }
  static async syncInstagramAccounts(): Promise<InstagramAccount[]> {
    return [];
  }
  static async getUserMessages(): Promise<{
    messages: MessageLog[];
    total: number;
  }> {
    return { messages: [], total: 0 };
  }
  static async deleteMetaAccount(): Promise<boolean> {
    return true;
  }
  static async getAuthUrl(): Promise<string> {
    return "";
  }
  static async getWhatsAppMetrics(
    businessAccountId: string,
    period: string = "30days"
  ): Promise<WhatsAppMetrics> {
    // Llama al API Gateway, que a su vez consulta el microservicio
    // Endpoint correcto: /api/dashboard/metrics
    const params = new URLSearchParams({ businessAccountId, period });
    const res = await fetch(`/api/dashboard/metrics?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Puedes agregar autenticación aquí si es necesario
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener métricas");
    return await res.json();
  }
}

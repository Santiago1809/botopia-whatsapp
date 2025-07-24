import { NextRequest, NextResponse } from 'next/server';

interface ConversationData {
  id: string;
  remitente: string;
  idDeContacto: string;
  mensaje: string;
  marcaDeTiempo: string;
  esLeido?: boolean;
  idDeLinea: string;
  fluir?: string;
  intencion?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const { contactId } = await params;
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '50';

    // Llamar al microservicio CRM para obtener las conversaciones
    const crmApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL2|| 'http://localhost:5005';
    
    const response = await fetch(`${crmApiUrl}/api/contacts/${contactId}/conversations?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error from CRM API: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener conversaciones');
    }

    // Transformar los datos al formato esperado por el frontend
    const messages = data.data.map((conv: ConversationData) => ({
      id: conv.id,
      senderId: conv.remitente === 'user' ? conv.idDeContacto : 'agent',
      senderName: conv.remitente === 'user' ? 'Usuario' : 
                 conv.remitente === 'bot' ? 'Bot' : 'Agente',
      content: conv.mensaje,
      timestamp: conv.marcaDeTiempo,
      type: conv.remitente === 'user' ? 'incoming' : 'outgoing',
      isRead: conv.esLeido || true,
      sender: conv.remitente, // Agregar el campo sender original
      contactId: conv.idDeContacto,
      lineId: conv.idDeLinea,
      flow: conv.fluir || 'general',
      intention: conv.intencion || 'consulta'
    }));

    return NextResponse.json({
      success: true,
      data: messages,
      total: messages.length
    });

  } catch (error) {
    console.error('Error en API de mensajes:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener mensajes del contacto',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

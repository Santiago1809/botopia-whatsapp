"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, MessageSquare, Clock, User, Send, Bot, File, FileText, X } from "lucide-react";
import type { Contact } from "../../types/dashboard";
import { useCRMWebSocket } from "../../hooks/useCRMWebSocket";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  isRead: boolean;
  sender?: 'bot' | 'agent' | 'user'; // Agregar campo para distinguir el tipo de remitente
}

interface Template {
  id: string;
  name: string;
  language: string;
  content: string;
  status?: string;
  category?: string;
  components?: Array<{
    type: string;
    text?: string;
    format?: string;
    parameters?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
  // Propiedades adicionales para compatibilidad con diferentes formatos de templates
  header?: string;
  body?: string;
}

interface ChatSectionProps {
  contacts: Contact[];
  lineId: string;
  selectedContactFromKanban?: Contact | null;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ contacts, lineId, selectedContactFromKanban, onContactUpdate }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isOver24Hours, setIsOver24Hours] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Variables de configuración
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://crm-api-black.vercel.app' 
      : 'http://localhost:5005');

  // 🔥 WEBSOCKET HOOK - TIEMPO REAL SIN POLLING
  const wsHook = useCRMWebSocket({ 
    lineId, 
    userId: 'agent-1', // Puedes hacer esto dinámico según el usuario logueado
    backendUrl: BACKEND_URL 
  });

  // Configurar handlers de WebSocket

  useEffect(() => {
    // console.log('🔌 ChatSection: Configurando handlers de WebSocket...');
    
    // Handler para nuevos mensajes
    wsHook.registerMessageHandler((message) => {
      // console.log('📨 ChatSection: Nuevo mensaje recibido:', message);
      
      if (selectedContact && message.contactId === selectedContact.id) {
        const newMsg: Message = {
          id: message.id,
          senderId: message.sender === 'user' ? message.contactId : 'agent',
          senderName: message.sender === 'user' ? selectedContact.nombre : 'Agente',
          content: message.message,
          timestamp: message.timestamp,
          type: message.sender === 'user' ? 'incoming' : 'outgoing',
          isRead: true,
          sender: message.sender
        };
        
        setMessages(prev => {
          // Verificar que no esté duplicado
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) {
            // console.log('⚠️ Mensaje ya existe, ignorando duplicado');
            return prev;
          }
          
          // console.log('✅ Agregando mensaje real de la base de datos');
          return [...prev, newMsg];
        });
      }
    });

    // Handler para confirmación de mensaje enviado
    wsHook.registerMessageSentHandler(() => {
      // console.log('✅ ChatSection: Mensaje enviado confirmado:', _data);
      // Aquí puedes actualizar el estado del mensaje local si es necesario
    });

    // Handler para errores de mensaje
    wsHook.registerMessageErrorHandler((error) => {
      console.error('❌ ChatSection: Error de mensaje:', error);
      // Mostrar error al usuario
      alert(`Error al enviar mensaje: ${error.error}`);
    });

    // Handler para actualizaciones de contacto
    wsHook.registerContactUpdateHandler((update) => {
      // console.log('🔄 ChatSection: Contacto actualizado:', update);
      
      if (selectedContact && update.id === selectedContact.id && onContactUpdate) {
        const updatedFields: Partial<Contact> = {
          nombre: update.name || selectedContact.nombre,
          telefono: update.phone || selectedContact.telefono,
          etapaDelEmbudo: update.funnel_stage || selectedContact.etapaDelEmbudo,
          prioridad: update.priority || selectedContact.prioridad,
          estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : selectedContact.estaAlHabilitado,
          etiquetas: update.tags || selectedContact.etiquetas,
          ultimaActividad: update.last_activity || selectedContact.ultimaActividad,
        };
        
        onContactUpdate(selectedContact.id, updatedFields);
      }
    });

    // console.log('✅ ChatSection: Handlers de WebSocket configurados');
  }, [wsHook, selectedContact, onContactUpdate]);

  // Función para verificar si han pasado más de 24 horas desde el último mensaje
  const checkTimeGap = useCallback((messages: Message[]) => {
    if (messages.length === 0) {
      setIsOver24Hours(true);
      return true;
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageTime = new Date(lastMessage.timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
    
    const over24 = diffInHours > 24;
    setIsOver24Hours(over24);
    return over24;
  }, []);

  // Función para obtener plantillas desde Meta API
  const fetchTemplates = useCallback(async () => {
    if (!lineId) return;
    
    try {
      setLoadingTemplates(true);
      const response = await fetch(`${BACKEND_URL}/api/templates/${lineId}`);
      if (response.ok) {
        const templateData = await response.json();
        setTemplates(templateData.templates || []);
      } else {
        console.error('Error fetching templates:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  }, [lineId, BACKEND_URL]);

  // Función para abrir modal de plantillas
  const openTemplateModal = useCallback(async () => {
    setShowTemplateModal(true);
    await fetchTemplates();
  }, [fetchTemplates]);

  // Función para hacer scroll al final
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async (contactId: string) => {
    // console.log('🔄 LOAD MESSAGES - INICIO:', {
    //   contactId,
    //   backendUrl: BACKEND_URL
    // });
    
    setLoading(true);
    // console.log('🔄 CARGANDO MENSAJES para contacto:', contactId);
    
    try {
      // Llamar directamente al backend CRM-API
      const url = `${BACKEND_URL}/api/messages/${contactId}`;
      // console.log('🌐 Haciendo fetch a:', url);
      
      const response = await fetch(url);
      // console.log('🔄 Response status:', response.status);
      // console.log('🔄 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        // console.log('🔄 Response data:', data);
        
        if (data.success && data.data) {
          // console.log(`✅ MENSAJES CARGADOS: ${data.data.length} conversaciones para contacto ${contactId}`);
          // console.log('📝 Mensajes:', data.data);
          
          setMessages(data.data);
          // Verificar si han pasado más de 24 horas
          checkTimeGap(data.data);
        } else {
          // console.log('⚠️ No se encontraron mensajes en la base de datos');
          // Si no hay mensajes, simplemente mostrar array vacío
          setMessages([]);
          setIsOver24Hours(true);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error en response:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ ERROR CARGANDO MENSAJES:', error);
      
      // SOLO en caso de error real, usar datos de fallback básicos
      // console.log('🔧 Usando mensajes vacío por error de conexión');
      setMessages([]);
      setIsOver24Hours(true);
    } finally {
      // SIEMPRE resetear loading, sin importar qué pase
      // console.log('✅ LOAD MESSAGES - FINALIZANDO, setting loading to false');
      setLoading(false);
    }
  }, [checkTimeGap, BACKEND_URL]);

  // 🔥 WEBSOCKET EVENT HANDLERS - TIEMPO REAL
  // Estos handlers ya están configurados arriba en el useEffect

  // Función para enviar plantilla
  const sendTemplate = useCallback(async (template: Template) => {
    if (!selectedContact) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/templates/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineId,
          contactId: selectedContact.id,
          templateId: template.id,
          templateName: template.name,
          templateLanguage: template.language
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Asegurar encabezado y body separados por doble salto de línea
        let formattedContent = template.content;
        // Si el template tiene encabezado y body juntos, forzar doble salto de línea entre ellos
        if (formattedContent.includes('\n') && !formattedContent.startsWith('\n')) {
          // Ya tiene salto de línea, no hacer nada
        } else if (template.header && template.body) {
          formattedContent = `${template.header}\n\n${template.body}`;
        }
        // Reemplazar variables por el nombre del contacto
        const messageWithContactName = formattedContent
          .replace(/\{\{1\}\}/g, selectedContact.nombre || selectedContact.telefono || 'Cliente')
          .replace(/\{1\}/g, selectedContact.nombre || selectedContact.telefono || 'Cliente');
        
        // PRIMERO: Guardar SIEMPRE en la base de datos
        // console.log('💾 GUARDANDO MENSAJE EN BD - INICIANDO...');
        // console.log('💾 Datos a enviar:', {
        //   contactId: selectedContact.id,
        //   lineId: lineId,
        //   message: messageWithContactName,
        //   sender: 'bot',
        //   timestamp: new Date().toISOString()
        // });
        
        try {
          const saveResponse = await fetch(`${BACKEND_URL}/api/messages/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contactId: selectedContact.id,
              lineId: lineId,
              message: messageWithContactName,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              messageId: result.data?.messageId || `template-${Date.now()}`
            }),
          });

          // console.log('💾 Response status:', saveResponse.status);
          
          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            // console.log('✅ MENSAJE GUARDADO EXITOSAMENTE EN BD:', saveResult);
          } else {
            const errorText = await saveResponse.text();
            console.error('❌ ERROR GUARDANDO EN BD - Response:', saveResponse.status, errorText);
            // NO fallar aquí, solo loggear
          }
        } catch (saveError) {
          console.error('❌ ERROR GUARDANDO EN BD - Exception:', saveError);
          // NO fallar aquí, solo loggear
        }
        
        // SEGUNDO: YA NO AGREGAMOS MANUALMENTE - WEBSOCKET LO HACE EN TIEMPO REAL
        // console.log('✅ Template enviada - WebSocket manejará la actualización en tiempo real');
        setShowTemplateModal(false);
        
        // TERCERO: Actualizar el contacto
        if (onContactUpdate) {
          onContactUpdate(selectedContact.id, {
            ultimoMensaje: {
              mensaje: messageWithContactName,
              timestamp: new Date().toISOString(),
              remitente: 'bot'
            },
            ultimaActividad: new Date().toISOString(),
          });
        }

        // console.log('✅ Plantilla enviada exitosamente - WebSocket actualización pendiente:', result);
        
        // CUARTO: Forzar recarga de mensajes para asegurar que se vea inmediatamente
        // console.log('🔄 FORZANDO RECARGA DE MENSAJES...');
        await loadMessages(selectedContact.id);
        // console.log('✅ MENSAJES RECARGADOS DESPUÉS DE ENVIAR PLANTILLA');
      } else {
        const errorData = await response.json();
        console.error('❌ Error enviando plantilla:', errorData);
        alert(`Error enviando plantilla: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error sending template:', error);
      alert('Error de conexión al enviar plantilla');
    } finally {
      setLoading(false);
    }
  }, [selectedContact, lineId, onContactUpdate, BACKEND_URL, loadMessages]);

  // Hacer scroll cuando cambien los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Filter contacts for chat view
  const filteredContacts = contacts.filter(contact =>
    contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.telefono.includes(searchTerm)
  );

  // Group contacts by status for chat organization
  const contactsByStatus = {
    'nuevo-lead': filteredContacts.filter(c => c.status === 'nuevo-lead'),
    'en-contacto': filteredContacts.filter(c => c.status === 'en-contacto'),
    'cita-agendada': filteredContacts.filter(c => c.status === 'cita-agendada'),
    'atencion-cliente': filteredContacts.filter(c => c.status === 'atencion-cliente'),
    'cerrado': filteredContacts.filter(c => c.status === 'cerrado') // Added 'cerrado' status
  };

  // Effect to handle contact selection from Kanban
  useEffect(() => {
    // console.log('🎯 USEEFFECT - selectedContactFromKanban changed:', {
    //   hasContact: !!selectedContactFromKanban,
    //   contactId: selectedContactFromKanban?.id,
    //   contactName: selectedContactFromKanban?.nombre
    // });
    
    if (selectedContactFromKanban) {
      // console.log('🎯 ChatSection: Received contact from Kanban:', selectedContactFromKanban);
      setSelectedContact(selectedContactFromKanban);
      loadMessages(selectedContactFromKanban.id);
    }
  }, [selectedContactFromKanban, loadMessages]);

  // Effect separado para manejar suscripción WebSocket cuando cambia el contacto seleccionado
  useEffect(() => {
    if (selectedContact && wsHook.isConnected) {
      // console.log('🔌 WebSocket conectado - suscribiéndose a contacto:', selectedContact.id);
      wsHook.subscribeToContact(selectedContact.id);
      
      // Cleanup: desuscribirse del contacto anterior
      return () => {
        // console.log('🧹 Desuscribiéndose de contacto:', selectedContact.id);
        wsHook.unsubscribeFromContact(selectedContact.id);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, wsHook.isConnected]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageContent = newMessage;
    setNewMessage(""); // Limpiar inmediatamente el input
    
    // NO agregar mensaje temporal - solo esperar el WebSocket

    try {
      // console.log(`📱 Enviando mensaje WhatsApp a ${selectedContact.nombre} (${selectedContact.telefono})`);
      
      // Enviar directamente al backend CRM-API
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedContact.telefono,
          message: messageContent,
          lineId: lineId,
          messageType: 'text'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // console.log('✅ Mensaje enviado por WhatsApp:', result.data);
        
        // 💾 GUARDAR MENSAJE EN BASE DE DATOS
        try {
          const saveResponse = await fetch(`${BACKEND_URL}/api/messages/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contactId: selectedContact.id,
              lineId: lineId,
              sender: 'agent',
              message: messageContent,
              timestamp: new Date().toISOString(),
              messageId: result.data?.messageId || `agent-${Date.now()}`
            }),
          });

          if (saveResponse.ok) {
            // console.log(' Mensaje guardado en base de datos');
            // Recargar mensajes para mostrar el mensaje guardado
            await loadMessages(selectedContact.id);
          } else {
            const errorText = await saveResponse.text();
            console.error('❌ Error guardando mensaje en base de datos - Response:', saveResponse.status, errorText);
          }
        } catch (saveError) {
          console.error('❌ Error de conexión guardando mensaje:', saveError);
        }
        
        // console.log(`✅ Mensaje WhatsApp enviado exitosamente a ${selectedContact.nombre}`);
      } else {
        console.error('❌ Error enviando mensaje WhatsApp:', result);
        
        let errorMessage = result.message || result.error || 'Error desconocido';
        
        // Si es un error de credenciales, dar más contexto
        if (errorMessage.includes('credenciales de WhatsApp')) {
          errorMessage = 'Error: La línea de WhatsApp no tiene configuradas las credenciales (JWT y NUMBER_ID). Contacta al administrador para configurar la integración con Meta.';
        }
        
        alert(`Error enviando mensaje: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error de conexión enviando mensaje:', error);
      
      alert('Error de conexión. Verifica que el backend esté funcionando.');
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    loadMessages(contact.id);
  };

  // Actualizar IA del contacto
  const updateContactAI = async (contactId: string, isEnabled: boolean) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estaAlHabilitado: isEnabled
        }),
      });

      if (response.ok) {
        // Actualizar el estado local
        setSelectedContact(prev => prev ? {
          ...prev,
          estaAlHabilitado: isEnabled
        } : null);
        
        // Llamar al callback del padre si existe
        if (onContactUpdate) {
          onContactUpdate(contactId, { estaAlHabilitado: isEnabled });
        }
        
        // console.log('🤖 AI updated successfully for contact:', contactId, 'to:', isEnabled);
      } else {
        console.error('❌ Failed to update AI status');
      }
    } catch (error) {
      console.error('❌ Error updating AI status:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    // Restar 5 horas (5 * 60 * 60 * 1000 milisegundos)
    const localDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    
    return localDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    // Restar 5 horas para convertir a hora local
    const localDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    
    // También ajustar la hora actual para mantener coherencia en el cálculo
    const now = new Date();
    const localNow = new Date(now.getTime() - (5 * 60 * 60 * 1000));

    // Comparar solo la parte de la fecha (año, mes, día)
    const isToday = localDate.getFullYear() === localNow.getFullYear() &&
      localDate.getMonth() === localNow.getMonth() &&
      localDate.getDate() === localNow.getDate();

    // Calcular si fue ayer
    const yesterday = new Date(localNow);
    yesterday.setDate(localNow.getDate() - 1);
    const isYesterday = localDate.getFullYear() === yesterday.getFullYear() &&
      localDate.getMonth() === yesterday.getMonth() &&
      localDate.getDate() === yesterday.getDate();

    const diff = localNow.getTime() - localDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    // Formatear la hora local
    const timeString = localDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return `Hoy - ${timeString}`;
    } else if (isYesterday) {
      return `Ayer - ${timeString}`;
    } else if (days > 0) {
      return `${days}d - ${timeString}`;
    } else if (hours > 0) {
      return `${hours}h - ${timeString}`;
    } else {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo-lead': return 'bg-blue-100 text-blue-800';
      case 'en-contacto': return 'bg-yellow-100 text-yellow-800';
      case 'cita-agendada': return 'bg-green-100 text-green-800';
      case 'atencion-cliente': return 'bg-orange-100 text-orange-800';
      case 'cerrado': return 'bg-red-100 text-red-800'; // Color para cerrado
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nuevo-lead': return 'Nuevo Lead';
      case 'en-contacto': return 'En Contacto';
      case 'cita-agendada': return 'Cita Agendada';
      case 'atencion-cliente': return 'Atención al Cliente';
      case 'cerrado': return 'Cerrado'; // Etiqueta para cerrado
      default: return status;
    }
  };

  return (
    <div className="h-[800px] bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm border overflow-hidden">
      <div className="flex h-full">
        {/* Contacts Sidebar */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar contactos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(contactsByStatus).map(([status, statusContacts]) => (
              statusContacts.length > 0 && (
                <div key={status} className="mb-4">
                  <div className="px-4 py-2 bg-gray-50 dark:bg-[hsl(240,10%,8%)] border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-muted-foreground">
                        {getStatusLabel(status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {statusContacts.length}
                      </span>
                    </div>
                  </div>
                  
                  {statusContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => handleContactSelect(contact)}
                      className={`
                        p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(240,10%,8%)] transition-colors
                        ${selectedContact?.id === contact.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground truncate">
                              {contact.nombre || contact.telefono}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contact.status)}`}>
                              {contact.status === 'nuevo-lead' ? 'Nuevo' : 
                               contact.status === 'en-contacto' ? 'Contacto' :
                               contact.status === 'cita-agendada' ? 'Cita' : 
                               contact.status === 'atencion-cliente' ? 'Atención' : 
                               contact.status === 'cerrado' ? 'Cerrado' : 'Otro'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {contact.telefono}
                            </p>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(contact.ultimaActividad)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))}

            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron contactos</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(240,10%,8%)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedContact.nombre || selectedContact.telefono}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          {selectedContact.telefono} • {getStatusLabel(selectedContact.status)}
                        </p>
                        {/* 🔥 INDICADOR WEBSOCKET TIEMPO REAL */}
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${wsHook.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <span className={`text-xs ${wsHook.isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {wsHook.isConnected ? 'Tiempo Real' : 'Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Toggle Switch */}
                  <div className="flex items-center">
                    <label 
                      className="relative inline-flex items-center cursor-pointer group mr-2" 
                      title={`IA ${selectedContact.estaAlHabilitado ? 'activada' : 'desactivada'} - Click para cambiar`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContact.estaAlHabilitado}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          // Actualizar inmediatamente el estado visual
                          setSelectedContact(prev => prev ? {
                            ...prev,
                            estaAlHabilitado: newValue
                          } : null);
                          
                          // Actualizar en el backend
                          updateContactAI(selectedContact.id, newValue);
                        }}
                        className="sr-only"
                      />
                      <div className={`w-9 h-5 rounded-full transition-all duration-300 shadow ${
                        selectedContact.estaAlHabilitado 
                          ? 'bg-green-500 shadow-green-200' 
                          : 'bg-gray-300 shadow-gray-200'
                      } group-hover:shadow-lg`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-all duration-300 ${
                          selectedContact.estaAlHabilitado ? 'translate-x-4' : 'translate-x-0.5'
                        } mt-0.5`}></div>
                      </div>
                    </label>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      selectedContact.estaAlHabilitado ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      IA {selectedContact.estaAlHabilitado ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {/* console.log('🎨 RENDERIZANDO MENSAJES - Total:', messages.length) */}
                    {/* console.log('🎨 MENSAJES A RENDERIZAR:', messages) */}
                    {messages.map(message => {
                      // console.log('🎨 RENDERIZANDO MENSAJE INDIVIDUAL:', message);
                      // Determinar si es mensaje del agente humano o bot
                      const isHumanAgent = message.sender === 'agent';
                      const isBot = message.sender === 'bot';
                      
                      // console.log('🎨 isHumanAgent:', isHumanAgent, 'isBot:', isBot, 'sender:', message.sender);
                      
                      // Determinar la alineación: agentes humanos y bots van a la derecha, usuarios a la izquierda
                      const alignRight = isHumanAgent || isBot;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`
                            max-w-[70%] rounded-lg p-3 relative
                            ${isHumanAgent 
                              ? 'bg-purple-500 text-white' 
                              : isBot
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800'
                              : 'bg-gray-100 dark:bg-gray-700 text-foreground'
                            }
                          `}>
                            {/* Etiqueta de tipo de remitente */}
                            {(isHumanAgent || isBot) && (
                              <div className={`text-xs font-medium mb-1 flex items-center space-x-1 ${
                                isHumanAgent ? 'text-purple-100' : 'text-purple-600 dark:text-purple-300'
                              }`}>
                                {isHumanAgent ? (
                                  <>
                                    <User className="w-3 h-3" />
                                    <span>Respuesta Humana</span>
                                  </>
                                ) : (
                                  <>
                                    <Bot className="w-3 h-3" />
                                    <span>Bot</span>
                                  </>
                                )}
                              </div>
                            )}
                            {/* Mostrar saltos de línea reales */}
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isHumanAgent ? 'text-purple-100' : 
                              isBot ? 'text-purple-500 dark:text-purple-400' : 
                              'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay mensajes aún</p>
                      <p className="text-sm">Inicia una conversación</p>
                    </div>
                  </div>
                )}
                {/* Referencia para scroll automático */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {/* Mostrar alerta si han pasado más de 24 horas */}
                {isOver24Hours && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Han pasado más de 24 horas desde el último mensaje. Se recomienda usar plantillas.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                      placeholder="Escribe un mensaje para WhatsApp..."
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background text-foreground disabled:opacity-50"
                    />
                    
                    {/* Botón de plantillas */}
                    <button
                      onClick={openTemplateModal}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      title="Plantillas"
                    >
                      <File className="w-4 h-4" />
                    </button>

                    {/* Botón enviar */}
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Selecciona un chat</h3>
                <p>Elige un contacto para comenzar la conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de plantillas */}
      {showTemplateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Plantillas de WhatsApp
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Cargando plantillas...
                  </span>
                </div>
              ) : templates.length > 0 ? (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => {
                        sendTemplate(template);
                        setShowTemplateModal(false);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {template.content
                              .replace(/\{\{1\}\}/g, selectedContact?.nombre || selectedContact?.telefono || 'Cliente')
                              .replace(/\{1\}/g, selectedContact?.nombre || selectedContact?.telefono || 'Cliente')
                            }
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Idioma: {template.language}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No hay plantillas disponibles
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    No se encontraron plantillas aprobadas para esta línea de WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;

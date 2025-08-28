"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, MessageSquare, Clock, User, Send, Bot, File, FileText, X, ChevronLeft } from "lucide-react";
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
  sender?: 'bot' | 'agent' | 'user';
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
  header?: string;
  body?: string;
}

interface ChatSectionProps {
  contacts: Contact[];
  lineId: string;
  selectedContactFromKanban?: Contact | null;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>, isWebSocketUpdate?: boolean) => void;
  ws?: ReturnType<typeof useCRMWebSocket>;
}

const ChatSection: React.FC<ChatSectionProps> = ({ contacts, lineId, selectedContactFromKanban, onContactUpdate, ws }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isOver24Hours, setIsOver24Hours] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ocultar ciertas plantillas en el modal (sin tocar backend)
  const HIDDEN_TEMPLATE_NAMES = useMemo(() => new Set([
    'avisomedilasser',
    'fridoom_companies'
  ].map(n => n.toLowerCase())), []);

  const visibleTemplates = useMemo(
    () => templates.filter(t => !HIDDEN_TEMPLATE_NAMES.has((t.name || '').toLowerCase())),
    [templates, HIDDEN_TEMPLATE_NAMES]
  );

  // Variables de configuración
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  // 🔥 WEBSOCKET HOOK - TIEMPO REAL SIN POLLING
  // Siempre llamar al hook para respetar el orden de hooks; si llega uno por props, lo usamos.
  const localWs = useCRMWebSocket({ 
    lineId, 
    userId: 'agent-1',
    backendUrl: BACKEND_URL,
    enabled: !ws // si ya hay uno externo, no abrir otro
  });
  const wsHook = ws ?? localWs;

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

  // Mantener refs con los últimos valores para evitar re-registros
  const selectedContactRef = useRef<Contact | null>(null);
  const onContactUpdateRef = useRef<ChatSectionProps['onContactUpdate']>(undefined);
  useEffect(() => { selectedContactRef.current = selectedContact; }, [selectedContact]);
  useEffect(() => { onContactUpdateRef.current = onContactUpdate; }, [onContactUpdate]);

  // Configurar handlers de WebSocket (registrar una sola vez por instancia)
  useEffect(() => {
    // Si no está conectado, intentar reconectar
    if (!wsHook.isConnected && wsHook.reconnect) {
      wsHook.reconnect();
    }

    // Handler para nuevos mensajes (asegurar un solo registro)
    wsHook.registerMessageHandler((message) => {
      console.log('📨 [WEBSOCKET] Nuevo mensaje recibido en ChatSection:', {
        messageId: message.id,
        contactId: message.contactId,
        sender: message.sender,
        content: message.message,
        timestamp: message.timestamp,
        selectedContactId: selectedContactRef.current?.id,
        isSelectedContact: selectedContactRef.current && message.contactId === selectedContactRef.current.id
      });
      
      // 🔥 ACTUALIZAR ÚLTIMO MENSAJE DEL CONTACTO EN LA LISTA - SIEMPRE
      if (onContactUpdateRef.current) {
        console.log('🔄 [WEBSOCKET] Actualizando contacto via onContactUpdate:', message.contactId);
        onContactUpdateRef.current(message.contactId, {
          ultimoMensaje: {
            mensaje: message.message,
            timestamp: normalizeTimestamp(message.timestamp),
            remitente: message.sender === 'user' ? 'usuario' : 
                      message.sender === 'bot' ? 'bot' : 'agente'
          },
          ultimaActividad: normalizeTimestamp(message.timestamp)
        }, true); // 🔥 FLAG PARA WEBSOCKET UPDATE
      } else {
        console.warn('⚠️ [WEBSOCKET] onContactUpdate no está disponible');
      }

      const currentSelected = selectedContactRef.current;
      if (currentSelected && message.contactId === currentSelected.id) {
        console.log('💬 [WEBSOCKET] Agregando mensaje al chat activo');
        // 🔥 PROCESAR TODOS LOS MENSAJES QUE LLEGAN POR WEBSOCKET
        // ⏰ NORMALIZAR TIMESTAMP PARA CONSISTENCIA
        const normalizedTimestamp = normalizeTimestamp(message.timestamp);

        const newMsg: Message = {
          id: message.id || `ws-${Date.now()}`,
          senderId: message.sender === 'user' ? message.contactId : 'agent',
          senderName: message.sender === 'user' ? (currentSelected.nombre || currentSelected.telefono || 'Sin nombre') : 
                     message.sender === 'agent' ? 'Respuesta Humana' : 'Bot',
          content: message.message,
          timestamp: normalizedTimestamp, // 🔥 TIMESTAMP NORMALIZADO
          type: message.sender === 'user' ? 'incoming' : 'outgoing',
          isRead: true,
          sender: message.sender
        };
        
        setMessages(prev => {
          // 🔥 VERIFICAR DUPLICADOS CON TIMESTAMP NORMALIZADO
          const exists = prev.some(msg => 
            msg.id === message.id || 
            (msg.content === message.message && 
             Math.abs(new Date(msg.timestamp).getTime() - new Date(normalizedTimestamp).getTime()) < 5000) // 5 segundos de tolerancia
          );
          if (exists) {
            console.log('🔄 [WEBSOCKET] Mensaje duplicado detectado, omitiendo');
            return prev;
          }
          
          console.log('✅ [WEBSOCKET] Mensaje agregado al chat:', newMsg);
          const newMessages = [...prev, newMsg];
          // 🔥 RECALCULAR 24 HORAS DESPUÉS DE AGREGAR MENSAJE
          checkTimeGap(newMessages);
          return newMessages;
        });
      } else {
        console.log('ℹ️ [WEBSOCKET] Mensaje recibido para contacto no seleccionado o contacto no seleccionado');
      }
    });

    // Handler para errores de mensaje
    wsHook.registerMessageErrorHandler((error) => {
      alert(`Error al enviar mensaje: ${error.error}`);
    });

    // Handler para actualizaciones de contacto
    wsHook.registerContactUpdateHandler((update) => {
      const currentSelected = selectedContactRef.current;
      const matchesSelected = currentSelected && (update.id === currentSelected.id || update.contactId === currentSelected.id);
      if (matchesSelected && onContactUpdateRef.current) {
        const updatedFields: Partial<Contact> = {
          nombre: update.name || currentSelected.nombre,
          telefono: update.phone || currentSelected.telefono,
          etapaDelEmbudo: update.funnel_stage || currentSelected.etapaDelEmbudo,
          prioridad: update.priority || currentSelected.prioridad,
          estaAlHabilitado: update.is_ai_enabled !== undefined ? update.is_ai_enabled : currentSelected.estaAlHabilitado,
          etiquetas: update.tags || currentSelected.etiquetas,
          ultimaActividad: update.last_activity || currentSelected.ultimaActividad,
        };

        onContactUpdateRef.current(currentSelected.id, updatedFields, true);
      }
    });
    // No dependencias de selectedContact/onContactUpdate para evitar re-registro
  }, [wsHook, wsHook.isConnected, wsHook.reconnect, checkTimeGap]);

  

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
    } catch {
      console.error('Error fetching templates');
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
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/${contactId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const normalized = data.data.map((m: Message) => ({
            ...m,
            timestamp: normalizeTimestamp(m.timestamp)
          }));
          setMessages(normalized);
          checkTimeGap(normalized);
        } else {
          setMessages([]);
          setIsOver24Hours(true);
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
      
    } catch {
      setMessages([]);
      setIsOver24Hours(true);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, checkTimeGap]);

  // Función para enviar plantilla
  const sendTemplate = useCallback(async (template: Template) => {
    if (!selectedContact) return;

    // UX: cerrar el modal y mantener el chat fluido sin loaders
    setShowTemplateModal(false);
    // Forzar scroll al final para que el scrollbar quede abajo
    setTimeout(() => scrollToBottom(), 0);
    try {
      // 1) Construir el texto visible (header + body) con variables sustituidas
      let formattedContent = template.content;
      if (template.header && template.body) {
        formattedContent = `${template.header}\n\n${template.body}`;
      }
      const nameOrPhone = selectedContact.nombre || selectedContact.telefono || 'Cliente';
      const displayMessage = formattedContent
        .replace(/\{\{1\}\}/g, nameOrPhone)
        .replace(/\{1\}/g, nameOrPhone);

      // 2) Enviar por el mismo endpoint que los mensajes normales para guardar en BD y emitir WS
  const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedContact.telefono,
          lineId,
          messageType: 'template',
          templateName: template.name,
          templateLanguage: template.language,
          // Este "message" se usa como parámetro {1} de la plantilla (Meta)
          message: nameOrPhone,
          // Y este se guarda/manda por WS como texto visible en el chat
          displayMessage,
          contactId: selectedContact.id
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        const msg = result?.message || 'Error enviando plantilla';
        alert(msg);
      } else {
        // 3) Actualizar preview del último mensaje localmente (sin duplicar en backend)
        if (onContactUpdate) {
          onContactUpdate(selectedContact.id, {
            ultimoMensaje: {
              mensaje: displayMessage,
              timestamp: new Date().toISOString(),
              remitente: 'bot'
            },
            ultimaActividad: new Date().toISOString()
          }, true);
        }
    // Asegurar que el chat permanezca al final
    setTimeout(() => scrollToBottom(), 0);
      }
    } catch {
      alert('Error de conexión al enviar plantilla');
  }
  }, [selectedContact, lineId, onContactUpdate, BACKEND_URL, scrollToBottom]);

  // Hacer scroll cuando cambien los mensajes y recalcular 24 horas
  useEffect(() => {
    scrollToBottom();
    // 🔥 RECALCULAR AUTOMÁTICAMENTE LAS 24 HORAS CUANDO CAMBIEN LOS MENSAJES
    checkTimeGap(messages);
  }, [messages, scrollToBottom, checkTimeGap]);

  // Filter contacts for chat view
  const filteredContacts = contacts.filter(contact =>
    (contact.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (contact.telefono || '').includes(searchTerm)
  );

  // Group contacts by status for chat organization
  const contactsByStatus = {
    'nuevo-lead': filteredContacts.filter(c => c.status === 'nuevo-lead'),
    'en-contacto': filteredContacts.filter(c => c.status === 'en-contacto'),
    'cita-agendada': filteredContacts.filter(c => c.status === 'cita-agendada'),
    'atencion-cliente': filteredContacts.filter(c => c.status === 'atencion-cliente'),
    'cita-cancelada': filteredContacts.filter(c => c.status === 'cita-cancelada'),
    'cerrado': filteredContacts.filter(c => c.status === 'cerrado')
  };

  // Effect to handle contact selection from Kanban
  useEffect(() => {
    if (selectedContactFromKanban) {
      setSelectedContact(selectedContactFromKanban);
      loadMessages(selectedContactFromKanban.id);
    }
  }, [selectedContactFromKanban, loadMessages]);

  // Effect separado para manejar suscripción WebSocket cuando cambia el contacto seleccionado
  useEffect(() => {
    if (selectedContact && wsHook.isConnected) {
      wsHook.subscribeToContact(selectedContact.id);
      
      // Cleanup: desuscribirse del contacto anterior
      return () => {
        wsHook.unsubscribeFromContact(selectedContact.id);
      };
    }
  }, [selectedContact, wsHook.isConnected, wsHook]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageContent = newMessage;
    setNewMessage("");
    setSendingMessage(true);

    console.log('📤 [SEND] Enviando mensaje:', {
      contactId: selectedContact.id,
      contactName: selectedContact.nombre,
      message: messageContent,
      lineId: lineId
    });

    try {
      // 🔥 NO AGREGAR MENSAJE LOCALMENTE - SOLO ENVIAR Y ESPERAR WEBSOCKET
      // 🔥 ACTUALIZAR ÚLTIMO MENSAJE DEL CONTACTO INMEDIATAMENTE
      if (onContactUpdate) {
        console.log('🔄 [SEND] Actualizando contacto localmente antes de enviar');
        onContactUpdate(selectedContact.id, {
          ultimoMensaje: {
            mensaje: messageContent,
            timestamp: normalizeTimestamp(new Date().toISOString()),
            remitente: 'agente'
          },
          ultimaActividad: normalizeTimestamp(new Date().toISOString())
        }, true);
      }
      
      // 🔥 ENVIAR POR WHATSAPP (EL BACKEND SE ENCARGA DE GUARDAR EN BD)
      console.log('📡 [SEND] Enviando a WhatsApp API...');
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedContact.telefono,
          message: messageContent,
          lineId: lineId,
          messageType: 'text',
          contactId: selectedContact.id
        }),
      });

      const result = await response.json();
      console.log('📡 [SEND] Respuesta de WhatsApp API:', result);

      if (!response.ok || !result.success) {
        let errorMessage = result.message || result.error || 'Error desconocido';
        if (errorMessage.includes('credenciales de WhatsApp')) {
          errorMessage = 'Error: La línea de WhatsApp no tiene configuradas las credenciales (JWT y NUMBER_ID).';
        }
        console.error('❌ [SEND] Error enviando mensaje:', errorMessage);
        alert(`Error enviando mensaje: ${errorMessage}`);
      } else {
        console.log('✅ [SEND] Mensaje enviado exitosamente, esperando WebSocket...');
      }
    } catch (error) {
      console.error('❌ [SEND] Error de conexión:', error);
      alert('Error de conexión. Verifica que el backend esté funcionando.');
    } finally {
      setSendingMessage(false);
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

      }
    } catch {
      alert('Error actualizando estado de IA');
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    // Si viene como 'HH:MM' o 'HH:MM:SS', devolver tal cual (está preformateado)
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) {
      return timestamp.slice(0, 5);
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    // Si viene como 'HH:MM' usar como hora de hoy
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) {
      return `Hoy - ${timestamp.slice(0,5)}`;
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;

    const now = new Date();

    const isToday = date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    const timeString = date.toLocaleTimeString('es-ES', {
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
      case 'cita-cancelada': return 'bg-red-100 text-red-800';
      case 'cerrado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nuevo-lead': return 'Nuevo Lead';
      case 'en-contacto': return 'En Contacto';
      case 'cita-agendada': return 'Cita Agendada';
      case 'atencion-cliente': return 'Atención al Cliente';
      case 'cita-cancelada': return 'Cita Cancelada';
      case 'cerrado': return 'Cerrado';
      default: return status;
    }
  };

  // 🔥 FUNCIÓN MEJORADA PARA NORMALIZAR TIMESTAMPS
  const normalizeTimestamp = (timestamp: string): string => {
    if (!timestamp) return new Date().toISOString(); // Fallback a ahora
    
    try {
      // Si ya tiene zona horaria (Z o +hh:mm / -hh:mm), lo dejamos igual
      const hasTZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(timestamp);
      if (hasTZ) {
        // Verificar que sea un timestamp válido
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn('⚠️ Timestamp inválido recibido:', timestamp);
          return new Date().toISOString();
        }
        return timestamp;
      }
      
      // Asegurar formato ISO y marcarlo como UTC
      const isoLike = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
      const normalizedTs = `${isoLike}Z`;
      
      // Verificar que el resultado sea válido
      const date = new Date(normalizedTs);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ No se pudo normalizar timestamp:', timestamp);
        return new Date().toISOString();
      }
      
      return normalizedTs;
    } catch (error) {
      console.error('❌ Error normalizando timestamp:', timestamp, error);
      return new Date().toISOString();
    }
  };

  return (
    <div className="h-full bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm border flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar - full screen on mobile when no chat selected */}
        <div className={`${selectedContact ? 'hidden' : 'flex'} md:flex w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col`}
        >
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
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
            {Object.entries(contactsByStatus)
              .filter(([, statusContacts]) => statusContacts.length > 0)
              .map(([status, statusContacts]) => (
                <div key={status} className="mb-2">
                  <div className="px-3 py-1 bg-gray-50 dark:bg-[hsl(240,10%,8%)] border-b border-gray-200 dark:border-gray-700">
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
                        p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-[hsl(240,10%,8%)] transition-colors
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
                               contact.status === 'cita-cancelada' ? 'Cancelada' : 
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
                                  {formatDate(
                                    // 🔥 PRIORIZAR TIMESTAMP DEL ÚLTIMO MENSAJE VISIBLE
                                    (selectedContact?.id === contact.id && messages.length > 0)
                                      ? messages[messages.length - 1].timestamp
                                      : (contact.ultimoMensaje?.timestamp || contact.ultimaActividad)
                                  )}
                                </span>
                              </div>
                          </div>
                          
                          {/* 🔥 ÚLTIMO MENSAJE PREVIEW - ACTUALIZADO VIA WEBSOCKET */}
                          {contact.ultimoMensaje && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">
                                  {contact.ultimoMensaje.remitente === 'usuario' ? '👤' : 
                                   contact.ultimoMensaje.remitente === 'bot' ? '🤖' : '👨‍💼'} 
                                  {contact.ultimoMensaje.remitente === 'usuario' ? 'Usuario' : 
                                   contact.ultimoMensaje.remitente === 'bot' ? 'Bot' : 'Agente'}:
                                </span> {contact.ultimoMensaje.mensaje}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron contactos</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - full screen on mobile when a chat is selected */}
    <div className={`${selectedContact ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[hsl(240,10%,8%)] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Back button for mobile */}
                    <button
                      type="button"
                      onClick={() => setSelectedContact(null)}
                      className="md:hidden mr-1 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                      aria-label="Volver a contactos"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
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
                        <div className="hidden sm:flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${wsHook.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <span className={`text-xs ${wsHook.isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {wsHook.isConnected ? 'Tiempo Real' : 'Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Toggle Switch (visible también en móvil) */}
                  <div className="flex items-center ml-2 shrink-0">
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
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2 md:p-3 pr-4 sm:pr-0 space-y-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map(message => {
                      // Determinar si es mensaje del agente humano o bot
                      const isHumanAgent = message.sender === 'agent';
                      const isBot = message.sender === 'bot';
                      
                      // Determinar la alineación: agentes humanos y bots van a la derecha, usuarios a la izquierda
                      const alignRight = isHumanAgent || isBot;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`
                            ${alignRight ? 'max-w-[55%] sm:max-w-[80%]' : 'max-w-[70%] sm:max-w-[80%]'} rounded-lg p-2 md:p-3 relative
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
                            {/* Mostrar saltos de línea reales y evitar overflow horizontal */}
                            <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
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
              <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[hsl(240,10%,14%)] flex-shrink-0">
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

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onFocus={() => setTimeout(() => scrollToBottom(), 0)}
                      onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && sendMessage()}
                      placeholder="Escribe un mensaje para WhatsApp..."
                      disabled={sendingMessage}
                      className="min-w-0 flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background text-foreground disabled:opacity-50 text-sm sm:text-base"
                    />
                    
                    {/* Botón de plantillas */}
                    <button
                      onClick={openTemplateModal}
                      disabled={loading}
                      className="shrink-0 p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-full sm:rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      title="Plantillas"
                    >
                      <File className="w-4 h-4" />
                    </button>

                    {/* Botón enviar */}
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="shrink-0 p-2 sm:px-6 sm:py-2 bg-green-600 text-white rounded-full sm:rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="hidden sm:inline">Enviar</span>
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
        ) : visibleTemplates.length > 0 ? (
                <div className="space-y-3">
          {visibleTemplates.map((template) => (
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MessageSquare, Clock, User } from "lucide-react";
import type { Contact } from "../../types/dashboard";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  isRead: boolean;
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

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || "http://localhost:5005";

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
    'atencion-cliente': filteredContacts.filter(c => c.status === 'atencion-cliente')
  };

  const loadMessages = useCallback(async (contactId: string) => {
    try {
      setLoading(true);
      
      // Llamar a la API interna de Next.js que se conecta al microservicio CRM
      const response = await fetch(`/api/messages/${contactId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log(`Cargadas ${data.data.length} conversaciones para contacto ${contactId}`);
          setMessages(data.data);
          setLoading(false);
          return;
        }
      }
      
      // Si no hay éxito en la respuesta, lanzar error para manejar el fallback
      throw new Error('No se pudieron cargar las conversaciones de la base de datos');
      
    } catch (error) {
      console.error('Error loading messages from database:', error);
      
      // Solo usar fallback si realmente no hay datos en la base de datos
      console.log('Usando datos de fallback para contacto:', contactId);
      
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        const mockMessages: Message[] = [
          {
            id: `${contactId}-1`,
            senderId: contactId,
            senderName: contact.nombre || contact.telefono,
            content: contact.ultimoMensaje?.mensaje || "Hola, estoy interesado en sus servicios",
            timestamp: contact.ultimoMensaje?.timestamp || contact.ultimaActividad,
            type: 'incoming',
            isRead: true
          },
          {
            id: `${contactId}-2`,
            senderId: 'agent',
            senderName: 'Agente',
            content: "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            type: 'outgoing',
            isRead: true
          }
        ];
        
        if (contact.status === 'en-contacto') {
          mockMessages.push({
            id: `${contactId}-3`,
            senderId: contactId,
            senderName: contact.nombre || contact.telefono,
            content: "Me gustaría agendar una cita para una consulta",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            type: 'incoming',
            isRead: true
          });
          mockMessages.push({
            id: `${contactId}-4`,
            senderId: 'agent',
            senderName: 'Agente',
            content: "Perfecto, tenemos disponibilidad esta semana. ¿Qué día te conviene?",
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            type: 'outgoing',
            isRead: true
          });
        }
        
        setMessages(mockMessages);
      }
    }
    
    setLoading(false);
  }, [contacts]);

  // Effect to handle contact selection from Kanban
  useEffect(() => {
    if (selectedContactFromKanban) {
      console.log('🎯 ChatSection: Received contact from Kanban:', selectedContactFromKanban);
      setSelectedContact(selectedContactFromKanban);
      loadMessages(selectedContactFromKanban.id);
    }
  }, [selectedContactFromKanban, loadMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: selectedContact.id,
          content: newMessage,
          lineId: lineId
        }),
      });

      if (response.ok) {
        const newMsg: Message = {
          id: Date.now().toString(),
          senderId: 'agent',
          senderName: 'Agente',
          content: newMessage,
          timestamp: new Date().toISOString(),
          type: 'outgoing',
          isRead: true
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        
        console.log('🤖 AI updated successfully for contact:', contactId, 'to:', isEnabled);
      } else {
        console.error('❌ Failed to update AI status');
      }
    } catch (error) {
      console.error('❌ Error updating AI status:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    // Formatear la hora
    const timeString = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diffDays === 1) {
      return `Hoy - ${timeString}`;
    } else if (diffDays === 2) {
      return `Ayer - ${timeString}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} días - ${timeString}`;
    } else if (diffHours <= 24) {
      return `${diffHours}h - ${timeString}`;
    } else {
      return `${date.toLocaleDateString('es-ES')} - ${timeString}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo-lead': return 'bg-blue-100 text-blue-800';
      case 'en-contacto': return 'bg-yellow-100 text-yellow-800';
      case 'cita-agendada': return 'bg-green-100 text-green-800';
      case 'atencion-cliente': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nuevo-lead': return 'Nuevo Lead';
      case 'en-contacto': return 'En Contacto';
      case 'cita-agendada': return 'Cita Agendada';
      case 'atencion-cliente': return 'Atención al Cliente';
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
                               contact.status === 'atencion-cliente' ? 'Atención' : 'Otro'}
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
                      <p className="text-sm text-muted-foreground">
                        {selectedContact.telefono} • {getStatusLabel(selectedContact.status)}
                      </p>
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
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`
                        max-w-[70%] rounded-lg p-3 
                        ${message.type === 'outgoing' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-foreground'
                        }
                      `}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'outgoing' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay mensajes aún</p>
                      <p className="text-sm">Inicia una conversación</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
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
    </div>
  );
};

export default ChatSection;

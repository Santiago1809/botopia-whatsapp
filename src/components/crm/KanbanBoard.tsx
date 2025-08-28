"use client";

import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Clock, Tag, MoreVertical, Edit2, Plus, X, Check, ChevronDown, ChevronRight, MessageSquare, BarChart3, Table } from "lucide-react";
import type { Contact } from "../../types/dashboard";

interface KanbanBoardProps {
  contacts: Contact[];
  onContactStatusChange: (contactId: string, newStatus: string) => void;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
  onContactSelect?: (contact: Contact) => void;
  onGotoChat?: (contact: Contact) => void;
}

const statusColumns = [
  {
    id: 'nuevo-lead',
    title: 'Nuevo Lead',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-800',
    cardColor: 'border-l-blue-500'
  },
  {
    id: 'en-contacto',
    title: 'En Contacto',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100 text-yellow-800',
    cardColor: 'border-l-yellow-500'
  },
  {
    id: 'cita-agendada',
    title: 'Cita Agendada',
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100 text-purple-800',
    cardColor: 'border-l-purple-500'
  },
  {
    id: 'atencion-cliente',
    title: 'Atención al Cliente',
    color: 'bg-orange-50 border-orange-200',
    headerColor: 'bg-orange-100 text-orange-800',
    cardColor: 'border-l-orange-500'
  },
  {
    id: 'cerrado',
    title: 'Cita Cancelada',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-800',
    cardColor: 'border-l-green-500'
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'alta':
      return 'text-red-600 bg-red-100';
    case 'media':
      return 'text-yellow-600 bg-yellow-100';
    case 'baja':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
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

interface ContactCardProps {
  contact: Contact;
  index: number;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
  onContactSelect?: (contact: Contact) => void;
  onGotoChat?: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, index, onContactUpdate, onContactSelect, onGotoChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(contact.nombre || '');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Effect para detectar actualizaciones de contacto (sin logs)
  useEffect(() => {
    // Contacto actualizado
  }, [contact]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  useEffect(() => {
    if (messageRef.current && measureRef.current && !expanded) {
      // Medir si el mensaje se trunca visualmente (más de 2 líneas)
      const messageHeight = messageRef.current.offsetHeight;
      const measureHeight = measureRef.current.offsetHeight;
      setShowSeeMore(messageHeight < measureHeight);
    } else if (expanded) {
      setShowSeeMore(false);
    }
  }, [contact.ultimoMensaje?.mensaje, expanded]);

  const handleSaveName = () => {
    if (onContactUpdate && editedName.trim() !== contact.nombre) {
      onContactUpdate(contact.id, { nombre: editedName.trim() });
    }
    setIsEditingName(false);
    setShowMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'name' | 'tag') => {
    if (e.key === 'Enter') {
      if (action === 'name') {
        handleSaveName();
      } else {
        handleAddTag();
      }
    } else if (e.key === 'Escape') {
      if (action === 'name') {
        setEditedName(contact.nombre || '');
        setIsEditingName(false);
      } else {
        setNewTag('');
        setIsAddingTag(false);
      }
      setShowMenu(false);
    }
  };

  const handleAddTag = () => {
    if (onContactUpdate && newTag.trim() && !contact.etiquetas.includes(newTag.trim())) {
      const updatedTags = [...contact.etiquetas, newTag.trim()];
      onContactUpdate(contact.id, { etiquetas: updatedTags });
    }
    setNewTag('');
    setIsAddingTag(false);
    setShowMenu(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (onContactUpdate) {
      const updatedTags = contact.etiquetas.filter(tag => tag !== tagToRemove);
      onContactUpdate(contact.id, { etiquetas: updatedTags });
    }
  };

  const handleContactClick = () => {
    if (onContactSelect) {
      onContactSelect(contact);
    }
  };

  const priorityOptions = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' },
  ];

  return (
    <Draggable draggableId={contact.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
                className={`
            relative bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm border-l-4 p-4 mb-2 w-full max-w-[320px] ${isEditingName ? 'min-h-[300px]' : 'min-h-[260px]'}
                  hover:shadow-md transition-all cursor-pointer
                  ${statusColumns.find(col => col.id === contact.status)?.cardColor}
                  ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
            ${isEditingName ? 'ring-2 ring-primary/60 border-primary/80 shadow-lg' : ''}
                `}
          onClick={handleContactClick}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="w-full">
                    <div className="flex justify-end gap-1 mb-2">
                      <button
                        onClick={handleSaveName}
                        className="p-1 hover:bg-green-100 rounded text-green-600 border border-green-200"
                        tabIndex={0}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditedName(contact.nombre || '');
                          setIsEditingName(false);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600 border border-red-200"
                        tabIndex={0}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, 'name')}
                      className="text-base font-semibold bg-white dark:bg-gray-900 border border-primary/40 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/60 w-full shadow-sm min-w-0"
                      placeholder="Nombre del contacto"
                    />
                  </div>
                ) : (
                  <h3
                    className="font-semibold text-foreground text-base leading-snug line-clamp-2 min-h-[2.7em] max-h-[2.7em]"
                    style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '2.7em', maxHeight: '2.7em' }}
                    title={contact.nombre && contact.nombre.trim() !== '' ? contact.nombre : 'Sin nombre'}
                  >
                    {contact.nombre && contact.nombre.trim() !== '' ? contact.nombre : 'Sin nombre'}
                  </h3>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {contact.telefono || 'Sin teléfono'}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.prioridad)}`}>{contact.prioridad}</span>
            </div>
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    {priorityOptions.map(opt => (
                      <button
                        key={opt.value}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex items-center gap-2 ${contact.prioridad === opt.value ? 'font-bold text-primary' : ''}`}
                        onClick={e => {
                          e.stopPropagation();
                          setShowMenu(false);
                          if (onContactUpdate) onContactUpdate(contact.id, { prioridad: opt.value });
                        }}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(opt.value).split(' ')[0]}`}></span>
                        {opt.label}
                        {contact.prioridad === opt.value && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    ))}
                  </div>
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar nombre
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingTag(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar etiqueta
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Última actividad: {formatDate(contact.ultimaActividad)}</span>
            </div>
          </div>

          {/* Tags */}
          {(contact.etiquetas.length > 0 || isAddingTag) && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {contact.etiquetas.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 group"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {contact.etiquetas.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    +{contact.etiquetas.length - 3}
                  </span>
                )}
              </div>
              
              {/* Add Tag Input */}
              {isAddingTag && (
                <div className="flex items-center gap-2">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 'tag')}
                    className="text-xs px-2 py-1 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 flex-1"
                    placeholder="Nueva etiqueta"
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-1 hover:bg-green-100 rounded text-green-600"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setNewTag('');
                      setIsAddingTag(false);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Último Mensaje */}
          {contact.ultimoMensaje && (
            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">
                Último mensaje ({contact.ultimoMensaje.remitente}):
              </p>
              <div className="relative">
                <p
                  ref={messageRef}
                  className={`text-sm text-foreground ${!expanded ? 'line-clamp-2' : ''}`}
                  style={{ minHeight: '3.3em', maxWidth: '100%', wordBreak: 'break-word' }}
                >
                {contact.ultimoMensaje.mensaje}
              </p>
                {/* Medidor oculto para saber si hay truncamiento visual */}
                {!expanded && (
                  <span
                    ref={measureRef}
                    className="text-sm text-foreground invisible block absolute z-[-1] left-0 top-0 w-full"
                    style={{ whiteSpace: 'pre-line', maxWidth: '100%', wordBreak: 'break-word' }}
                  >
                    {contact.ultimoMensaje.mensaje}
                  </span>
                )}
                {showSeeMore && !expanded && (
                  <div className="absolute bottom-[-0.5em] right-0 w-full flex justify-end items-end pointer-events-none">
                    <button
                      className="text-xs text-primary underline pr-2 pointer-events-auto bg-opacity-80 mt-2"
                      style={{ background: 'inherit' }}
                      onClick={e => { e.stopPropagation(); setExpanded(true); }}
                    >Ver más</button>
                  </div>
                )}
              </div>
              {expanded && (
                <div className="flex justify-end mt-1">
                  <button
                    className="text-xs text-primary underline pr-2"
                    onClick={e => { e.stopPropagation(); setExpanded(false); }}
                  >Ver menos</button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(contact.ultimoMensaje.timestamp)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between">
            {/* AI Toggle Switch - Izquierda */}
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={contact.estaAlHabilitado}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (onContactUpdate) {
                      onContactUpdate(contact.id, {
                        estaAlHabilitado: e.target.checked
                      });
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-all duration-300 shadow-inner ${
                  contact.estaAlHabilitado 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-green-200' 
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-200'
                } group-hover:shadow-lg`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${
                    contact.estaAlHabilitado ? 'translate-x-4' : 'translate-x-0.5'
                  } mt-0.5`}>
                    {/* Icono de IA minimalista */}
                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      contact.estaAlHabilitado ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                </div>
              </label>
              <span className={`text-xs font-medium ml-2 transition-colors duration-300 ${
                contact.estaAlHabilitado ? 'text-green-600' : 'text-gray-500'
              }`}>
                IA
              </span>
            </div>

            {/* Chat Button - Derecha */}
            <div className="flex flex-col items-center">
              <button
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-lg shadow transition cursor-pointer hover:scale-105 active:scale-95"
                title="Ir al chat"
                onClick={e => {
                  e.stopPropagation();
                  if (onGotoChat) {
                    onGotoChat(contact);
                  } else if (onContactSelect) {
                    onContactSelect(contact);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.2A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <span className="text-xs text-muted-foreground mt-1">Ir a chat</span>
            </div>
            
            {/* El puntico de estado va en la esquina inferior derecha */}
            <div className={`w-2 h-2 rounded-full absolute bottom-3 right-3 ${
              contact.prioridad === 'alta' ? 'bg-red-500' :
              contact.prioridad === 'media' ? 'bg-yellow-400' :
              contact.prioridad === 'baja' ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

interface KanbanColumnProps {
  column: typeof statusColumns[0];
  contacts: Contact[];
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
  onContactSelect?: (contact: Contact) => void;
  onGotoChat?: (contact: Contact) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, contacts, onContactUpdate, onContactSelect, onGotoChat }) => {
  // En móvil permitimos colapsar/expandir cada columna
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
  // h-full en desktop para que todas las columnas igualen la más alta
  <div className={`rounded-lg border-2 border-dashed ${column.color} md:h-full md:flex md:flex-col`}>
      {/* Encabezado (sirve como tarjeta-resumen en móvil) */}
      <div className={`px-4 py-3 rounded-t-lg ${column.headerColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Toggle solo visible en móvil */}
            <button
              type="button"
              className="md:hidden p-1 -ml-1 rounded hover:bg-white/30"
              aria-expanded={!isCollapsed}
              aria-controls={`kanban-${column.id}`}
              onClick={() => setIsCollapsed(v => !v)}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <h3 className="font-semibold">{column.title}</h3>
          </div>
          <span className="bg-white bg-opacity-70 px-2 py-1 rounded-full text-sm font-medium">
            {contacts.length}
          </span>
        </div>
      </div>

      {/* Área droppable (ocultable en móvil) */}
  <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            id={`kanban-${column.id}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
    // En desktop, el área de tarjetas ocupa todo el alto disponible y agrega scroll interno
    className={`p-4 md:block ${isCollapsed ? 'hidden' : 'block'} md:!block md:flex-1 md:min-h-0 md:overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-opacity-50' : ''
            }`}
          >
            {contacts.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={index}
                onContactUpdate={onContactUpdate}
                onContactSelect={onContactSelect}
                onGotoChat={onGotoChat}
              />
            ))}
            {provided.placeholder}

            {contacts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2"></div>
                <p>No hay contactos en esta etapa</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ contacts, onContactStatusChange, onContactUpdate, onContactSelect, onGotoChat }) => {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);

  // 🔍 DEBUG: Monitorear actualizaciones de contactos en KanbanBoard
  useEffect(() => {
    console.log('🏠 [KANBAN BOARD] Contactos actualizados:', {
      total: contacts.length,
      contactsWithLastMessage: contacts.filter(c => c.ultimoMensaje).length,
      lastActivityDates: contacts.map(c => ({ id: c.id, ultimaActividad: c.ultimaActividad }))
    });
  }, [contacts]);

  const handleDragStart = (start: { draggableId: string }) => {
    const contact = contacts.find(c => c.id === start.draggableId);
    setDraggedContact(contact || null);
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedContact(null);

    if (!result.destination) {
      return;
    }

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Find the contact that was moved
    const contact = contacts.find(c => c.id === draggableId);
    if (contact && contact.status !== newStatus) {
      // Mapear el status del frontend al funnel_stage del backend
      let funnelStage = contact.etapaDelEmbudo;
      
      switch (newStatus) {
        case 'nuevo-lead':
          funnelStage = 'nuevo_contacto';
          break;
        case 'en-contacto':
          funnelStage = 'en_contacto';
          break;
        case 'cita-agendada':
          funnelStage = 'cita_agendada';
          break;
        case 'atencion-cliente':
          funnelStage = 'atencion_cliente';
          break;
        case 'cerrado':
          funnelStage = 'cita_cancelada';
          break;
        default:
          funnelStage = 'nuevo_contacto';
      }

      // Actualizar tanto el status como el funnel_stage
      if (onContactUpdate) {
        onContactUpdate(draggableId, { 
          status: newStatus as Contact['status'],
          etapaDelEmbudo: funnelStage 
        });
      }
      
      // También llamar al callback de status change para compatibilidad
      onContactStatusChange(draggableId, newStatus);
    }
  };

  // Group contacts by status with special logic for "cerrado"
  const groupedContacts = statusColumns.reduce((acc, column) => {
    if (column.id === 'cerrado') {
      // Para la columna "Cerrado", mostrar contactos que tengan etapaDelEmbudo = 'cita_cancelada'
      acc[column.id] = contacts.filter(contact => contact.etapaDelEmbudo === 'cita_cancelada');
    } else {
      // Para las demás columnas, usar el status normal
      acc[column.id] = contacts.filter(contact => contact.status === column.id);
    }
    return acc;
  }, {} as Record<string, Contact[]>);

  return (
  <div className="overflow-x-hidden">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    {/* En desktop, forzamos a que cada ítem del grid estire su alto para igualar la fila más alta */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:items-stretch">
          {statusColumns.map(column => {
            const count = (groupedContacts[column.id] || []).length;
            const gradient =
              column.id === 'nuevo-lead' ? 'from-blue-500 to-blue-600' :
              column.id === 'en-contacto' ? 'from-yellow-500 to-yellow-600' :
              column.id === 'cita-agendada' ? 'from-purple-500 to-purple-600' :
              column.id === 'atencion-cliente' ? 'from-orange-500 to-orange-600' :
              'from-green-500 to-green-600';
            const title =
              column.id === 'nuevo-lead' ? 'Nuevos Contactos' :
              column.id === 'en-contacto' ? 'En Contacto' :
              column.id === 'cita-agendada' ? 'Citas Agendadas' :
              column.id === 'atencion-cliente' ? 'Atención Cliente' :
              'Cita Cancelada';
            const IconCmp = column.id === 'en-contacto' ? MessageSquare : (column.id === 'nuevo-lead' ? Table : BarChart3);

            return (
              <div key={column.id} className="flex flex-col gap-2 md:h-full">{/* h-full: estira al alto de la fila */}
                {/* Stat card solo en móvil */}
                <div className="md:hidden">
                  <div className={`bg-gradient-to-r ${gradient} rounded-lg p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">{title}</p>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <IconCmp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna */}
                <KanbanColumn
                  column={column}
                  contacts={groupedContacts[column.id] || []}
                  onContactUpdate={onContactUpdate}
                  onContactSelect={onContactSelect}
                  onGotoChat={onGotoChat}
                />
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Drag Indicator */}
      {draggedContact && (
        <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 z-50 pointer-events-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">
              Moviendo: {draggedContact.nombre || draggedContact.telefono}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;

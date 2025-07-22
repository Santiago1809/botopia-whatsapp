"use client";

import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Phone, Mail, Clock, Tag, User, MoreVertical, Edit2, Plus, X, Check } from "lucide-react";
import type { Contact } from "../../types/dashboard";

interface KanbanBoardProps {
  contacts: Contact[];
  onContactStatusChange: (contactId: string, newStatus: string) => void;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
  onContactSelect?: (contact: Contact) => void;
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
    title: 'Cerrado',
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
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return 'Ahora';
  }
};

interface ContactCardProps {
  contact: Contact;
  index: number;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
  onContactSelect?: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, index, onContactUpdate, onContactSelect }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(contact.nombre || '');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

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
  return (
    <Draggable draggableId={contact.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
                className={`
                  bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm border-l-4 p-4 mb-3 w-full max-w-[320px]
                  hover:shadow-md transition-all cursor-pointer
                  ${statusColumns.find(col => col.id === contact.status)?.cardColor}
                  ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
                `}
          onClick={handleContactClick}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, 'name')}
                      className="text-base font-semibold bg-transparent border-b border-blue-500 focus:outline-none flex-1"
                      placeholder="Nombre del contacto"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 hover:bg-green-100 rounded text-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditedName(contact.nombre || '');
                        setIsEditingName(false);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-foreground text-base">
                    {contact.nombre && contact.nombre.trim() !== '' ? contact.nombre : 'Sin nombre'}
                  </h3>
                )}
                {/* AI Status Indicator */}
                <div className={`w-2 h-2 rounded-full ${contact.estaAlHabilitado ? 'bg-green-500' : 'bg-red-500'}`} 
                     title={contact.estaAlHabilitado ? 'IA Activa' : 'IA Desactivada'}>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {contact.telefono || 'Sin teléfono'}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.prioridad)}`}>
                {contact.prioridad}
              </span>
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
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{contact.identificacion}</span>
            </div>
            
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
                <p className="text-sm text-foreground">
                {contact.ultimoMensaje.mensaje}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(contact.ultimoMensaje.timestamp)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600">
                <Mail className="w-4 h-4" />
              </button>
            </div>
            <div className={`w-2 h-2 rounded-full ${contact.estaAlHabilitado ? 'bg-green-500' : 'bg-red-500'}`}></div>
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
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, contacts, onContactUpdate, onContactSelect }) => {
  return (
    <div className={`rounded-lg border-2 border-dashed ${column.color} min-h-[600px]`}>
      {/* Column Header */}
      <div className={`px-4 py-3 rounded-t-lg ${column.headerColor}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{column.title}</h3>
          <span className="bg-white bg-opacity-70 px-2 py-1 rounded-full text-sm font-medium">
            {contacts.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 min-h-[500px] ${
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

const KanbanBoard: React.FC<KanbanBoardProps> = ({ contacts, onContactStatusChange, onContactUpdate, onContactSelect }) => {
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);

  // Debug logs
  console.log('📋 KanbanBoard - Received contacts:', contacts);
  console.log('📋 KanbanBoard - Contact count:', contacts.length);
  console.log('📋 KanbanBoard - Contact details:', contacts.map(c => ({ id: c.id, name: c.nombre, status: c.status })));
  
  // Log contacts by status
  statusColumns.forEach(column => {
    const contactsInColumn = contacts.filter(contact => contact.status === column.id);
    console.log(`📋 ${column.title} (${column.id}):`, contactsInColumn.length, 'contacts');
    if (contactsInColumn.length > 0) {
      console.log(`📋 ${column.title} details:`, contactsInColumn.map(c => ({ id: c.id, name: c.nombre })));
    }
  });

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
      onContactStatusChange(draggableId, newStatus);
    }
  };

  // Group contacts by status
  const groupedContacts = statusColumns.reduce((acc, column) => {
    acc[column.id] = contacts.filter(contact => contact.status === column.id);
    return acc;
  }, {} as Record<string, Contact[]>);

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-w-[1200px]">
          {statusColumns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              contacts={groupedContacts[column.id] || []}
              onContactUpdate={onContactUpdate}
              onContactSelect={onContactSelect}
            />
          ))}
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

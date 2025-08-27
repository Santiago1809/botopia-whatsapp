"use client";

import { Search, Filter, Tag, Plus, X, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Contact } from "../../types/dashboard";

interface FilterSidebarProps {
  allContacts: Contact[];
  filteredContacts: Contact[];
  selectedTags: string[];
  searchTerm: string;
  lineTags?: string[]; // Etiquetas de la línea desde la base de datos
  onTagToggle: (tag: string) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  onAddTag?: (tag: string) => void;
  onEditTag?: (oldTag: string, newTag: string) => void;
  onDeleteTag?: (tag: string) => void;
}

export default function FilterSidebar({
  allContacts,
  filteredContacts,
  selectedTags,
  searchTerm,
  lineTags = [], // Default a array vacío
  onTagToggle,
  onSearchChange,
  onClearFilters,
  onAddTag,
  onEditTag,
  onDeleteTag
}: FilterSidebarProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  
  // Combinar etiquetas de contactos y etiquetas de la línea
  const contactTags = Array.from(new Set(allContacts.flatMap(contact => contact.etiquetas)));
  const allTags = Array.from(new Set([...contactTags, ...lineTags]));  

  const handleAddTag = async () => {
    if (newTagName.trim() && onAddTag) {
      await onAddTag(newTagName.trim());
      setNewTagName("");
      setIsAddingTag(false);
    }
  };

  const handleEditTag = async () => {
    if (editTagName.trim() && editingTag && onEditTag) {
      await onEditTag(editingTag, editTagName.trim());
      setEditingTag(null);
      setEditTagName("");
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (onDeleteTag) {
      await onDeleteTag(tag);
    }
  };

  const startEditingTag = (tag: string) => {
    setEditingTag(tag);
    setEditTagName(tag);
    setIsAddingTag(false); // Cerrar el formulario de agregar si está abierto
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditTagName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsAddingTag(false);
      setNewTagName("");
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditTag();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="w-full md:w-64 bg-card dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm border h-fit">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-foreground flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-primary" />
          Filtros
        </h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-background dark:bg-[hsl(240,10%,18%)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Clear Filters */}
        {(selectedTags.length > 0 || searchTerm) && (
          <button
            onClick={onClearFilters}
            className="w-full mb-4 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Limpiar filtros ({selectedTags.length + (searchTerm ? 1 : 0)})
          </button>
        )}
      </div>

      {/* Prioridad */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-foreground flex items-center mb-3">
          <div className="w-4 h-4 mr-2 text-primary">◆</div>
          Prioridad
        </h4>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onTagToggle('alta')}
            className={`w-12 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              selectedTags.includes('alta')
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30'
            }`}
            title="Filtrar por prioridad alta"
          >
            Alta
          </button>
          <button
            onClick={() => onTagToggle('media')}
            className={`w-12 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              selectedTags.includes('media')
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
            }`}
            title="Filtrar por prioridad media"
          >
            Media
          </button>
          <button
            onClick={() => onTagToggle('baja')}
            className={`w-12 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              selectedTags.includes('baja')
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            }`}
            title="Filtrar por prioridad baja"
          >
            Baja
          </button>
        </div>
      </div>

      {/* Etiquetas */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center">
            <Tag className="w-4 h-4 mr-2 text-primary" />
            Etiquetas ({allTags.length})
          </h4>
          <button
            onClick={() => setIsAddingTag(!isAddingTag)}
            className="p-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            title="Agregar nueva etiqueta"
          >
            {isAddingTag ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Formulario para agregar nueva etiqueta */}
        {isAddingTag && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Nombre de la etiqueta..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-background dark:bg-[hsl(240,10%,18%)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="flex-1 px-2 py-1.5 bg-primary text-white rounded-md text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setIsAddingTag(false);
                  setNewTagName("");
                }}
                className="flex-1 px-2 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulario para editar etiqueta */}
        {editingTag && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Edit2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                Editando: &quot;{editingTag}&quot;
              </span>
            </div>
            <input
              type="text"
              value={editTagName}
              onChange={(e) => setEditTagName(e.target.value)}
              onKeyDown={handleEditKeyPress}
              placeholder="Nuevo nombre de la etiqueta"
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md text-sm bg-white dark:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditTag}
                disabled={!editTagName.trim()}
                className="flex-1 px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Guardar
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 px-2 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allTags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);
            const tagCount = allContacts.filter(c => c.etiquetas.includes(tag)).length;
            
            return (
              <div
                key={index}
                className={`group relative rounded-md border transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-gray-50 dark:bg-[hsl(240,10%,18%)] border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[hsl(240,10%,22%)]'
                }`}
              >
                {/* Contenedor de la etiqueta - sin button anidado */}
                <div
                  onClick={() => onTagToggle(tag)}
                  className="w-full text-left px-3 py-2 text-sm cursor-pointer"
                  title={tag}
                >
                  <div className="flex items-center justify-between pr-2">
                    <div className="flex items-center gap-2 max-w-[120px]">
                      <span className="truncate block max-w-[80px]" title={tag}>{tag}</span>
                    </div>
                                         <div className="flex items-center gap-1">
                       {/* Íconos de acción para todas las etiquetas */}
                       <span className="flex gap-1 mr-2 opacity-80 group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             startEditingTag(tag);
                           }}
                           className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/50 dark:hover:bg-blue-800/50"
                           title="Editar etiqueta"
                         >
                           <Edit2 className="w-3 h-3" />
                         </button>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteTag(tag);
                           }}
                           className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/50 dark:hover:bg-red-800/50"
                           title="Eliminar etiqueta"
                         >
                           <Trash2 className="w-3 h-3" />
                         </button>
                       </span>
                       <span className={`text-xs px-2 py-1 rounded-full ${
                         isSelected 
                           ? 'bg-primary text-white' 
                           : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                       }`}>
                         {tagCount}
                       </span>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {allTags.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No hay etiquetas disponibles
            </div>
          )}
        </div>
      </div>

      {/* Filtros de Estado */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-foreground flex items-center mb-3">
          <Filter className="w-4 h-4 mr-2 text-primary" />
          Estado del Embudo
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => onTagToggle('nuevo_contacto')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedTags.includes('nuevo_contacto')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-[hsl(240,10%,18%)] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>Nuevos Contactos</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedTags.includes('nuevo_contacto')
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {filteredContacts.filter(c => c.etapaDelEmbudo === 'nuevo_contacto').length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => onTagToggle('en_contacto')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedTags.includes('en_contacto')
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
                : 'bg-gray-50 dark:bg-[hsl(240,10%,18%)] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>En Contacto</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedTags.includes('en_contacto')
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 dark:bg-yellow-700 text-yellow-600 dark:text-yellow-300'
              }`}>
                {filteredContacts.filter(c => c.etapaDelEmbudo === 'en_contacto').length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => onTagToggle('cita_agendada')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedTags.includes('cita_agendada')
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                : 'bg-gray-50 dark:bg-[hsl(240,10%,18%)] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>Citas Agendadas</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedTags.includes('cita_agendada')
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-700 text-purple-200'
              }`}>
                {filteredContacts.filter(c => c.etapaDelEmbudo === 'cita_agendada').length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => onTagToggle('atencion_cliente')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedTags.includes('atencion_cliente')
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700'
                : 'bg-gray-50 dark:bg-[hsl(240,10%,18%)] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>Atención Cliente</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedTags.includes('atencion_cliente')
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-700 text-orange-200'
              }`}>
                {filteredContacts.filter(c => c.etapaDelEmbudo === 'atencion_cliente').length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => onTagToggle('cita_cancelada')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedTags.includes('cita_cancelada')
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                : 'bg-gray-50 dark:bg-[hsl(240,10%,18%)] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>Cita Cancelada</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedTags.includes('cita_cancelada')
                  ? 'bg-green-500 text-white'
                  : 'bg-green-700 text-green-200'
              }`}>
                {filteredContacts.filter(c => c.etapaDelEmbudo === 'cita_cancelada').length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-foreground mb-3">Resumen</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">{filteredContacts.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nuevos:</span>
            <span className="font-medium text-blue-600">{filteredContacts.filter(c => c.status === 'nuevo-lead').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">En contacto:</span>
            <span className="font-medium text-yellow-600">{filteredContacts.filter(c => c.status === 'en-contacto').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Citas:</span>
            <span className="font-medium text-purple-600">{filteredContacts.filter(c => c.status === 'cita-agendada').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Atención:</span>
            <span className="font-medium text-orange-600">{filteredContacts.filter(c => c.status === 'atencion-cliente').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cita Cancelada:</span>
            <span className="font-medium text-green-600">{filteredContacts.filter(c => c.etapaDelEmbudo === 'cita_cancelada').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

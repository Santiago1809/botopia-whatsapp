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
    <div className="w-52 bg-card dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm border h-fit">
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
                className="flex-1 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setIsAddingTag(false);
                  setNewTagName("");
                }}
                className="flex-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
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
              <Edit2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
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
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
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
            const isFromLine = lineTags.includes(tag); // Verificar si es etiqueta de línea
            
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {tagCount}
                      </span>
                      {/* Íconos de acción solo para etiquetas de línea */}
                      {isFromLine && (
                        <span className="flex gap-1 ml-1 opacity-80 group-hover:opacity-100 transition-opacity">
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
                      )}
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
            <span className="text-muted-foreground">Cerrados:</span>
            <span className="font-medium text-green-600">{filteredContacts.filter(c => c.status === 'cerrado').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

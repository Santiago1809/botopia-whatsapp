import React, { useState } from 'react';
import { Trash } from "lucide-react";
import { Contact, Group } from '@/types/global';

interface SyncedSidebarProps {
  contacts: Contact[];
  groups: Group[];
  onSelect: (item: Contact | Group, type: 'contact' | 'group') => void;
  onSyncClick: () => void;
  onRemoveContact: (id: string) => void;
  onRemoveGroup: (id: string) => void;
  selectedId?: string;
  selectedType?: 'contact' | 'group';
  onToggleAgente?: (id: string, newValue: boolean) => void;
  onBulkDelete?: () => void;
  onBulkDisable?: () => void;
  onBulkEnable?: () => void;
}

const SyncedSidebar: React.FC<SyncedSidebarProps> = ({ contacts, groups, onSelect, onSyncClick, onRemoveContact, onRemoveGroup, selectedId, selectedType, onToggleAgente, onBulkDelete, onBulkDisable, onBulkEnable }) => {
  // Filtro de búsqueda y tipo
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contacts' | 'groups'>('all');

  // Filtrado
  const filteredContacts = contacts.filter(c => (c.name || c.number).toLowerCase().includes(search.toLowerCase()));
  const filteredGroups = groups.filter(g => (g.name || g.number).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full p-4 flex flex-col">
      <button
        className="mb-4 px-4 py-2 bg-primary text-white rounded-full shadow hover:bg-secondary transition"
        onClick={onSyncClick}
      >
        Sincronizar contactos y grupos
      </button>
      <h2 className="font-bold text-lg mb-4">Contactos y Grupos Sincronizados</h2>
      {/* Filtro visual */}
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('all')}
        >Todos</button>
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterType === 'contacts' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('contacts')}
        >Contactos</button>
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterType === 'groups' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('groups')}
        >Grupos</button>
      </div>
      {/* Botones de acciones masivas */}
      <div className="flex gap-2 mb-2">
        <button
          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-700"
          onClick={onBulkDelete}
        >Eliminar todos</button>
        <button
          className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-600"
          onClick={onBulkDisable}
        >Desactivar todos</button>
        <button
          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-700"
          onClick={onBulkEnable}
        >Activar todos</button>
      </div>
      {/* Input de búsqueda debajo de los botones masivos */}
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full mb-3 px-2 py-1 rounded border border-gray-200 text-xs"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {/* Lista con scroll */}
      <div className="flex-1 overflow-y-auto max-h-[70vh] pr-1">
        {(filterType === 'all' || filterType === 'contacts') && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Contactos</h3>
            {filteredContacts.length === 0 ? (
              <div className="text-sm text-gray-500">No hay contactos sincronizados.</div>
            ) : (
              <ul>
                {filteredContacts.map((contact) => (
                  <li
                    key={contact.id}
                    className={`py-1 border-b last:border-b-0 flex items-center justify-between rounded px-2 group ${selectedId === contact.id && selectedType === 'contact' ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-gray-200'}`}
                    onClick={() => onSelect(contact, 'contact')}
                  >
                    <span className="font-medium">
                      {contact.name || contact.number}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Switch para agenteHabilitado */}
                      {typeof contact.agenteHabilitado === 'boolean' && onToggleAgente && (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contact.agenteHabilitado}
                            onChange={e => {
                              e.stopPropagation();
                              onToggleAgente(contact.id, e.target.checked);
                            }}
                            className="accent-primary mr-1"
                          />
                          <span className="text-xs">Agente</span>
                        </label>
                      )}
                      <button
                        className="ml-2 p-1 rounded hover:bg-red-100 text-red-500 opacity-70 group-hover:opacity-100 transition"
                        title="Eliminar contacto"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('¿Eliminar este contacto sincronizado?')) {
                            onRemoveContact(contact.id);
                          }
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {(filterType === 'all' || filterType === 'groups') && (
          <div>
            <h3 className="font-semibold mb-2">Grupos</h3>
            {filteredGroups.length === 0 ? (
              <div className="text-sm text-gray-500">No hay grupos sincronizados.</div>
            ) : (
              <ul>
                {filteredGroups.map((group) => (
                  <li
                    key={group.id}
                    className={`py-1 border-b last:border-b-0 flex items-center justify-between rounded px-2 group ${selectedId === group.id && selectedType === 'group' ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-gray-200'}`}
                    onClick={() => onSelect(group, 'group')}
                  >
                    <span className="font-medium">
                      {group.name || group.number}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Switch para agenteHabilitado */}
                      {typeof group.agenteHabilitado === 'boolean' && onToggleAgente && (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={group.agenteHabilitado}
                            onChange={e => {
                              e.stopPropagation();
                              onToggleAgente(group.id, e.target.checked);
                            }}
                            className="accent-primary mr-1"
                          />
                          <span className="text-xs">Agente</span>
                        </label>
                      )}
                      <button
                        className="ml-2 p-1 rounded hover:bg-red-100 text-red-500 opacity-70 group-hover:opacity-100 transition"
                        title="Eliminar grupo"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('¿Eliminar este grupo sincronizado?')) {
                            onRemoveGroup(group.id);
                          }
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncedSidebar; 
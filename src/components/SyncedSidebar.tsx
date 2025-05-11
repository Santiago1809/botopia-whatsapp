import React, { useState } from 'react';
import { Trash, Users, UserCheck, UserX, RefreshCcw } from "lucide-react";
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
        className="mb-4 px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow hover:from-secondary hover:to-primary transition font-bold text-base"
        onClick={onSyncClick}
      >
        <RefreshCcw className="w-5 h-5" />
        Sincronizar contactos y grupos
      </button>
      <h2 className="font-bold text-lg mb-4 text-center w-full">Contactos y Grupos Sincronizados</h2>
      {/* Filtro visual */}
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('all')}
        ><Users className="inline w-4 h-4 mr-1" />Todos</button>
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterType === 'contacts' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('contacts')}
        ><UserCheck className="inline w-4 h-4 mr-1" />Contactos</button>
        <button
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filterType === 'groups' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('groups')}
        ><UserX className="inline w-4 h-4 mr-1" />Grupos</button>
      </div>
      {/* Botones de acciones masivas */}
      <div className="flex gap-2 mb-2 justify-center">
        <button
          className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold hover:bg-red-200 border border-red-200 shadow-sm transition min-w-[0]"
          style={{minWidth:32}}
          onClick={onBulkDelete}
          title="Eliminar todos"
        >
          <Trash className="w-4 h-4" />
        </button>
        <button
          className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold hover:bg-yellow-200 border border-yellow-200 shadow-sm transition min-w-[0]"
          style={{minWidth:32}}
          onClick={onBulkDisable}
          title="Desactivar IA en todos"
        >
          <UserX className="w-4 h-4" />
        </button>
        <button
          className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold hover:bg-green-200 border border-green-200 shadow-sm transition min-w-[0]"
          style={{minWidth:32}}
          onClick={onBulkEnable}
          title="Activar IA en todos"
        >
          <UserCheck className="w-4 h-4" />
        </button>
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
                    <div className="flex items-center gap-2 flex-1">
                      {/* Switch para IA */}
                      {typeof contact.agenteHabilitado === 'boolean' && onToggleAgente && (
                        <label className="flex items-center cursor-pointer gap-1">
                          <input
                            type="checkbox"
                            checked={contact.agenteHabilitado}
                            onChange={e => {
                              e.stopPropagation();
                              onToggleAgente(contact.id, e.target.checked);
                            }}
                            className="accent-primary scale-110"
                          />
                          <span className="text-xs font-bold text-primary">IA</span>
                        </label>
                      )}
                      <span className="font-medium text-base truncate max-w-[140px]" title={contact.name || contact.number}>{contact.name || contact.number}</span>
                    </div>
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
                    <div className="flex items-center gap-2 flex-1">
                      {/* Switch para IA */}
                      {typeof group.agenteHabilitado === 'boolean' && onToggleAgente && (
                        <label className="flex items-center cursor-pointer gap-1">
                          <input
                            type="checkbox"
                            checked={group.agenteHabilitado}
                            onChange={e => {
                              e.stopPropagation();
                              onToggleAgente(group.id, e.target.checked);
                            }}
                            className="accent-primary scale-110"
                          />
                          <span className="text-xs font-bold text-primary">IA</span>
                        </label>
                      )}
                      <span className="font-medium text-base truncate max-w-[140px]" title={group.name || group.number}>{group.name || group.number}</span>
                    </div>
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
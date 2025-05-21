import React, { useState } from 'react';
import { Trash, Users, UserCheck, UserX, RefreshCcw } from "lucide-react";
import { Contact, Group } from '@/types/global';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface SyncedSidebarProps {
  contacts: Contact[];
  groups: Group[];
  unsyncedContacts?: Contact[];
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
  selectedNumberId?: string;
}

const SyncedSidebar: React.FC<SyncedSidebarProps> = ({ 
  contacts, 
  groups,
  unsyncedContacts = [],
  onSelect, 
  onSyncClick, 
  onRemoveContact, 
  onRemoveGroup, 
  selectedId, 
  selectedType, 
  onToggleAgente, 
  onBulkDelete, 
  onBulkDisable, 
  onBulkEnable,
  selectedNumberId 
}) => {
  // Filtro de búsqueda y tipo
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'contacts' | 'groups' | 'unsynced'>('all');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Inicializar socket
  React.useEffect(() => {
    const newSocket = io(BACKEND_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    // Escuchar actualizaciones de contactos no sincronizados
    newSocket.on('unsynced-contacts-updated', (data) => {
      if (data.numberid && data.numberid.toString() === selectedNumberId?.toString()) {
        fetch(`${BACKEND_URL}/api/unsyncedcontacts?numberid=${selectedNumberId}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              // Actualiza el estado local de los contactos no sincronizados
              if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('updateUnsyncedContacts', { detail: data }));
              }
            }
          });
      }
    });

    return () => {
      newSocket.disconnect();
      newSocket.off('unsynced-contacts-updated');
    };
  }, [selectedNumberId]);

  // Escuchar evento global para actualizar la prop unsyncedContacts si el padre lo permite
  React.useEffect(() => {
    function handleUpdateUnsyncedContacts(e: CustomEvent) {
      if (typeof e.detail !== 'undefined' && Array.isArray(e.detail)) {
        // Si tienes un setter para unsyncedContacts, úsalo aquí
        // Si no, puedes levantar un callback al padre si lo deseas
        // Por defecto, solo fuerza un re-render si la prop cambia en el padre
      }
    }
    window.addEventListener('updateUnsyncedContacts', handleUpdateUnsyncedContacts as EventListener);
    return () => window.removeEventListener('updateUnsyncedContacts', handleUpdateUnsyncedContacts as EventListener);
  }, []);

  // Ordenar contactos y grupos por último mensaje
  const orderedContacts = [...contacts].sort((a: Contact, b: Contact) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
  const orderedGroups = [...groups].sort((a: Group, b: Group) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

  // Filtrado
  const filteredContacts = orderedContacts.filter(c => ((c.name ?? c.number ?? '') + '').toLowerCase().includes(search.toLowerCase()));
  const filteredGroups = orderedGroups.filter(g => ((g.name ?? g.number ?? '') + '').toLowerCase().includes(search.toLowerCase()));

  // Filter unsynced contacts (excluye grupos y contactos especiales de WhatsApp)
  const filteredUnsyncedContacts = unsyncedContacts.filter(c => {
    const name = (c.name ?? '').toLowerCase().trim();
    if (["status", "estado", "ia status", "ia", "statuses", "estados"].includes(name)) return false;
    // Excluir grupos: si wa_id o id termina en '@g.us' o si el número/id tiene más de 15 dígitos
    const waId = (c.wa_id ?? c.id ?? '').toLowerCase();
    if (waId.endsWith('@g.us')) return false;
    const num = (c.number ?? c.id ?? '').replace(/[^0-9]/g, '');
    if (num.length > 15) return false;
    return ((c.name ?? c.number ?? '') + '').toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (item: Contact | Group, type: 'contact' | 'group') => {
    onSelect(item, type);
    if (socket && selectedNumberId) {
      socket.emit('get-chat-history', {
        numberId: selectedNumberId,
        to: item.wa_id || item.id
      });
    }
  };

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Input de búsqueda en la parte superior */}
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full mb-3 px-2 py-1 rounded-full border border-gray-200 text-xs"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {/* Filtro visual */}
      <div className="flex gap-2 mb-2">
        <button
          className={`px-0.5 py-1 rounded-full text-xs font-semibold border transition text-center ${filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('all')}
        >
          <Users className="inline w-4 h-4 mr-1" />Todos
        </button>
        <button
          className={`px-0.5 py-1 rounded-full text-xs font-semibold border transition text-center ${filterType === 'contacts' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('contacts')}
        >
          <UserCheck className="inline w-4 h-4 mr-1" />Contactos
        </button>
        <button
          className={`px-0.4 py-1 rounded-full text-xs font-semibold border transition text-center ${filterType === 'groups' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('groups')}
        >
          <UserX className="inline w-4 h-4 mr-1" />Grupos
        </button>
        <button
          className={`px-0.4 py-1 rounded-full text-xs font-semibold border transition text-center ${filterType === 'unsynced' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setFilterType('unsynced')}
        >
          <UserX className="inline w-4 h-4 mr-1" />No Sincronizados
        </button>
      </div>
      {/* Botones de acciones masivas */}
      <div className="flex gap-2 mb-2 justify-center">
        <button
          className="group flex items-center justify-center gap-2 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold hover:bg-red-200 border border-red-200 shadow-sm transition-all duration-200 min-w-[32px] overflow-hidden"
          style={{ minWidth: 32, maxWidth: 120 }}
          onClick={async () => {
            // Elimina todos los sincronizados y no sincronizados
            if (window.confirm('¿Eliminar TODOS los contactos y no sincronizados de este número?')) {
              if (selectedNumberId) {
                await fetch(`${BACKEND_URL}/api/unsyncedcontacts/by-number/${selectedNumberId}`, { method: 'DELETE' });
              }
              if (onBulkDelete) onBulkDelete();
            }
          }}
        >
          <Trash className="w-5 h-5" />
          <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[90px] group-hover:ml-2 transition-all duration-200">
            Eliminar todos
          </span>
        </button>
        <button
          className="group flex items-center justify-center gap-2 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold hover:bg-yellow-200 border border-yellow-200 shadow-sm transition-all duration-200 min-w-[32px] overflow-hidden"
          style={{ minWidth: 32, maxWidth: 120 }}
          onClick={async () => {
            // Optimismo visual: desactiva todos en el frontend
            if (unsyncedContacts.length > 0) {
              unsyncedContacts.forEach(c => {
                if (onToggleAgente) onToggleAgente(c.id, false);
              });
            }
            // Desactivar IA en todos los sincronizados y no sincronizados
            if (onBulkDisable) await onBulkDisable();
            if (selectedNumberId && unsyncedContacts.length > 0) {
              await Promise.all(unsyncedContacts.map(async (contact) => {
                await fetch(`${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ agentehabilitado: false })
                });
              }));
            }
          }}
        >
          <UserX className="w-5 h-5" />
          <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[90px] group-hover:ml-2 transition-all duration-200">
            Desactivar todos
          </span>
        </button>
        <button
          className="group flex items-center justify-center gap-2 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold hover:bg-green-200 border border-green-200 shadow-sm transition-all duration-200 min-w-[32px] overflow-hidden"
          style={{ minWidth: 32, maxWidth: 120 }}
          onClick={async () => {
            // Optimismo visual: activa todos en el frontend
            if (unsyncedContacts.length > 0) {
              unsyncedContacts.forEach(c => {
                if (onToggleAgente) onToggleAgente(c.id, true);
              });
            }
            // Activar IA en todos los sincronizados y no sincronizados
            if (onBulkEnable) await onBulkEnable();
            if (selectedNumberId && unsyncedContacts.length > 0) {
              await Promise.all(unsyncedContacts.map(async (contact) => {
                await fetch(`${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ agentehabilitado: true })
                });
              }));
            }
          }}
        >
          <UserCheck className="w-5 h-5" />
          <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[90px] group-hover:ml-2 transition-all duration-200">
            Activar todos
          </span>
        </button>
      </div>
      {/* Lista de contactos y grupos */}
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
                    onClick={() => handleSelect(contact, 'contact')}
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
                      <span
                        className="font-medium text-base max-w-[180px] truncate overflow-hidden whitespace-nowrap cursor-pointer"
                        title={contact.name || contact.number}
                        onClick={e => {
                          e.stopPropagation();
                          handleSelect(contact, 'contact');
                        }}
                      >
                        {contact.name || contact.number}
                      </span>
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
                    onClick={() => handleSelect(group, 'group')}
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
                      <span
                        className="font-medium text-base max-w-[180px] truncate overflow-hidden whitespace-nowrap cursor-pointer"
                        title={group.name || group.number}
                        onClick={e => {
                          e.stopPropagation();
                          handleSelect(group, 'group');
                        }}
                      >
                        {group.name || group.number}
                      </span>
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
        {(filterType === 'all' || filterType === 'unsynced') && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">No Sincronizados</h3>
            {/* Solo contactos no sincronizados, sin filtrar por isGroup */}
            {filteredUnsyncedContacts.length === 0 ? (
              <div className="text-sm text-gray-500">No hay contactos no sincronizados.</div>
            ) : (
              <ul>
                {filteredUnsyncedContacts.map((contact) => (
                  <li
                    key={contact.id}
                    className={`py-1 border-b last:border-b-0 flex items-center justify-between rounded px-2 group ${selectedId === contact.id && selectedType === 'contact' ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-gray-200'}`}
                    onClick={() => handleSelect(contact, 'contact')}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {/* Switch para IA independiente */}
                      <label className="flex items-center cursor-pointer gap-1">
                        <input
                          type="checkbox"
                          checked={contact.agenteHabilitado === true}
                          onChange={async e => {
                            e.stopPropagation();
                            // Optimismo visual: actualiza el estado local inmediatamente
                            if (onToggleAgente) onToggleAgente(contact.id, e.target.checked);
                            try {
                              await fetch(`${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ agentehabilitado: e.target.checked })
                              });
                              // El padre refrescará la lista cuando llegue el evento socket
                            } catch (error) {
                              // Si falla, revierte el cambio local
                              if (onToggleAgente) onToggleAgente(contact.id, !e.target.checked);
                              console.error('Error al actualizar el estado del agente:', error);
                            }
                          }}
                          className="accent-primary scale-110"
                        />
                        <span className="text-xs font-bold text-primary">IA</span>
                      </label>
                      <span
                        className="font-medium text-base max-w-[180px] truncate overflow-hidden whitespace-nowrap cursor-pointer"
                        title={contact.name || contact.number}
                        onClick={e => {
                          e.stopPropagation();
                          handleSelect(contact, 'contact');
                        }}
                      >
                        {contact.name || contact.number}
                      </span>
                    </div>
                    <button
                      className="ml-2 p-1 rounded hover:bg-red-100 text-red-500 opacity-70 group-hover:opacity-100 transition"
                      title="Eliminar contacto no sincronizado"
                      onClick={async e => {
                        e.stopPropagation();
                        if (window.confirm('¿Eliminar este contacto no sincronizado?')) {
                          try {
                            await fetch(`${BACKEND_URL}/api/unsyncedcontacts/${contact.id}`, { method: 'DELETE' });
                            if (onRemoveContact) onRemoveContact(contact.id);
                          } catch (error) {
                            console.error('Error al eliminar el contacto:', error);
                          }
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
      {/* Botón de sincronizar en la parte inferior, texto pequeño y en una línea */}
      <div className="mt-auto mb-4 flex justify-center">
        <button
          className="px-4 py-2 flex items-center gap-2 text-xs bg-primary text-white rounded-full shadow hover:bg-secondary transition whitespace-nowrap"
          onClick={onSyncClick}
          style={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}
        >
          <RefreshCcw className="w-4 h-4" />
          Sincronizar contactos y grupos
        </button>
      </div>
    </div>
  );
};

export default SyncedSidebar; 
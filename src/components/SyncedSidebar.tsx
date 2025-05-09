import React from 'react';
import { Trash } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  number: string;
}

interface Group {
  id: number;
  name: string;
  number: string;
}

interface SyncedSidebarProps {
  contacts: Contact[];
  groups: Group[];
  onSelect: (item: Contact | Group, type: 'contact' | 'group') => void;
  onSyncClick: () => void;
  onRemoveContact: (id: number) => void;
  onRemoveGroup: (id: number) => void;
}

const SyncedSidebar: React.FC<SyncedSidebarProps> = ({ contacts, groups, onSelect, onSyncClick, onRemoveContact, onRemoveGroup }) => {
  return (
    <div className="h-full p-4 flex flex-col">
      <button
        className="mb-4 px-4 py-2 bg-primary text-white rounded-full shadow hover:bg-secondary transition"
        onClick={onSyncClick}
      >
        Sincronizar contactos y grupos
      </button>
      <h2 className="font-bold text-lg mb-4">Contactos y Grupos Sincronizados</h2>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Contactos</h3>
        {contacts.length === 0 ? (
          <div className="text-sm text-gray-500">No hay contactos sincronizados.</div>
        ) : (
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="py-1 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-200 rounded px-2 group"
              >
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => onSelect(contact, 'contact')}
                >
                  {contact.name || contact.number}
                </span>
                <button
                  className="ml-2 p-1 rounded hover:bg-red-100 text-red-500 opacity-70 group-hover:opacity-100 transition"
                  title="Eliminar contacto"
                  onClick={() => {
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
      <div>
        <h3 className="font-semibold mb-2">Grupos</h3>
        {groups.length === 0 ? (
          <div className="text-sm text-gray-500">No hay grupos sincronizados.</div>
        ) : (
          <ul>
            {groups.map((group) => (
              <li
                key={group.id}
                className="py-1 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-200 rounded px-2 group"
              >
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => onSelect(group, 'group')}
                >
                  {group.name || group.number}
                </span>
                <button
                  className="ml-2 p-1 rounded hover:bg-red-100 text-red-500 opacity-70 group-hover:opacity-100 transition"
                  title="Eliminar grupo"
                  onClick={() => {
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
    </div>
  );
};

export default SyncedSidebar; 
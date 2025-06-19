import { useState } from 'react';
import { Search, ChevronDown, Check as CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/*interface Contact {
  id: string;
  name: string;
  selected: boolean;
}*/

interface ContactsModalProps {
  contactsFilter: string;
  setContactsFilter: (filter: string) => void;
}

export default function ContactsModal({ contactsFilter, setContactsFilter }: ContactsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Datos de ejemplo para contactos
  const demoContacts = [
    { id: '1', name: 'Juan Pérez', selected: false },
    { id: '2', name: 'María López', selected: true },
    { id: '3', name: 'Carlos Rodríguez', selected: false },
    { id: '4', name: 'Ana Martínez', selected: false },
    { id: '5', name: 'Luis Sánchez', selected: true },
    { id: '6', name: 'Elena Gómez', selected: false }
  ];
  
  // Filtramos los contactos según la búsqueda
  const filteredContacts = demoContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Función para alternar la selección de un contacto
  const toggleContactSelection = (contactId: string) => {
    // Aquí iría la lógica para cambiar el estado del contacto seleccionado
    console.log(`Contacto ${contactId} seleccionado`);
  };
  
  return (
    <>
      {/* Dropdown para filtrar contactos */}
      <div className="relative mb-4">
        <select
          value={contactsFilter}
          onChange={(e) => setContactsFilter(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md h-10 px-3 py-2 text-sm appearance-none pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          style={{
            colorScheme: "light dark"
          }}
        >
          <option value="all" className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Todos tus contactos</option>
          <option value="selected" className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Solo los seleccionados</option>
        </select>
        <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </div>
      </div>

      <div className="rounded-md border border-gray-300 dark:border-gray-600 p-4 h-[250px] overflow-y-auto bg-white dark:bg-gray-700">
        {contactsFilter === "all" ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Se escucharán mensajes de todos tus contactos
          </p>
        ) : (
          <>
            {/* Campo de búsqueda para contactos */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm h-9 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Lista de contactos filtrada */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Selecciona los contactos que deseas escuchar
            </p>
            
            <div className="space-y-2">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    onClick={() => toggleContactSelection(contact.id)}
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{contact.name}</span>
                    <div className={cn(
                      "w-4 h-4 border rounded-sm flex items-center justify-center",
                      "border-gray-400 dark:border-gray-500",
                      contact.selected && "bg-green-600"
                    )}>
                      {contact.selected && <CheckIcon size={12} className="text-white" />}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No se encontraron contactos
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
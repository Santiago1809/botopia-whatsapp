import { useState } from 'react';
import { Search, Check as CheckIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/*interface Group {
  id: string;
  name: string;
  selected: boolean;
}*/

interface GroupsModalProps {
  groupsFilter: string;
  setGroupsFilter: (filter: string) => void;
}

export default function GroupsModal({ groupsFilter, setGroupsFilter }: GroupsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Datos de ejemplo para grupos
  const demoGroups = [
    { id: '1', name: 'Familia', selected: false },
    { id: '2', name: 'Trabajo', selected: true },
    { id: '3', name: 'Amigos', selected: false },
    { id: '4', name: 'Proyecto XYZ', selected: true }
  ];
  
  // Filtramos los grupos según la búsqueda
  const filteredGroups = demoGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Función para alternar la selección de un grupo
  const toggleGroupSelection = (groupId: string) => {
    // Aquí iría la lógica para cambiar el estado del grupo seleccionado
    console.log(`Grupo ${groupId} seleccionado`);
  };
  
  return (
    <>
      {/* Dropdown para filtrar grupos */}
      <div className="relative mb-4">
        <select
          value={groupsFilter}
          onChange={(e) => setGroupsFilter(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md h-10 px-3 py-2 text-sm appearance-none pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          style={{
            colorScheme: "light dark"
          }}
        >
          <option value="all" className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Todos tus grupos</option>
          <option value="selected" className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Solo los seleccionados</option>
        </select>
        <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </div>
      </div>

      <div className="rounded-md border border-gray-300 dark:border-gray-600 p-4 h-[250px] overflow-y-auto bg-white dark:bg-gray-700">
        {groupsFilter === "all" ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Se escucharán mensajes de todos tus grupos
          </p>
        ) : (
          <>
            {/* Campo de búsqueda para grupos */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm h-9 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {/* Lista de grupos filtrada */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Selecciona los grupos que deseas escuchar
            </p>
            
            <div className="space-y-2">
              {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                  <div 
                    key={group.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    onClick={() => toggleGroupSelection(group.id)}
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{group.name}</span>
                    <div className={cn(
                      "w-4 h-4 border rounded-sm flex items-center justify-center",
                      "border-gray-400 dark:border-gray-500",
                      group.selected && "bg-green-600"
                    )}>
                      {group.selected && <CheckIcon size={12} className="text-white" />}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No se encontraron grupos
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
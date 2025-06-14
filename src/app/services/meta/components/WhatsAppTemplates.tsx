"use client";

import { MessagesSquare, Plus, Filter } from "lucide-react";
import { useState } from "react";

export default function WhatsAppTemplatesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const templates = [
    {
      id: 1,
      name: "Confirmación de pedido",
      status: "Aprobado",
      category: "Confirmación",
      lastModified: "12 junio 2025",
    },
    {
      id: 2,
      name: "Recordatorio de cita",
      status: "Aprobado",
      category: "Recordatorio",
      lastModified: "10 junio 2025",
    },
    {
      id: 3,
      name: "Promoción especial",
      status: "En revisión",
      category: "Marketing",
      lastModified: "8 junio 2025",
    },
    {
      id: 4,
      name: "Soporte técnico",
      status: "Aprobado",
      category: "Servicio al cliente",
      lastModified: "5 junio 2025",
    },
    {
      id: 5,
      name: "Encuesta de satisfacción",
      status: "En revisión",
      category: "Marketing",
      lastModified: "3 junio 2025",
    },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "approved" && template.status === "Aprobado") ||
                         (filterStatus === "pending" && template.status === "En revisión");
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Plantillas de WhatsApp
        </h1>
        <p className="text-gray-500">
          Gestiona tus plantillas de mensajes para WhatsApp Business
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto max-w-sm">
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-sm w-full"
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobados</option>
              <option value="pending">En revisión</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <Plus className="h-4 w-4 mr-1.5" />
            Crear plantilla
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden border border-gray-100 rounded-xl hover:shadow-md transition-all">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Última Modificación</th>
                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <tr key={template.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center">
                      <MessagesSquare className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="font-medium text-gray-900">{template.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{template.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.status === "Aprobado" 
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {template.lastModified}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                          Ver
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 font-medium ml-3">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron plantillas que coincidan con tu búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Crear nueva plantilla</h2>
        
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la plantilla
              </label>
              <input
                type="text"
                id="template-name"
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ej. Confirmación de reserva"
              />
            </div>
            
            <div>
              <label htmlFor="template-category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="template-category"
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none"
              >
                <option>Marketing</option>
                <option>Confirmación</option>
                <option>Recordatorio</option>
                <option>Servicio al cliente</option>
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="template-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido
              </label>
              <textarea
                id="template-content"
                rows={4}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Escribe el contenido de tu plantilla aquí..."
              ></textarea>
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <InfoIcon className="h-4 w-4 mr-1 text-blue-500" />
                Usa {"{{1}}"} para variables. Ejemplo: Hola {"{{1}}"}, tu cita está confirmada para {"{{2}}"}.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Enviar para aprobación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

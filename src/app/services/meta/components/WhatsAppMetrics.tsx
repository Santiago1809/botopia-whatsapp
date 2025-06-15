"use client";

import { BarChart2, LineChart, PieChart } from "lucide-react";

export default function WhatsAppMetricsSection() {
  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Métricas de WhatsApp
        </h1>
        <p className="text-gray-500">
          Analiza el rendimiento y estadísticas de tus mensajes de WhatsApp
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        {[
          { 
            name: "Mensajes enviados", 
            value: "2,430", 
            change: "+10.5%", 
            isPositive: true,
            icon: <BarChart2 className="h-6 w-6 text-blue-500" />
          },
          { 
            name: "Tasa de entrega", 
            value: "98.2%", 
            change: "+0.3%", 
            isPositive: true,
            icon: <LineChart className="h-6 w-6 text-green-500" />
          },
          { 
            name: "Tasa de respuesta", 
            value: "67.4%", 
            change: "+4.2%", 
            isPositive: true,
            icon: <PieChart className="h-6 w-6 text-purple-500" />
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                {stat.icon}
                <span className={`text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${
                  stat.isPositive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {stat.change}
                </span>
              </div>
              <h2 className="text-sm text-gray-500 font-medium">{stat.name}</h2>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-all overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
            Mensajes por día
          </h2>
          <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
            <div className="w-full h-full p-4">
              {/* Representación visual de un gráfico */}
              <div className="relative h-full">
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-between h-[85%]">
                  {Array(7).fill(null).map((_, i) => (
                    <div key={i} className="w-1/8 px-2 flex flex-col items-center">
                      <div 
                        className={`w-full ${i === 3 ? 'bg-blue-500' : 'bg-blue-300'} rounded-t-md`} 
                        style={{ height: `${30 + Math.random() * 50}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">L{i+1}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-400">
                  <span>2,500</span>
                  <span>Mensajes</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Ver detalles completos
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <LineChart className="h-5 w-5 mr-2 text-blue-500" />
              Rendimiento de plantillas
            </h2>
            <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
              {/* Representación visual de un gráfico de rendimiento de plantillas */}
              <div className="w-full h-full p-4">
                <div className="flex justify-between h-full flex-col">
                  <div className="space-y-4 flex-1">
                    {["Confirmación de pedido", "Recordatorio de cita", "Promoción especial"].map((template, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex-1 mr-4">
                          <div className="text-sm font-medium text-gray-700">{template}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-yellow-500'} h-2 rounded-full`} 
                              style={{ width: `${95 - i * 15}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{`${95 - i * 15}%`}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
                    Tasa de entrega por plantilla
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-500" />
              Distribución de estados
            </h2>
            <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
              {/* Representación visual de un gráfico circular */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="2"
                    strokeDasharray="75, 100"
                    strokeDashoffset="25"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="20, 100"
                    strokeDashoffset="0"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="5, 100"
                    strokeDashoffset="-95"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-700">2,430</span>
                </div>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Entregados (75%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Leídos (20%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-sm text-gray-600">Fallidos (5%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

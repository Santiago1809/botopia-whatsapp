"use client";

import { 
   CheckCircle, 
  Clock, 
  MessageCircleMore, 
  BadgeCheck,
  TrendingUp 
} from "lucide-react";

export default function OverviewSection() {
  const stats = [
    { 
      name: "WhatsApp Templates", 
      value: "12", 
      status: "Aprobados", 
      icon: <BadgeCheck className="h-8 w-8 text-green-500" />,
      color: "bg-green-50"
    },
    { 
      name: "Mensajes Enviados (30d)", 
      value: "2,430", 
      status: "Activo", 
      icon: <MessageCircleMore className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50"
    },
    { 
      name: "Tasa de Entrega", 
      value: "98.2%", 
      status: "Saludable", 
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      color: "bg-green-50"
    },
  ];

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Panel de Meta Business API
        </h1>
        <p className="text-gray-500">
          Controla y gestiona tus integraciones con las plataformas de Meta desde un único lugar
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`${stat.color} overflow-hidden shadow-sm border border-gray-100 rounded-xl transition-all hover:shadow-md`}
          >
            <div className="px-6 py-5">
              <div className="flex items-center mb-3">
                {stat.icon}
                <span className={`ml-3 text-sm font-medium px-2 py-1 rounded-full bg-opacity-50 ${
                  stat.status === "Aprobados" ? "bg-green-100 text-green-800" :
                  stat.status === "Activo" ? "bg-blue-100 text-blue-800" : 
                  "bg-green-100 text-green-800"
                }`}>
                  {stat.status}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium truncate">
                {stat.name}
              </h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-8 hover:shadow-md transition-all">
        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Estado de la cuenta
            </h2>
            <span className="text-sm font-medium text-gray-500">Último chequeo: hoy</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: "85%" }}></div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-700">85%</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Tu cuenta está verificada y funcionando correctamente. Tienes acceso a todas las funcionalidades de la API de Meta Business.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-all">
        <div className="px-6 py-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Actividad reciente
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Ver todo
            </button>
          </div>
          <ul className="space-y-4">
            {[
              { 
                title: "Nueva plantilla aprobada", 
                time: "Hace 2 días", 
                desc: "Tu plantilla &quot;Confirmación de cita&quot; ha sido aprobada por Meta."
              },
              { 
                title: "Actualización de la API", 
                time: "Hace 3 días", 
                desc: "Meta ha lanzado una actualización para la WhatsApp Business API."
              },
              { 
                title: "Pico en envíos de mensajes", 
                time: "Hace 5 días", 
                desc: "Se detectó un aumento del 27% en los envíos de mensajes."
              }
            ].map((item, idx) => (
              <li key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{item.title}</span>
                  <span className="text-gray-500 text-sm">{item.time}</span>
                </div>
                <p className="mt-1 text-gray-600 text-sm">
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { ServiceCard, ServiceProps } from "@/components/ServiceCard";
import SidebarLayout from "@/components/SidebarLayout";

// Data Layer: Definición de servicios disponibles
const serviceData: ServiceProps[] = [
  {
    title: "WhatsApp",
    description:
      "Automatiza la atención al cliente, marketing y procesos de venta en WhatsApp. Mejora la comunicación con tus clientes de forma eficiente y sin necesidad de código.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
        className="text-green-600"
      >
        <path
          fill="currentColor"
          d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01"
        />
      </svg>
    ),
    iconAlt: "WhatsApp Business Icon",
    actionLabel: "Abrir",
    actionUrl: "/services/whatsapp",
    bgColor: "bg-white",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    isComingSoon: false,
  },
  {
    title: "Flujos de IA",
    description:
      "Crea flujos de trabajo inteligentes utilizando IA para automatizar tareas complejas. Integra modelos de IA sin necesidad de escribir código y mejora la eficiencia de tus procesos.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
      >
        {/* Nodos principales */}
        <circle cx="6" cy="6" r="2.5" fill="currentColor" />
        <circle cx="18" cy="6" r="2.5" fill="currentColor" />
        <circle cx="6" cy="18" r="2.5" fill="currentColor" />
        <circle cx="18" cy="18" r="2.5" fill="currentColor" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        
        {/* Líneas de conexión */}
        <path
          d="M8.5 6h7 M6 8.5v7 M18 8.5v7 M8.5 18h7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Efecto de brillo en nodo central */}
        <circle
          cx="12"
          cy="12"
          r="3.5"
          stroke="currentColor"
          fill="none"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values="3.5;4;3.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    ),
    iconAlt: "IA Flows Icon",
    actionLabel: "Crear",
    actionUrl: "/services/flows",
    bgColor: "bg-white",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    isComingSoon: false,
  },
];

export default function ServicesPage() {
  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Nuestros Productos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Selecciona el producto que deseas utilizar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {serviceData.map((service, index) => (
            <ServiceCard
              key={index}
              actionLabel={service.actionLabel}
              actionUrl={service.actionUrl}
              description={service.description}
              icon={service.icon}
              title={service.title}
              iconAlt={service.iconAlt}
              iconBg={service.iconBg}
              iconColor={service.iconColor}
              isComingSoon={service.isComingSoon}
              bgColor={service.bgColor}
            />
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}

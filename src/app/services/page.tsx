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
        className="text-green-600 dark:text-green-400"
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
    bgColor: "bg-white dark:bg-[#18181b]",
    iconBg: "bg-green-50 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    isComingSoon: false,
  },
  {
    title: "Meta Business Api",
    description:
      "Integra tus aplicaciones con la plataforma de Meta. Utiliza las APIs de Facebook, Instagram y WhatsApp para expandir el alcance de tu negocio y mejorar la experiencia de tus usuarios.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 48 48"
        className="text-blue-600 dark:text-blue-400"
      >
        <path
          fill="currentColor"
          d="M47,29.36l-2.193,1.663L42.62,29.5c0-0.16,0-0.33-0.01-0.5c0-0.16,0-0.33-0.01-0.5 c-0.14-3.94-1.14-8.16-3.14-11.25c-1.54-2.37-3.51-3.5-5.71-3.5c-2.31,0-4.19,1.38-6.27,4.38c-0.06,0.09-0.13,0.18-0.19,0.28 c-0.04,0.05-0.07,0.1-0.11,0.16c-0.1,0.15-0.2,0.3-0.3,0.46c-0.9,1.4-1.84,3.03-2.86,4.83c-0.09,0.17-0.19,0.34-0.28,0.51 c-0.03,0.04-0.06,0.09-0.08,0.13l-0.21,0.37l-1.24,2.19c-2.91,5.15-3.65,6.33-5.1,8.26C14.56,38.71,12.38,40,9.51,40 c-3.4,0-5.56-1.47-6.89-3.69C1.53,34.51,1,32.14,1,29.44l4.97,0.17c0,1.76,0.38,3.1,0.89,3.92C7.52,34.59,8.49,35,9.5,35 c1.29,0,2.49-0.27,4.77-3.43c1.83-2.53,3.99-6.07,5.44-8.3l1.37-2.09l0.29-0.46l0.3-0.45l0.5-0.77c0.76-1.16,1.58-2.39,2.46-3.57 c0.1-0.14,0.2-0.28,0.31-0.42c0.1-0.14,0.21-0.28,0.31-0.41c0.9-1.15,1.85-2.22,2.87-3.1c1.85-1.61,3.84-2.5,5.85-2.5 c3.37,0,6.58,1.95,9.04,5.61c2.51,3.74,3.82,8.4,3.97,13.25c0.01,0.16,0.01,0.33,0.01,0.5C47,29.03,47,29.19,47,29.36z"
        />
        <path
          fill="currentColor"
          d="M4.918,15.456 C7.195,11.951,10.483,9.5,14.253,9.5c2.184,0,4.354,0.645,6.621,2.493c2.479,2.02,5.122,5.346,8.419,10.828l1.182,1.967 c2.854,4.746,4.477,7.187,5.428,8.339C37.125,34.606,37.888,35,39,35c2.82,0,3.617-2.54,3.617-5.501L47,29.362 c0,3.095-0.611,5.369-1.651,7.165C44.345,38.264,42.387,40,39.093,40c-2.048,0-3.862-0.444-5.868-2.333 c-1.542-1.45-3.345-4.026-4.732-6.341l-4.126-6.879c-2.07-3.452-3.969-6.027-5.068-7.192c-1.182-1.254-2.642-2.754-5.067-2.754 c-1.963,0-3.689,1.362-5.084,3.465L4.918,15.456z"
        />
        <path
          fill="currentColor"
          d="M14.25,14.5 c-1.959,0-3.683,1.362-5.075,3.465C7.206,20.937,6,25.363,6,29.614c0,1.753-0.003,3.072,0.5,3.886l-3.84,2.813 C1.574,34.507,1,32.2,1,29.5c0-4.91,1.355-10.091,3.918-14.044C7.192,11.951,10.507,9.5,14.27,9.5L14.25,14.5z"
        />
      </svg>
    ),
    iconAlt: "Meta Developers Icon",
    actionLabel: "Explorar",
    actionUrl: "/services/meta",
    bgColor: "bg-white dark:bg-[#18181b]",
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    isComingSoon: false,
  },
  {
  title: "Tu avatar IA",
  description: "Convierte tus grabaciones con IA y obtén respuestas personalizadas en audio o texto. Transforma tu voz en un asistente inteligente para tu negocio.",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2em"
      height="2em"
      viewBox="0 0 24 24"
      className="text-purple-600 dark:text-purple-400"
    >
      <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.7"/>
      <ellipse cx="12" cy="17" rx="7" ry="4" fill="currentColor" opacity="0.2"/>
      <path
        d="M9 21c0-1.66 2-2.5 3-2.5s3 .84 3 2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M10.5 10.5c.5.5 2.5.5 3 0"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  iconAlt: "Avatar IA Icon",
  actionLabel: "Probar",
  actionUrl: "/services/avatar-ia",
  bgColor: "bg-white dark:bg-[#18181b]",
  iconBg: "bg-purple-50 dark:bg-purple-900/30",
  iconColor: "text-purple-600 dark:text-purple-400"
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
        className="text-secondary dark:text-secondary-light"
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
    actionUrl: "/services/flows/principal",
    bgColor: "bg-white dark:bg-[#18181b]",
    iconBg: "bg-secondary/10 dark:bg-white",
    iconColor: "text-secondary dark:text-secondary-light",
    isComingSoon: false,
  },
  {
    title: "Llamadas con IA",
    description:
      "Automatiza llamadas y conversaciones telefónicas utilizando inteligencia artificial. Ideal para atención al cliente, encuestas, recordatorios y más, con un asistente de voz natural y eficiente.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
        className="text-[#f37021] dark:text-orange-400"
      >
        <path
          fill="currentColor"
          d="M20 15.5c-1.25 0-2.45-.2-3.57-.57c-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21a1.02 1.02 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1c0 9.39 7.61 17 17 17c.55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"
        />
      </svg>
    ),
    iconAlt: "Phone AI Icon",
    actionLabel: "Probar",
    actionUrl: "/services/calls",
    bgColor: "bg-white dark:bg-[#18181b]",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-[#f37021] dark:text-orange-400",
    isComingSoon: true,
  },
  
];

export default function ServicesPage() {
  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-gray-50 dark:bg-[#101014] min-h-screen transition-colors">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Nuestros Productos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Selecciona el producto que deseas utilizar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
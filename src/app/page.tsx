import { ServiceProps } from "@/components/ServiceCard";
import SidebarLayout from "@/components/SidebarLayout";

// Data Layer: Definición de servicios disponibles
const serviceData: ServiceProps[] = [
  {
    title: "WhatsApp Business",
    description:
      "Automatiza la atención al cliente, marketing y procesos de venta en WhatsApp. Mejora la comunicación con tus clientes de forma eficiente y sin necesidad de código.",
    icon: "/services/engagement.png",
    iconAlt: "WhatsApp Business Icon",
    actionLabel: "Abrir",
    actionUrl: "/services/whatsapp-business",
    bgColor: "bg-white",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Flujos de IA",
    description:
      "Proximamente: Potencia tu negocio con soluciones de inteligencia artificial personalizadas. Automatiza procesos complejos y mejora la experiencia de tus clientes.",
    icon: "/services/identity.png",
    iconAlt: "IA Flows Icon",
    actionLabel: "Próximamente",
    actionUrl: "#",
    bgColor: "bg-white",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
];

export default function Home() {
  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            ¡Bienvenido!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Selecciona el servicio que deseas utilizar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {serviceData.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center ${service.iconBg}`}
                  >
                    {service.icon.startsWith("/") ? (
                      <img
                        src={service.icon}
                        alt={service.iconAlt || service.title}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                      />
                    ) : (
                      <div
                        className={`text-2xl sm:text-3xl ${service.iconColor}`}
                      >
                        {service.icon}
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  {service.title}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 h-auto sm:h-24 line-clamp-4 sm:line-clamp-none">
                  {service.description}
                </p>
                <a
                  href={service.actionUrl}
                  className={`block w-full py-2 ${
                    index === 1 ? "bg-gray-500" : "bg-primary"
                  } text-white text-center font-medium rounded-md hover:bg-opacity-90 transition`}
                >
                  {service.actionLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}

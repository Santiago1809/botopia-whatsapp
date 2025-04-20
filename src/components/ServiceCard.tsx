import React from "react";

export interface ServiceProps {
  title: string;
  description: string;
  icon: string;
  iconAlt?: string;
  actionLabel: string;
  actionUrl: string;
  className?: string;
  bgColor?: string;
  iconBg?: string;
  iconColor?: string;
}

export const ServiceCard: React.FC<ServiceProps> = ({
  title,
  description,
  icon,
  iconAlt,
  actionLabel,
  actionUrl,
  className = "",
  bgColor = "bg-white",
  iconBg = "bg-gray-100",
  iconColor = "text-primary",
}) => {
  // Determinar si el servicio está disponible o en modo "próximamente"
  const isComingSoon = actionLabel.toLowerCase().includes("próximamente");

  return (
    <div
      className={`${bgColor} rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
    >
      <div className="p-6 flex flex-col h-full">
        <div
          className={`w-16 h-16 mb-5 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <div className={`text-3xl ${iconColor}`}>
            {icon.startsWith("/") ? (
              <img src={icon} alt={iconAlt || title} className="w-10 h-10" />
            ) : (
              <div className="text-3xl">{icon}</div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6 flex-grow">{description}</p>
        <a
          href={actionUrl}
          className={`block w-full py-2 text-white text-center rounded-md transition ${
            isComingSoon
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
};

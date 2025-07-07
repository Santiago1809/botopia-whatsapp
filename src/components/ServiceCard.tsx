"use client"; // Añadir directiva use client
import React, { ReactNode } from "react";
import Image from "next/image";

export interface ServiceProps {
  title: string;
  description: string;
  icon: string | ReactNode;
  iconAlt?: string;
  actionLabel: string;
  actionUrl: string;
  className?: string;
  bgColor?: string;
  iconBg?: string;
  iconColor?: string;
  isComingSoon?: boolean; // Nueva prop
}

export const ServiceCard: React.FC<ServiceProps> = ({
  title,
  description,
  icon,
  iconAlt,
  actionLabel,
  actionUrl,
  className = "",
  bgColor = "bg-card",
  iconBg = "bg-muted",
  iconColor = "text-primary",
  isComingSoon = false, // Valor por defecto
}) => {
  // Manejador de clic para componentes deshabilitados
  const handleDisabledClick = (e: React.MouseEvent) => {
    if (isComingSoon) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`${bgColor} ${
        isComingSoon ? "cursor-not-allowed opacity-75" : ""
      } rounded-xl shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
      aria-disabled={isComingSoon}
    >
      <div className="p-6 flex flex-col h-full">
        <div
          className={`w-16 h-16 mb-5 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <div className={`text-3xl ${iconColor}`}>
            {typeof icon === "string" && icon.startsWith("/") ? (
              <Image
                src={icon}
                alt={iconAlt || title}
                width={40}
                height={40}
                className="w-10 h-10"
              />
            ) : typeof icon === "string" ? (
              <div className="text-3xl">{icon}</div>
            ) : (
              icon
            )}
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6 flex-grow">
          {description}
        </p>
        <a
          href={isComingSoon ? "#" : actionUrl}
          onClick={handleDisabledClick}
          className={`block w-full py-2 text-center rounded-md transition ${
            isComingSoon
              ? "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          tabIndex={isComingSoon ? -1 : 0}
          aria-disabled={isComingSoon}
        >
          {isComingSoon ? "Próximamente" : actionLabel}
        </a>
      </div>
    </div>
  );
};

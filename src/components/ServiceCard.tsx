"use client";
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
  isComingSoon?: boolean;
}

export const ServiceCard: React.FC<ServiceProps> = ({
  title,
  description,
  icon,
  iconAlt,
  actionLabel,
  actionUrl,
  className = "",
  bgColor = "bg-white dark:bg-[#18181b]",
  iconBg = "bg-gray-100 dark:bg-gray-800/60",
  iconColor = "text-primary dark:text-primary-light",
  isComingSoon = false,
}) => {
  // Manejador de clic para componentes deshabilitados
  const handleDisabledClick = (e: React.MouseEvent) => {
    if (isComingSoon) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`
        ${bgColor}
        ${isComingSoon ? "cursor-not-allowed opacity-75" : ""}
        rounded-xl shadow-sm border border-gray-100 dark:border-gray-800
        overflow-hidden transition-all duration-300 hover:shadow-md
        ${className}
      `}
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
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow">
          {description}
        </p>
        <a
          href={isComingSoon ? "#" : actionUrl}
          onClick={handleDisabledClick}
          className={`
            block w-full py-2 text-white text-center rounded-md transition
            ${isComingSoon
              ? "bg-gray-500 dark:bg-gray-700 cursor-not-allowed pointer-events-none"
              : "bg-primary dark:bg-primary-light hover:bg-primary/90 dark:hover:bg-primary"
            }
          `}
          tabIndex={isComingSoon ? -1 : 0}
          aria-disabled={isComingSoon}
        >
          {isComingSoon ? "Próximamente" : actionLabel}
        </a>
      </div>
    </div>
  );
};

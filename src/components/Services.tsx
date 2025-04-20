import React from "react";
import { ServiceCard, ServiceProps } from "./ServiceCard";

interface ServicesProps {
  services: ServiceProps[];
}

export const Services: React.FC<ServicesProps> = ({ services }) => {
  return (
    <section id="servicios" className="py-16 bg-tertiary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-secondary mb-12 text-center">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {services.map((service, index) => {
            // Aplicar clases de bento grid para algunos elementos
            const specialClasses = [];
            if (index === 0) {
              specialClasses.push("md:col-span-2 md:row-span-1");
            }
            if (index === 3) {
              specialClasses.push("lg:col-span-2 lg:row-span-1");
            }

            // Personalizar apariencia según si es "próximamente" o no
            const customProps: Partial<ServiceProps> = {};
            if (service.actionLabel === "Próximamente") {
              customProps.bgColor = "bg-gray-50";
              customProps.iconBg = "bg-secondary/10";
              customProps.iconColor = "text-secondary";
            } else {
              customProps.bgColor = "bg-white";
              customProps.iconBg = "bg-primary/10";
              customProps.iconColor = "text-primary";
            }

            return (
              <ServiceCard
                key={index}
                {...service}
                {...customProps}
                className={specialClasses.join(" ")}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

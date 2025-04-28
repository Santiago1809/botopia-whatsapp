import React from "react";
import CreditsCard from "./CreditCard";

interface FooterProps {
  companyName: string;
}

export const Footer: React.FC<FooterProps> = ({ companyName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} {companyName}. Todos los derechos reservados.
            </p>
          </div>
          <div>
            <CreditsCard />
          </div>
          <div className="flex space-x-4">
            <a
              href="/terminos"
              className="text-sm text-gray-600 hover:text-primary"
            >
              Términos de Servicio
            </a>
            <a
              href="/privacidad"
              className="text-sm text-gray-600 hover:text-primary"
            >
              Política de Privacidad
            </a>
            <a
              href="/soporte"
              className="text-sm text-gray-600 hover:text-primary"
            >
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

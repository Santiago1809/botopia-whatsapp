import React from "react";

interface FooterProps {
  companyName: string;
}

export const Footer: React.FC<FooterProps> = ({ companyName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#18181b] border-t border-gray-200 dark:border-gray-800 py-5.5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              &copy; {currentYear} {companyName}. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="/terminos"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-[#FAECD4]"
            >
              Términos de Servicio
            </a>
            <a
              href="/privacidad"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-[#FAECD4]"
            >
              Política de Privacidad
            </a>
            <a
              href="/soporte"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-[#FAECD4]"
            >
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from "react";

interface FooterProps {
  companyName: string;
}

export const Footer: React.FC<FooterProps> = ({ companyName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-6 dark:bg-card">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {companyName}. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="/terminos"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Términos de Servicio
            </a>
            <a
              href="/privacidad"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Política de Privacidad
            </a>
            <a
              href="/soporte"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

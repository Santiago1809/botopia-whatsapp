"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Layout, 
  Users,
  FileText,
  Settings2,
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";

export function FlowSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItemStyle = (path: string) => {
    return isActive(path)
      ? "w-full flex items-center px-2 py-2 rounded-md hover:bg-primary/10 hover:text-primary bg-secondary text-white"
      : "w-full flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-primary/10 hover:text-primary";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className={`
          fixed z-50 lg:hidden
          ${isOpen 
            ? 'top-5 left-60 landscape:max-lg:left-auto landscape:max-lg:right-165 bg-primary text-white' /* Added bg-primary and text-white */
            : 'top-4 left-4'  /* Móvil vertical */
          }
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="
            h-6 w-6                    /* Móvil vertical */
            landscape:max-lg:h-5 
            landscape:max-lg:w-5       /* Solo móvil horizontal */
            text-white                 /* Added white color */
          " />
        ) : (
          <Menu className="
            h-6 w-6                    /* Móvil vertical */
            landscape:max-lg:h-5 
            landscape:max-lg:w-5       /* Solo móvil horizontal */
          " />
        )}
      </Button>

      {/* Sidebar Container */}
      <div 
        className={`
          fixed left-0 top-0 h-screen bg-background 
          w-80                              /* Aumentado de w-72 a w-80 */
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          landscape:max-lg:overflow-y-auto    /* Solo móvil horizontal - scroll */
          lg:translate-x-0 lg:overflow-y-visible /* Solo desktop - sin scroll */
          z-40 border-r
        `}
      >
        {/* Header */}
        <div className="
          h-[60px] flex items-center px-7 gap-2  /* Móvil vertical */
          pt-3
          landscape:max-lg:mt-0 
          landscape:max-lg:h-[50px]
          landscape:max-lg:pr-16
          landscape:max-lg:pt-4              /* Solo móvil horizontal */
          lg:h-[80px] lg:px-6 lg:gap-4 
          lg:pt-4                           /* Solo desktop */
          sticky top-0 bg-background z-10    /* Mantener header visible */
        ">
          <Button 
            variant="outline"
            className="
              h-8 w-8 p-0                    /* Móvil vertical */
              landscape:max-lg:ml-2 
              landscape:max-lg:h-7           /* Solo móvil horizontal */
              lg:h-10 lg:w-10               /* Solo desktop */
              hover:bg-primary hover:text-white 
              active:bg-primary active:text-white
            "
            asChild
          >
            <Link href="/services/">
              <ArrowLeft className="
                h-6 w-6                      /* Móvil vertical */
                landscape:max-lg:h-5 
                landscape:max-lg:w-5         /* Solo móvil horizontal */
                lg:h-8 lg:w-8               /* Solo desktop */
              " />
            </Link>
          </Button>
          <span className="
            font-semibold text-lg           /* Móvil vertical */
            landscape:max-lg: text-base      /* Solo móvil horizontal */
            lg:text-xl                     /* Solo desktop */
          ">
            Regresar
          </span>
        </div>

        {/* Contenido Scrollable */}
        <div className="
          p-6 space-y-4                    /* Móvil vertical */
          landscape:max-lg:p-4 
          landscape:max-lg:space-y-3       /* Solo móvil horizontal */
          lg:p-6 lg:space-y-4             /* Solo desktop */
        ">
          {/* Secciones del sidebar */}
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4 px-2">
            PRINCIPAL
          </div>

          <Link 
            href="/services/flows/plantillasDD" 
            className={menuItemStyle("/services/flows/plantillasDD")}
          >
            <FileText className="h-6 w-6 mr-4 flex-shrink-0" /> {/* Increased icon size and margin */}
            <div className="flex flex-col">
              <span className="font-medium text-base">Plantillas</span> {/* Increased text size */}
              <span className="text-xs ">Flujos predefinidos</span>
            </div>
          </Link>

          <Link 
            href="/services/flows/principal" 
            className={menuItemStyle("/services/flows/principal")}
          >
            <Layout className="h-6 w-6 mr-4 flex-shrink-0" /> {/* Increased icon size and margin */}
            <div className="flex flex-col">
              <span className="font-medium text-base">Mis Flujos</span> {/* Increased text size */}
              <span className="text-xs ">Flujos personalizados</span>
            </div>
          </Link>

          <Link 
            href="/services/flows/comunidadDD" 
            className={menuItemStyle("/services/flows/comunidadDD")}
          >
            <Users className="h-6 w-6 mr-4 flex-shrink-0" /> {/* Increased icon size and margin */}
            <div className="flex flex-col">
              <span className="font-medium text-base">Comunidad</span> {/* Increased text size */}
              <span className="text-xs">Flujos compartidos</span>
            </div>
          </Link>
        </div>

        {/* Sección de configuración */}
        <div className="
          p-6 space-y-3                    /* Móvil vertical */
          landscape:max-lg:p-4 
          landscape:max-lg:space-y-2 
          landscape:max-lg:pb-16           /* Solo móvil horizontal - padding extra al final */
          lg:p-6 lg:space-y-3             /* Solo desktop */
        ">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4 px-2">
            CONFIGURACIÓN
          </div>
          <Link 
            href="/services/flows/webhooks" 
            className={menuItemStyle("/services/flows/webhooks")}
          >
            <Settings2 className="h-6 w-6 mr-4 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium text-base whitespace-normal break-words">
                Webhooks/automatización
              </span>
              <span className="text-xs">Automatiza acciones</span>
            </div>
          </Link>
          <Link 
            href="/services/flows/documentacionAPI" 
            className={menuItemStyle("/services/flows/documentacionAPI")}
          >
            <FileText className="h-6 w-6 mr-4 flex-shrink-0" /> {/* Increased icon size and margin */}
            <div className="flex flex-col">
              <span className="font-medium text-base">Documentacion API</span> {/* Increased text size */}
              <span className="text-xs ">Para desarrolladores</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
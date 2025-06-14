"use client";

import { FlowSidebar } from "@/components/flows/principal/sidebar";

export default function ProjectsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <FlowSidebar />
      <div className="flex-1 lg:ml-72 w-full">
        <div className="
          px-7 py-12                         /* Móvil vertical */
          landscape:max-lg:px-7 
          landscape:max-lg:py-12             /* Solo móvil horizontal */
          lg:px-14 lg:py-7                /* Solo desktop */
        ">
          {/* Header section */}
          <div className="
            mb-6                            /* Móvil vertical */
            landscape:max-lg:mb-4           /* Solo móvil horizontal */
            lg:mb-12                       /* Solo desktop */
          ">
            <div className="
              space-y-3                     /* Móvil vertical */
              landscape:max-lg:space-y-2    /* Solo móvil horizontal */
              lg:space-y-1.5                 /* Solo desktop */
            ">
              <h1 className="
                text-2xl font-bold          /* Móvil vertical */
                landscape:max-lg:text-xl    /* Solo móvil horizontal */
                lg:text-2xl                /* Solo desktop */
              ">
                Comunidad
              </h1>
              <p className="
                text-sm text-muted-foreground     /* Móvil vertical */
                landscape:max-lg:text-xs          /* Solo móvil horizontal */
                lg:text-ms                      /* Solo desktop */
              ">
                Comparte y navega por los diseños creados por nuestra comunidad.
              </p>
            </div>
          </div>

          {/* Content card */}
          <div className="
            bg-white rounded-lg shadow-sm    /* Estilos base */
            p-4 min-h-[250px]               /* Móvil vertical */
            landscape:max-lg:p-3 
            landscape:max-lg:min-h-[200px]   /* Solo móvil horizontal */
            lg:p-8 lg:min-h-[400px]        /* Solo desktop */
          ">
            <div className="text-center">
              <div className="
                inline-flex items-center justify-center 
                bg-primary/10 rounded-full mb-4
                w-12 h-12                    /* Móvil vertical */
                landscape:max-lg:w-10 
                landscape:max-lg:h-10        /* Solo móvil horizontal */
                lg:w-20 lg:h-20 lg:mb-8     /* Solo desktop */
              ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="
                    text-primary
                    h-6 w-6                  /* Móvil vertical */
                    landscape:max-lg:h-5 
                    landscape:max-lg:w-5     /* Solo móvil horizontal */
                    lg:h-10 lg:w-10         /* Solo desktop */
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="
                font-semibold text-gray-800 mb-2
                text-lg                      /* Móvil vertical */
                landscape:max-lg:text-base   /* Solo móvil horizontal */
                lg:text-3xl lg:mb-4        /* Solo desktop */
              ">
                Próximamente
              </h2>
              <p className="
                text-gray-600 mx-auto
                text-sm max-w-[280px]        /* Móvil vertical */
                landscape:max-lg:text-xs 
                landscape:max-lg:max-w-[240px] /* Solo móvil horizontal */
                lg:text-xl lg:max-w-[600px]   /* Solo desktop */
              ">
                Estamos trabajando en esta funcionalidad. Pronto podrás compartir
                y navegar por los diseños creados por nuestra comunidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
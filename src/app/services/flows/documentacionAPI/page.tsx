"use client";

import { FlowSidebar } from "@/components/flows/principal/sidebar";

export default function ProjectsPage() {
  return (
    <div className="flex h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
      <FlowSidebar />
      <div className="flex-1 lg:ml-72 w-full">
        <div className="
          px-7 py-12
          landscape:max-lg:px-7 
          landscape:max-lg:py-12
          lg:px-14 lg:py-7
        ">
          {/* Header section */}
          <div className="
            mb-6
            landscape:max-lg:mb-4
            lg:mb-12
          ">
            <div className="
              space-y-3
              landscape:max-lg:space-y-2
              lg:space-y-1.5
            ">
              <h1 className="
                text-2xl font-bold text-foreground dark:text-foreground
                landscape:max-lg:text-xl
                lg:text-2xl
              ">
                Documentación API
              </h1>
              <p className="
                text-sm text-muted-foreground dark:text-muted-foreground
                landscape:max-lg:text-xs
                lg:text-ms
              ">
                Recursos técnicos para desarrolladores.
              </p>
            </div>
          </div>

          {/* Content card */}
          <div className="
            bg-card dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm
            p-4 min-h-[250px]
            landscape:max-lg:p-3 
            landscape:max-lg:min-h-[200px]
            lg:p-8 lg:min-h-[400px]
          ">
            <div className="text-center">
              <div className="
                inline-flex items-center justify-center 
                bg-primary/10 rounded-full mb-4
                w-12 h-12
                landscape:max-lg:w-10 
                landscape:max-lg:h-10
                lg:w-20 lg:h-20 lg:mb-8
              ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="
                    text-primary
                    h-6 w-6
                    landscape:max-lg:h-5 
                    landscape:max-lg:w-5
                    lg:h-10 lg:w-10
                  "
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h2 className="
                font-semibold text-foreground dark:text-foreground mb-2
                text-lg
                landscape:max-lg:text-base
                lg:text-3xl lg:mb-4
              ">
                Documentación en desarrollo
              </h2>
              <p className="
                text-muted-foreground dark:text-muted-foreground mx-auto
                text-sm max-w-[280px]
                landscape:max-lg:text-xs 
                landscape:max-lg:max-w-[240px]
                lg:text-xl lg:max-w-[600px]
              ">
                Estamos trabajando en una completa documentación técnica para desarrolladores
                que deseen integrar o extender las funcionalidades de la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
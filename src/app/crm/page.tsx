import SidebarLayout from "@/components/SidebarLayout";

export default function CrmPage() {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">
              CRM
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground mt-2">
              Gestiona las relaciones con tus clientes
            </p>
          </div>

          <div className="bg-card dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">
                Próximamente
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
                Estamos trabajando en esta funcionalidad. Pronto podrás gestionar
                y dar seguimiento a tus clientes, oportunidades de venta e
                interacciones desde aquí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
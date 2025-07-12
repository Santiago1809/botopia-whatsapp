import SidebarLayout from "@/components/SidebarLayout";

export default function ProfilePage() {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">
              Mi Perfil
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground mt-2">
              Gestiona tu información personal
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">
                Próximamente
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
                Estamos trabajando en esta funcionalidad. Pronto podrás gestionar
                tu perfil y configurar tus preferencias desde aquí.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

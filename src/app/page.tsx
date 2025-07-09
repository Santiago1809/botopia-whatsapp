import SidebarLayout from "@/components/SidebarLayout";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <SidebarLayout>
      <div className="flex flex-col min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <div className="text-center max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground mb-4">
              ¡Bienvenido a Botopia!
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground dark:text-muted-foreground mt-2">
              Selecciona una opción para empezar
            </p>
            <div className="mt-8 text-sm text-muted-foreground dark:text-muted-foreground">
              Utiliza el menú lateral para navegar entre las distintas secciones
              de la aplicación.
            </div>
          </div>
        </div>
        <Footer companyName="Botopia" />
      </div>
    </SidebarLayout>
  );
}

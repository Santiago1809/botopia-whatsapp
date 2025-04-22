import SidebarLayout from "@/components/SidebarLayout";

export default function Home() {
  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            ¡Bienvenido a Botopia!
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mt-2">
            Selecciona una opción para empezar
          </p>
          <div className="mt-8 text-sm text-gray-500">
            Utiliza el menú lateral para navegar entre las distintas secciones
            de la aplicación.
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

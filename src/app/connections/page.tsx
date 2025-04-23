import SidebarLayout from "@/components/SidebarLayout";

export default function ConnectionsPage() {
  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Conexiones
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Administra tus conexiones y servicios integrados
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Próximamente
            </h2>
            <p className="text-gray-600 max-w-md">
              Estamos desarrollando esta funcionalidad. Pronto podrás
              administrar tus conexiones e integraciones con otros servicios
              desde aquí.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

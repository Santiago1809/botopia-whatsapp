import SidebarLayout from "@/components/SidebarLayout";

export default function MembersPage() {
  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Miembros y Roles
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestiona usuarios y permisos de tu organización
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Próximamente
            </h2>
            <p className="text-gray-600 max-w-md">
              Estamos trabajando en esta funcionalidad. Pronto podrás gestionar
              a los miembros de tu equipo, asignar roles y configurar permisos
              específicos para cada usuario.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

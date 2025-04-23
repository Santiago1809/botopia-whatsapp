import SidebarLayout from "@/components/SidebarLayout";

export default function BillingPage() {
  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Facturación
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestiona tus planes y métodos de pago
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Próximamente
            </h2>
            <p className="text-gray-600 max-w-md">
              Estamos trabajando en esta funcionalidad. Pronto podrás gestionar
              tu facturación, ver el historial de pagos y actualizar tu plan
              desde aquí.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

"use client";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Servicio Temporalmente No Disponible
          </h1>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Nuestros proveedores de infraestructura están experimentando
            problemas técnicos. Estamos trabajando para resolver la situación lo
            antes posible.
          </p>

          <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
            <span className="mr-2">🕐</span>
            <span>Tiempo estimado de resolución: 2-4 horas</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              ¿Qué está pasando?
            </h3>
            <p className="text-sm text-gray-600">
              Nuestros proveedores de infraestructura están experimentando
              interrupciones que afectan la disponibilidad del servicio.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              ¿Qué puedes hacer?
            </h3>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li>• Intenta acceder más tarde</li>
              <li>• Guarda esta página en marcadores</li>
              <li>• Contacta soporte si es urgente</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">🔄</span>
            Intentar de nuevo
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>Botopia - Disculpa las molestias</p>
          <p className="mt-1">
            Estado actualizado: {new Date().toLocaleString("es-ES")}
          </p>
        </div>
      </div>
    </div>
  );
}

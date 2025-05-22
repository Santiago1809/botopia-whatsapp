import React from 'react';

export default function IAWarning() {
  return (
    <div className="max-w-xl mx-auto my-6 rounded-lg shadow-lg border border-purple-200 bg-white">
      {/* Encabezado */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-700 to-purple-500 px-6 py-3 rounded-t-lg">
        <span className="text-white font-bold text-xl tracking-wide">BOTOPIA</span>
        <span className="text-yellow-300 text-3xl ml-2">⚠️</span>
      </div>
      {/* Body */}
      <div className="px-6 py-5 flex items-center bg-yellow-50">
        <span className="text-red-700 font-semibold text-lg leading-snug">
          La <span className="font-bold">IA</span> ha sido <span className="font-bold">desactivada</span> para este contacto.<br />
          <span className="font-normal text-base text-gray-700">
            Si deseas que la IA siga respondiendo a este cliente, recuerda volver a activarla manualmente.
          </span>
        </span>
      </div>
      {/* Footer */}
      <div className="px-6 py-2 bg-purple-50 rounded-b-lg text-right">
        <span className="text-purple-700 text-sm font-medium">Equipo Botopia</span>
      </div>
    </div>
  );
} 
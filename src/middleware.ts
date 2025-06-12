import { NextResponse } from "next/server";

// Middleware desactivado - El servicio ha vuelto a la normalidad
export function middleware() {
  // Permitir todas las rutas normalmente
  return NextResponse.next();
}

// Configuración mínima para el middleware
export const config = {
  matcher: [],
};

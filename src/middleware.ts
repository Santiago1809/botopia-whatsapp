import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware desactivado - El servicio ha vuelto a la normalidad
export function middleware(request: NextRequest) {
  // Permitir todas las rutas normalmente
  return NextResponse.next();
}

// Configuración mínima para el middleware
export const config = {
  matcher: [],
};

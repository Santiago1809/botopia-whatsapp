import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Si ya estamos en la página de mantenimiento, no redirigir
  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.next()
  }

  // Permitir recursos estáticos (CSS, JS, imágenes, etc.)
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.') // archivos con extensión
  ) {
    return NextResponse.next()
  }

  // Redirigir todas las demás rutas a la página de mantenimiento
  return NextResponse.redirect(new URL('/maintenance', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

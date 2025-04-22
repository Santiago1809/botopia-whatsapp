"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import { Footer } from "./Footer";
import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Webhook } from "lucide-react";

interface SidebarLayoutProps {
  children: ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verificar si el usuario está autenticado y tiene el rol de usuario
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Si no está autenticado o está cargando, no mostrar el contenido
  if (!isAuthenticated) {
    return null; // O un spinner de carga
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Función para determinar si una ruta está activa
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    // Para otras rutas, verificamos si el pathname comienza con la ruta
    return pathname?.startsWith(path);
  };

  // Estilo común para los elementos del menú
  const menuItemStyle = (path: string) => {
    return isActive(path)
      ? "flex items-center px-2 py-2 rounded-md hover:bg-primary/10 hover:text-primary bg-secondary text-white"
      : "flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-primary/10 hover:text-primary";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-72 sm:w-60 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Botopia Logo"
              width={100}
              height={30}
              className="mr-2"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-5 overflow-y-auto">
          <ul className="space-y-2">
            <li className="mb-6">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Principal
              </span>
            </li>
            <li>
              <Link
                href="/"
                className={menuItemStyle("/")}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Inicio</span>
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className={menuItemStyle("/services")}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Webhook className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">Productos</span>
              </Link>
            </li>

            <li className="mt-8 mb-6">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Configuración
              </span>
            </li>
            <li>
              <Link
                href="/profile"
                className={menuItemStyle("/profile")}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Mi Perfil</span>
              </Link>
            </li>
            <li>
              <Link
                href="/connections"
                className={menuItemStyle("/connections")}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
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
                <span>Conexiones</span>
              </Link>
            </li>
            <li>
              <Link
                href="/billing"
                className={menuItemStyle("/billing")}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
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
                <span>Facturación</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center font-semibold">
                {user?.username?.charAt(0) || "U"}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.username || "Usuario"}
                </p>
                <p className="text-xs text-gray-500">
                  Rol: {user?.role || "usuario"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-red-600 flex-shrink-0"
              title="Cerrar sesión"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-60 w-full flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Botopia Logo"
              width={80}
              height={24}
              className="mr-2"
            />
          </div>
          <div className="w-6"></div>{" "}
          {/* Spacer para mantener centrado el logo */}
        </header>

        <main className="flex-grow flex flex-col">{children}</main>
        <Footer companyName="Botopia" />
      </div>
    </div>
  );
};

export default SidebarLayout;

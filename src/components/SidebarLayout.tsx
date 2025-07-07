"use client";

import { useAuth } from "@/lib/auth";
import { Webhook } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Footer } from "./Footer";
import { ThemeToggle } from "./ThemeToggle";

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
      ? "flex items-center px-2 py-2 rounded-md hover:bg-primary/10 hover:text-primary bg-gradient-to-r from-primary to-secondary text-white"
      : "flex items-center px-2 py-2 text-foreground rounded-md hover:bg-primary/10 hover:text-primary";
  };

  return (
    <div className="flex h-full bg-background dark:bg-background">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out w-60 bg-card dark:bg-sidebar border-r border-border z-30 flex flex-col h-full`}
      >
        {/* Logo y nombre */}
        <div className="flex items-center justify-between px-4 py-3 text-foreground lg:mt-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Logo.png" alt="Botopia Logo" width={32} height={32} />
            <span className="font-bold text-lg">Botopia</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-foreground hover:text-primary transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-5 overflow-y-auto">
          <ul className="space-y-2">
            <li className="mb-6">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
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
            <li>
              <Link
                href="/crm"
                className={menuItemStyle("/crm")}
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="line-clamp-1">CRM</span>
              </Link>
            </li>
            <li>
              <Link
                href="/members"
                className={menuItemStyle("/members")}
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="line-clamp-1">Miembros y Roles</span>
              </Link>
            </li>
            <li className="mt-8 mb-6">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
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
            <li>
              <div className="px-2 py-2">
                <ThemeToggle />
              </div>
            </li>
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full text-white flex items-center justify-center font-semibold">
                {user?.username?.charAt(0) || "U"}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.username || "Usuario"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-primary flex-shrink-0 transition-colors duration-200"
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
        <header className="lg:hidden bg-gradient-to-l from-primary to-secondary text-white border-b border-border p-4 sticky top-0 z-10 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none"
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
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/Logo.png"
                alt="Botopia Logo"
                width={32}
                height={32}
              />
              <span className="font-bold text-lg text-white">Botopia</span>
            </Link>
          </div>
          <div className="relative flex items-center">
            <ThemeToggle />
            <button
              className="text-white hover:text-tertiary/80 ml-2"
              onClick={() => router.push("/profile")}
            >
              <div className="w-8 h-8 bg-white rounded-full text-primary flex items-center justify-center font-semibold">
                {user?.username?.charAt(0) || "U"}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-grow flex flex-col">{children}</main>
        <Footer companyName="Botopia" />
      </div>
    </div>
  );
};

export default SidebarLayout;

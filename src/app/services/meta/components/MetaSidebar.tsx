"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Settings,
  FileSpreadsheet,
  BarChart3,
  Users,
  History,
  MessagesSquare,
  BookOpen,
  FileText,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { MetaAppType, appColors } from "./MetaAppTabs";

interface SidebarItemProps {
  icon: ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
  appType?: MetaAppType;
}

interface SidebarCategoryProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarItem({
  icon,
  title,
  isActive,
  onClick,
  appType = "whatsapp",
}: SidebarItemProps) {
  const colors = appColors[appType];

  return (
    <button
      className={`w-full flex items-center text-left px-3 py-2 rounded-md mb-1.5 text-sm transition-all duration-200 ${
        isActive
          ? `${colors.active} font-medium shadow-sm`
          : `text-gray-700 ${colors.hover} hover:translate-x-1`
      }`}
      onClick={onClick}
    >
      <span className={`mr-2.5 ${isActive ? colors.icon : "text-gray-500"}`}>
        {icon}
      </span>
      {title}
      {isActive && (
        <div
          className={`w-1 ${colors.border} absolute left-0 top-0 bottom-0 rounded-r-md`}
        ></div>
      )}
    </button>
  );
}

export function SidebarCategory({
  title,
  icon,
  children,
  defaultOpen = true,
}: SidebarCategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <h3
        className="px-2 py-1.5 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${
            isOpen ? "" : "transform -rotate-90"
          }`}
        />
      </h3>
      <div
        className={`ml-2 overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

interface MetaSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  appType: MetaAppType;
}

export default function MetaSidebar({
  activeSection,
  setActiveSection,
  appType = "whatsapp",
}: MetaSidebarProps) {
  // Obtener los colores para la app actual
  const colors = appColors[appType]; // Determinar el color del logo según la app
  const logoColorClass = {
    whatsapp: "text-green-600",
    facebook: "text-blue-600",
    instagram:
      "text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]",
    threads: "text-gray-800",
  }[appType];

  // Determinar el color del botón de regresar al hover
  const backButtonHoverClass = {
    whatsapp: "hover:text-green-600",
    facebook: "hover:text-blue-600",
    instagram: "hover:text-[#E4405F]",
    threads: "hover:text-gray-800",
  }[appType];

  // Determinar el color del badge
  const badgeClass = {
    whatsapp: "bg-green-500",
    facebook: "bg-blue-500",
    instagram: "bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]",
    threads: "bg-gray-700",
  }[appType];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full">
      {/* Botón de regresar */}
      <div className="px-5 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link
            href="/services"
            className={`flex items-center gap-14 w-full text-gray-600 ${backButtonHoverClass} transition-colors`}
          >
            <div className="p-1.5 bg-gray-100 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            <span>Regresar</span>
          </Link>
        </div>
      </div>{" "}
      {/* Logo y nombre de Meta */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <Link href="/" className="flex items-center gap-2">
          {appType === "instagram" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 48 48"
              className="overflow-visible"
            >
              <defs>
                <linearGradient
                  id="metaGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F58529" />
                  <stop offset="35%" stopColor="#E4405F" />
                  <stop offset="100%" stopColor="#405DE6" />
                </linearGradient>
              </defs>
              <path
                fill="url(#metaGradient)"
                d="M47,29.36l-2.193,1.663L42.62,29.5c0-0.16,0-0.33-0.01-0.5c0-0.16,0-0.33-0.01-0.5 c-0.14-3.94-1.14-8.16-3.14-11.25c-1.54-2.37-3.51-3.5-5.71-3.5c-2.31,0-4.19,1.38-6.27,4.38c-0.06,0.09-0.13,0.18-0.19,0.28 c-0.04,0.05-0.07,0.1-0.11,0.16c-0.1,0.15-0.2,0.3-0.3,0.46c-0.9,1.4-1.84,3.03-2.86,4.83c-0.09,0.17-0.19,0.34-0.28,0.51 c-0.03,0.04-0.06,0.09-0.08,0.13l-0.21,0.37l-1.24,2.19c-2.91,5.15-3.65,6.33-5.1,8.26C14.56,38.71,12.38,40,9.51,40 c-3.4,0-5.56-1.47-6.89-3.69C1.53,34.51,1,32.14,1,29.44l4.97,0.17c0,1.76,0.38,3.1,0.89,3.92C7.52,34.59,8.49,35,9.5,35 c1.29,0,2.49-0.27,4.77-3.43c1.83-2.53,3.99-6.07,5.44-8.3l1.37-2.09l0.29-0.46l0.3-0.45l0.5-0.77c0.76-1.16,1.58-2.39,2.46-3.57 c0.1-0.14,0.2-0.28,0.31-0.42c0.1-0.14,0.21-0.28,0.31-0.41c0.9-1.15,1.85-2.22,2.87-3.1c1.85-1.61,3.84-2.5,5.85-2.5 c3.37,0,6.58,1.95,9.04,5.61c2.51,3.74,3.82,8.4,3.97,13.25c0.01,0.16,0.01,0.33,0.01,0.5C47,29.03,47,29.19,47,29.36z"
              />
              <path
                fill="url(#metaGradient)"
                d="M4.918,15.456 C7.195,11.951,10.483,9.5,14.253,9.5c2.184,0,4.354,0.645,6.621,2.493c2.479,2.02,5.122,5.346,8.419,10.828l1.182,1.967 c2.854,4.746,4.477,7.187,5.428,8.339C37.125,34.606,37.888,35,39,35c2.82,0,3.617-2.54,3.617-5.501L47,29.362 c0,3.095-0.611,5.369-1.651,7.165C44.345,38.264,42.387,40,39.093,40c-2.048,0-3.862-0.444-5.868-2.333 c-1.542-1.45-3.345-4.026-4.732-6.341l-4.126-6.879c-2.07-3.452-3.969-6.027-5.068-7.192c-1.182-1.254-2.642-2.754-5.067-2.754 c-1.963,0-3.689,1.362-5.084,3.465L4.918,15.456z"
              />
              <path
                fill="url(#metaGradient)"
                d="M14.25,14.5 c-1.959,0-3.683,1.362-5.075,3.465C7.206,20.937,6,25.363,6,29.614c0,1.753-0.003,3.072,0.5,3.886l-3.84,2.813 C1.574,34.507,1,32.2,1,29.5c0-4.91,1.355-10.091,3.918-14.044C7.192,11.951,10.507,9.5,14.27,9.5L14.25,14.5z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 48 48"
              className={logoColorClass}
            >
              <path
                fill="currentColor"
                d="M47,29.36l-2.193,1.663L42.62,29.5c0-0.16,0-0.33-0.01-0.5c0-0.16,0-0.33-0.01-0.5 c-0.14-3.94-1.14-8.16-3.14-11.25c-1.54-2.37-3.51-3.5-5.71-3.5c-2.31,0-4.19,1.38-6.27,4.38c-0.06,0.09-0.13,0.18-0.19,0.28 c-0.04,0.05-0.07,0.1-0.11,0.16c-0.1,0.15-0.2,0.3-0.3,0.46c-0.9,1.4-1.84,3.03-2.86,4.83c-0.09,0.17-0.19,0.34-0.28,0.51 c-0.03,0.04-0.06,0.09-0.08,0.13l-0.21,0.37l-1.24,2.19c-2.91,5.15-3.65,6.33-5.1,8.26C14.56,38.71,12.38,40,9.51,40 c-3.4,0-5.56-1.47-6.89-3.69C1.53,34.51,1,32.14,1,29.44l4.97,0.17c0,1.76,0.38,3.1,0.89,3.92C7.52,34.59,8.49,35,9.5,35 c1.29,0,2.49-0.27,4.77-3.43c1.83-2.53,3.99-6.07,5.44-8.3l1.37-2.09l0.29-0.46l0.3-0.45l0.5-0.77c0.76-1.16,1.58-2.39,2.46-3.57 c0.1-0.14,0.2-0.28,0.31-0.42c0.1-0.14,0.21-0.28,0.31-0.41c0.9-1.15,1.85-2.22,2.87-3.1c1.85-1.61,3.84-2.5,5.85-2.5 c3.37,0,6.58,1.95,9.04,5.61c2.51,3.74,3.82,8.4,3.97,13.25c0.01,0.16,0.01,0.33,0.01,0.5C47,29.03,47,29.19,47,29.36z"
              />
              <path
                fill="currentColor"
                d="M4.918,15.456 C7.195,11.951,10.483,9.5,14.253,9.5c2.184,0,4.354,0.645,6.621,2.493c2.479,2.02,5.122,5.346,8.419,10.828l1.182,1.967 c2.854,4.746,4.477,7.187,5.428,8.339C37.125,34.606,37.888,35,39,35c2.82,0,3.617-2.54,3.617-5.501L47,29.362 c0,3.095-0.611,5.369-1.651,7.165C44.345,38.264,42.387,40,39.093,40c-2.048,0-3.862-0.444-5.868-2.333 c-1.542-1.45-3.345-4.026-4.732-6.341l-4.126-6.879c-2.07-3.452-3.969-6.027-5.068-7.192c-1.182-1.254-2.642-2.754-5.067-2.754 c-1.963,0-3.689,1.362-5.084,3.465L4.918,15.456z"
              />
              <path
                fill="currentColor"
                d="M14.25,14.5 c-1.959,0-3.683,1.362-5.075,3.465C7.206,20.937,6,25.363,6,29.614c0,1.753-0.003,3.072,0.5,3.886l-3.84,2.813 C1.574,34.507,1,32.2,1,29.5c0-4.91,1.355-10.091,3.918-14.044C7.192,11.951,10.507,9.5,14.27,9.5L14.25,14.5z"
              />
            </svg>
          )}{" "}
          <span
            className={
              appType === "instagram"
                ? "font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#F58529] via-[#E4405F] to-[#405DE6]"
                : "font-bold text-lg text-black"
            }
          >
            Meta Business API
          </span>
        </Link>
      </div>
      <nav className="p-3 flex-1 flex flex-col h-full">
        <div className="space-y-1 flex-grow">
          {" "}
          <SidebarItem
            icon={<MessageSquare className="h-4.5 w-4.5" />}
            title="Mensajes Salientes"
            isActive={activeSection === "outbound"}
            onClick={() => setActiveSection("outbound")}
            appType={appType}
          />
          <div className="relative">
            {" "}
            <SidebarItem
              icon={<FileSpreadsheet className="h-4.5 w-4.5" />}
              title="Flujos WA (formularios)"
              isActive={activeSection === "wa-flows"}
              onClick={() => setActiveSection("wa-flows")}
              appType={appType}
            />
            <span
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${badgeClass} text-white text-xs px-1 py-0.5 rounded text-[8px] font-medium`}
            >
              BETA
            </span>
          </div>{" "}
          <SidebarItem
            icon={<BarChart3 className="h-4.5 w-4.5" />}
            title="Campañas"
            isActive={activeSection === "campaigns"}
            onClick={() => setActiveSection("campaigns")}
            appType={appType}
          />{" "}
          <SidebarItem
            icon={<Users className="h-4.5 w-4.5" />}
            title="Contactos"
            isActive={activeSection === "contacts"}
            onClick={() => setActiveSection("contacts")}
            appType={appType}
          />{" "}
          <SidebarItem
            icon={<History className="h-4.5 w-4.5" />}
            title="Historial del Chatbot"
            isActive={activeSection === "chatbot-history"}
            onClick={() => setActiveSection("chatbot-history")}
            appType={appType}
          />{" "}
          <SidebarItem
            icon={<MessagesSquare className="h-4.5 w-4.5" />}
            title="Chats"
            isActive={activeSection === "chats"}
            onClick={() => setActiveSection("chats")}
            appType={appType}
          />
        </div>
        <div className="border-t border-gray-200 my-2 pt-2">
          {" "}
          <SidebarItem
            icon={<Settings className="h-4.5 w-4.5" />}
            title="Configuración"
            isActive={activeSection === "settings"}
            onClick={() => setActiveSection("settings")}
            appType={appType}
          />
          <div className="relative">
            {" "}
            <SidebarItem
              icon={<BookOpen className="h-4.5 w-4.5" />}
              title="Documentación"
              isActive={activeSection === "docs"}
              onClick={() => setActiveSection("docs")}
              appType={appType}
            />
            <ExternalLink className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          </div>{" "}
          <div className="relative">
            {" "}
            <SidebarItem
              icon={<FileText className="h-4.5 w-4.5" />}
              title="Registro de Cambios"
              isActive={activeSection === "changelog"}
              onClick={() => setActiveSection("changelog")}
              appType={appType}
            />
            <ExternalLink className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          </div>
        </div>{" "}
        {/* Otras Apps */}
        <div className="border-t border-gray-200 my-2 pt-2">
          {" "}
          <h3 className="px-2 py-1.5 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Otras Apps
          </h3>{" "}
          <div className="relative">
            {" "}
            <SidebarItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.2em"
                  height="1.2em"
                  viewBox="0 0 24 24"
                  className="text-green-600"
                >
                  <path
                    fill="currentColor"
                    d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01"
                  />
                </svg>
              }
              title="Pagos WhatsApp"
              isActive={false}
              onClick={() => window.open("/services/whatsapp", "_blank")}
              appType={appType}
            />
            <ExternalLink className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />{" "}
          </div>
          <div className="relative">
            <SidebarItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.2em"
                  height="1.2em"
                  viewBox="0 0 24 24"
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="instagramSidebarGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#F58529" />
                      <stop offset="35%" stopColor="#E4405F" />
                      <stop offset="100%" stopColor="#405DE6" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#instagramSidebarGradient)"
                    d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3Z"
                  />
                </svg>
              }
              title="Instagram"
              isActive={false}
              onClick={() => window.open("/services/instagram", "_blank")}
              appType={appType}
            />
            <ExternalLink className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          </div>
          <div className="relative">
            <SidebarItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.2em"
                  height="1.2em"
                  viewBox="0 0 24 24"
                  className="text-[#f37021]"
                >
                  <path
                    fill="currentColor"
                    d="M20 15.5c-1.25 0-2.45-.2-3.57-.57c-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21a1.02 1.02 0 0 0 .24-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1c0 9.39 7.61 17 17 17c.55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"
                  />
                </svg>
              }
              title="Llamadas con IA"
              isActive={false}
              onClick={() => window.open("/services/ai-calls", "_blank")}
              appType={appType}
            />
            <span
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${badgeClass} text-white text-xs px-1 py-0.5 rounded text-[8px] font-medium`}
            >
              BETA
            </span>
          </div>
        </div>{" "}
        {/* Sección de usuario */}
        <div className="mt-auto pt-3 border-t border-gray-200">
          <div className="flex items-center px-3 py-2">
            <div
              className={`w-8 h-8 rounded-full ${colors.badge} text-white flex items-center justify-center mr-3`}
            >
              <span className="font-medium text-sm">EB</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Emmanuel Berrio
              </p>
              <p className="text-xs text-gray-500">Plan Básico</p>
            </div>
          </div>
          <div className="px-3 py-1 text-xs text-gray-500">v1.2.0</div>
        </div>
      </nav>
    </aside>
  );
}

"use client";

import { MessageSquare, BarChart3, Table } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface NavigationTabsProps {
  lineId: string;
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const TabButton = ({ isActive, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`py-1 px-1 border-b-2 font-medium text-sm transition-colors ${
      isActive
        ? 'border-white text-white'
        : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
    }`}
  >
    <div className="flex items-center space-x-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  </button>
);

export default function NavigationTabs({ lineId }: NavigationTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determinar qué tab está activo basado en la URL actual
  const getActiveTab = () => {
    if (pathname.includes('/kanban')) return 'kanban';
    if (pathname.includes('/chat')) return 'chat';
    if (pathname.includes('/analytics')) return 'analytics';
    return 'kanban'; // Por defecto Kanban
  };

  const activeTab = getActiveTab();

  return (
    <div className="mt-2 border-b border-white/20">
      <nav className="flex justify-center items-center w-full">
        <div className="flex space-x-8">
          <TabButton
            isActive={activeTab === 'kanban'}
            onClick={() => router.push(`/crm/line-dashboard/${lineId}/kanban`)}
            icon={Table}
            label="Tablero Kanban"
          />
          <TabButton
            isActive={activeTab === 'chat'}
            onClick={() => router.push(`/crm/line-dashboard/${lineId}/chat`)}
            icon={MessageSquare}
            label="Chat Center"
          />
          <TabButton
            isActive={activeTab === 'analytics'}
            onClick={() => router.push(`/crm/line-dashboard/${lineId}/analytics`)}
            icon={BarChart3}
            label="Analytics Pro"
          />
        </div>
      </nav>
    </div>
  );
}

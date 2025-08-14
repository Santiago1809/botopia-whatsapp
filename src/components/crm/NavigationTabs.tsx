"use client";

import { MessageSquare, BarChart3, Table } from "lucide-react";
import type { ViewMode } from "../../types/dashboard";

interface NavigationTabsProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
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
    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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

export default function NavigationTabs({ currentView, onViewChange }: NavigationTabsProps) {
  return (
    <div className="mt-6 border-b border-white/20">
      <nav className="flex justify-center items-center w-full">
        <div className="flex space-x-8">
          <TabButton
            isActive={currentView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
            icon={Table}
            label="Dashboard"
          />
          <TabButton
            isActive={currentView === 'kanban'}
            onClick={() => onViewChange('kanban')}
            icon={Table}
            label="Tablero Kanban"
          />
          <TabButton
            isActive={currentView === 'chat'}
            onClick={() => onViewChange('chat')}
            icon={MessageSquare}
            label="Chat Center"
          />
          <TabButton
            isActive={currentView === 'analytics'}
            onClick={() => onViewChange('analytics')}
            icon={BarChart3}
            label="Analytics Pro"
          />
        </div>
      </nav>
    </div>
  );
}

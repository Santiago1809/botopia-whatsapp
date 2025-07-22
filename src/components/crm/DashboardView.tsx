"use client";

import KanbanBoard from "./KanbanBoard";
import FilterSidebar from "./FilterSidebar";
import StatsOverview from "./StatsOverview";
import type { Contact, AnalyticsStats } from "../../types/dashboard";

interface DashboardViewProps {
  allContacts: Contact[];
  filteredContacts: Contact[];
  selectedTags: string[];
  searchTerm: string;
  analyticsStats: AnalyticsStats;
  lineTags?: string[]; // Etiquetas de la línea desde la base de datos
  onTagToggle: (tag: string) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  onContactStatusChange: (contactId: string, newStatus: string) => void;
  onContactUpdate?: (contactId: string, updates: Partial<Contact>) => void;
  onContactSelect?: (contact: Contact) => void;
  onAddTag: (tag: string) => void;
  onEditTag?: (oldTag: string, newTag: string) => void;
  onDeleteTag?: (tag: string) => void;
}

export default function DashboardView({
  allContacts,
  filteredContacts,
  selectedTags,
  searchTerm,
  analyticsStats,
  lineTags = [], // Default a array vacío
  onTagToggle,
  onSearchChange,
  onClearFilters,
  onContactStatusChange,
  onContactUpdate,
  onContactSelect,
  onAddTag,
  onEditTag,
  onDeleteTag
}: DashboardViewProps) {
  
  // Debug logs
  console.log('🎯 DashboardView - All contacts:', allContacts);
  console.log('🎯 DashboardView - Filtered contacts:', filteredContacts);
  console.log('🎯 DashboardView - Analytics stats:', analyticsStats);
  console.log('🎯 DashboardView - Selected tags:', selectedTags);
  console.log('🎯 DashboardView - Search term:', searchTerm);
  return (
    <div className="flex gap-6">
      {/* Mini Sidebar */}
      <FilterSidebar
        allContacts={allContacts}
        filteredContacts={filteredContacts}
        selectedTags={selectedTags}
        searchTerm={searchTerm}
        lineTags={lineTags}
        onTagToggle={onTagToggle}
        onSearchChange={onSearchChange}
        onClearFilters={onClearFilters}
        onAddTag={onAddTag}
        onEditTag={onEditTag}
        onDeleteTag={onDeleteTag}
      />

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Stats Overview */}
        <StatsOverview analyticsStats={analyticsStats} />

        {/* Kanban Board */}
        <KanbanBoard 
          contacts={filteredContacts}
          onContactStatusChange={onContactStatusChange}
          onContactUpdate={onContactUpdate}
          onContactSelect={onContactSelect}
        />
      </div>
    </div>
  );
}

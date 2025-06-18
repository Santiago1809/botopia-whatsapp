import React from "react";

export interface DraggableNodeProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
  darkBorderColor?: string;
  darkBgColor?: string;
  section?: string;
}

export interface SidebarSectionProps {
  title: string;
  nodes: DraggableNodeProps[];
}
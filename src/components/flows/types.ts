import { ReactNode } from "react";

export interface DraggableNodeProps {
  type: string;
  label: string;
  icon: ReactNode;
  section: string;
  // Hacer estos campos opcionales con valores por defecto
  borderColor?: string;
  bgColor?: string;
  darkBorderColor?: string;
  darkBgColor?: string;
  className?: string;
  onMobileAddNode?: (type: string) => void;
}

export interface SidebarSectionProps {
  title: string;
  nodes: DraggableNodeProps[];
}
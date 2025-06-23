import { ReactNode } from 'react';
import { cn } from "@/lib/utils";
import "@/styles/jarvis-animation.css";

interface ToolbarContainerProps {
  children: ReactNode;
  className?: string;
}

export function ToolbarContainer({ children, className }: ToolbarContainerProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      {/* Contenedor simplificado que solo contiene los botones pasados como children */}
      <div className={cn("flex items-center gap-2 transition-all", className)}>
        {children}
      </div>
    </div>
  );
}
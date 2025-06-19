import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DraggableNodeProps } from "./types";

export function DraggableNode({ 
  type, 
  label, 
  icon, 
  borderColor = "rgba(156, 163, 175, 0.3)", // Valor por defecto
  bgColor = "rgba(255, 255, 255, 0.1)",     // Valor por defecto
  darkBorderColor,
  darkBgColor,
  section,
  className = ""
}: DraggableNodeProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar modo oscuro
  useEffect(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      // Verificar modo oscuro inicial
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeMediaQuery.matches || document.documentElement.classList.contains('dark'));
      
      // Escuchar cambios del tema
      const handleThemeChange = () => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      };
      
      // Observer para detectar cambios en las clases del html
      const observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      
      // Escuchar cambios de preferencia del sistema
      darkModeMediaQuery.addEventListener('change', (e) => {
        setIsDarkMode(e.matches);
      });
      
      return () => {
        observer.disconnect();
        darkModeMediaQuery.removeEventListener('change', (e) => {
          setIsDarkMode(e.matches);
        });
      };
    }
  }, []);

  // Determinar colores basados en el tema
  const activeBorderColor = isDarkMode && darkBorderColor ? darkBorderColor : borderColor;
  
  // Color de fondo basado en la sección y el modo
  let activeBgColor;
  if (isDarkMode) {
    if (section === 'elementos') {
      // Aplicar fondo gris sólo a los elementos de la sección "Elementos" en modo oscuro
      activeBgColor = "rgba(156, 163, 175, 0.1)"; // Gris más claro
    } else {
      // Para otras secciones, usar el darkBgColor si está definido o el bgColor normal
      activeBgColor = darkBgColor || bgColor;
    }
  } else {
    // En modo claro, usar bgColor para todos
    activeBgColor = bgColor;
  }

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', type);
    // Asegurarse de que se pasa el tipo exacto, sin cambios de mayúsculas/minúsculas
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      style={{
        borderColor: activeBorderColor,
        backgroundColor: activeBgColor,
      }}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-colors",
        "border-2 border-dashed hover:border-solid",
        "active:bg-primary active:text-white",
        "group",
        className // Aplica la className aquí
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-2 text-center">
        <div className="transition-colors mb-1">{icon}</div>
        <span className="text-xs  leading-tight">{label}</span>
      </CardContent>
    </Card>
  );
}
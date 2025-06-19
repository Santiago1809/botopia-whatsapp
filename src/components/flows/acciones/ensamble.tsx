import React from "react";
import { DraggableNode } from "../DraggableNode";
import { 
  SiGmail, 
  SiNotion, 
  SiGooglecalendar, 
  SiSupabase, 
  SiGooglesheets 
} from "react-icons/si";

export function AccionesSection() {
  // Separar nodos en dos grupos
  const primaryActions = [
    {
      type: "gmail",
      label: "Gmail",
      icon: <SiGmail className="h-4 w-4 text-red-500" />,
      borderColor: "rgba(234, 67, 53, 0.3)", // Color rojo de Gmail
      bgColor: "rgba(234, 67, 53, 0.05)", // Fondo rojo con baja opacidad
      section: "acciones" // Añadida la propiedad section
    },
    {
      type: "notion",
      label: "Notion",
      icon: <SiNotion className="h-4 w-4 text-black dark:text-white" />,
      borderColor: "rgba(0, 0, 0, 0.3)", // Color negro de Notion en modo claro
      bgColor: "rgba(0, 0, 0, 0.05)", // Fondo gris claro en modo claro
      darkBorderColor: "rgba(255, 255, 255, 0.2)", // Color blanco en modo oscuro
      darkBgColor: "rgba(255, 255, 255, 0.05)", // Fondo blanco con baja opacidad en modo oscuro
      section: "acciones" // Añadida la propiedad section
    },
    {
      type: "googleCalendar",
      label: "Calendar",
      icon: <SiGooglecalendar className="h-4 w-4 text-blue-500" />,
      borderColor: "rgba(66, 133, 244, 0.3)", // Color azul de Google Calendar
      bgColor: "rgba(66, 133, 244, 0.05)", // Fondo azul con baja opacidad
      section: "acciones" // Añadida la propiedad section
    }
  ];

  const secondaryActions = [
    {
      type: "supabase",
      label: "Supabase",
      icon: <SiSupabase className="h-4 w-4 text-green-500" />,
      borderColor: "rgba(62, 207, 142, 0.3)", // Color verde de Supabase
      bgColor: "rgba(62, 207, 142, 0.05)", // Fondo verde con baja opacidad
      darkBorderColor: undefined,
      darkBgColor: undefined,
      section: "acciones" // Añadida la propiedad section
    },
    {
      type: "sheetsNode", // Cambiado a sheetsNode para coincidir con nodeTypes.tsx
      label: "Sheets",
      icon: <SiGooglesheets className="h-4 w-4 text-green-600" />,
      borderColor: "rgba(15, 157, 88, 0.3)", // Color verde de Google Sheets
      bgColor: "rgba(15, 157, 88, 0.05)", // Fondo verde con baja opacidad
      darkBorderColor: undefined,
      darkBgColor: undefined,
      section: "acciones" // Añadida la propiedad section
    }
  ];

  // Elimina dataNodes si no lo estás usando
  // const dataNodes = [...];

  return (
    <div>
      <h3 className="mb-3 font-medium">Acciones</h3>
      
      {/* Primera fila: 3 columnas */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {primaryActions.map((node, index) => (
          <DraggableNode
            key={`primary-${node.type}-${index}`}
            type={node.type}
            label={node.label}
            icon={node.icon}
            borderColor={node.borderColor}
            bgColor={node.bgColor}
            darkBorderColor={node.darkBorderColor ?? undefined}
            darkBgColor={node.darkBgColor ?? undefined}
            section={node.section} // Paso la propiedad section al componente
          />
        ))}
      </div>
      
      {/* Segunda fila: 2 columnas */}
      <div className="grid grid-cols-2 gap-2">
        {secondaryActions.map((node, index) => (
          <DraggableNode
            key={`secondary-${node.type}-${index}`}
            type={node.type}
            label={node.label}
            icon={node.icon}
            borderColor={node.borderColor}
            bgColor={node.bgColor}
            darkBorderColor={node.darkBorderColor}
            darkBgColor={node.darkBgColor}
            section={node.section} // Paso la propiedad section al componente
          />
        ))}
      </div>
    </div>
  );
}
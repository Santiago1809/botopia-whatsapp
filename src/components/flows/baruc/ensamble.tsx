import React from "react";
import { Brain, CreditCard, Phone } from "lucide-react";
import { BsWhatsapp } from 'react-icons/bs';
import { SiGooglesheets } from "react-icons/si";
import { DraggableNode } from "../DraggableNode";

export function BarucSection() {
  // Grupo de nodos para comunicación con sus colores
  const communicationNodes = [
    {
      type: "whatsappNode",
      label: "WhatsApp",
      icon: <BsWhatsapp className="h-5 w-5 text-green-600" />,
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      darkBgColor: "rgba(16, 185, 129, 0.1)",
      darkBorderColor: "rgba(16, 185, 129, 0.4)",
      section: "baruc" // Asegúrate de que section esté definido
    },
    {
      type: "whatsappApi", // No "whatsappAPI" con mayúsculas
      label: "WhatsApp API",
      icon: <BsWhatsapp className="h-5 w-5 text-green-600" />,
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      darkBgColor: "rgba(16, 185, 129, 0.1)",
      darkBorderColor: "rgba(16, 185, 129, 0.4)",
      section: "baruc" // Asegúrate de que section esté definido
    },
    {
      // Cambia esto a "llamadasIA" para que coincida con nodeTypes
      // O déjalo como "phoneWithIA" ahora que lo hemos registrado en nodeTypes
      type: "phoneWithIA", 
      label: "Llamadas IA",
      icon: <Phone className="h-5 w-5 text-blue-500" />,
      bgColor: "rgba(59, 130, 246, 0.05)",
      borderColor: "rgba(59, 130, 246, 0.3)",
      darkBgColor: "rgba(59, 130, 246, 0.1)",
      darkBorderColor: "rgba(59, 130, 246, 0.4)",
      section: "baruc" // Asegúrate de que section esté definido
    }
  ];

  // Grupo de nodos para inteligencia artificial con sus colores
  const intelligenceNodes = [
    {
      type: "IA",
      label: "Inteligencia Artificial",
      icon: <Brain className="h-5 w-5 text-amber-500" />,
      bgColor: "rgba(245, 158, 11, 0.05)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      darkBgColor: "rgba(245, 158, 11, 0.1)",
      darkBorderColor: "rgba(245, 158, 11, 0.4)"
    }
  ];

  // Grupo de nodos para herramientas con sus colores
  const toolNodes = [
    {
      type: "sheetsNode",
      label: "Google Sheets",
      icon: <SiGooglesheets className="h-5 w-5 text-green-600" />,
      bgColor: "rgba(16, 185, 129, 0.05)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      darkBgColor: "rgba(16, 185, 129, 0.1)",
      darkBorderColor: "rgba(16, 185, 129, 0.4)"
    }
  ];

  // Grupo de nodos para pagos con sus colores
  const paymentNodes = [
    {
      type: "payment",
      label: "Pasarela de Pago",
      icon: <CreditCard className="h-5 w-5 text-blue-500" />,
      bgColor: "rgba(124, 58, 237, 0.05)",
      borderColor: "rgba(124, 58, 237, 0.3)",
      darkBgColor: "rgba(124, 58, 237, 0.1)",
      darkBorderColor: "rgba(124, 58, 237, 0.4)"
    }
  ];

  return (
    <div>
      <h3 className="mb-3 font-medium">Módulos</h3>
      
      {/* Sección de Comunicación */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs text-gray-500 font-medium pl-2">Comunicación</h4>
        <div className="space-y-2">
          {communicationNodes.map((node, index) => (
            <DraggableNode 
              key={`comm-${index}`} 
              type={node.type} 
              label={node.label} 
              icon={node.icon}
              section="baruc"
              bgColor={node.bgColor}
              borderColor={node.borderColor}
              darkBgColor={node.darkBgColor}
              darkBorderColor={node.darkBorderColor}
            />
          ))}
        </div>
      </div>
      
      {/* Sección de Inteligencia Artificial */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs text-gray-500 font-medium pl-2">Inteligencia Artificial</h4>
        <div className="space-y-2">
          {intelligenceNodes.map((node, index) => (
            <DraggableNode 
              key={`ai-${index}`} 
              type={node.type} 
              label={node.label} 
              icon={node.icon}
              section="baruc"
              bgColor={node.bgColor}
              borderColor={node.borderColor}
              darkBgColor={node.darkBgColor}
              darkBorderColor={node.darkBorderColor}
            />
          ))}
        </div>
      </div>
      
      {/* Sección de Herramientas */}
      <div className="space-y-2 mb-4">
        <h4 className="text-xs text-gray-500 font-medium pl-2">Herramientas</h4>
        <div className="space-y-2">
          {toolNodes.map((node, index) => (
            <DraggableNode 
              key={`tool-${index}`} 
              type={node.type} 
              label={node.label} 
              icon={node.icon}
              section="baruc"
              bgColor={node.bgColor}
              borderColor={node.borderColor}
              darkBgColor={node.darkBgColor}
              darkBorderColor={node.darkBorderColor}
            />
          ))}
        </div>
      </div>
      
      {/* Sección de Pagos */}
      <div className="space-y-2">
        <h4 className="text-xs text-gray-500 font-medium pl-2">Pagos</h4>
        <div className="space-y-2">
          {paymentNodes.map((node, index) => (
            <DraggableNode 
              key={`pay-${index}`} 
              type={node.type} 
              label={node.label} 
              icon={node.icon}
              section="baruc"
              bgColor={node.bgColor}
              borderColor={node.borderColor}
              darkBgColor={node.darkBgColor}
              darkBorderColor={node.darkBorderColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
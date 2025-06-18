import React from "react";
import { CircleOff, Phone, CreditCard } from "lucide-react";
import { BsWhatsapp } from 'react-icons/bs';
import { DraggableNode } from "../DraggableNode";


export function BarucSection() {
  // Separar nodos en dos grupos
  const basicNodes = [
    {
      type: "call",
      label: "Llamadas con IA",
      icon: <Phone className="h-4 w-4 text-orange-500" />,
      borderColor: "rgba(249, 115, 22, 0.3)", // Color naranja
      bgColor: "rgba(249, 115, 22, 0.05)" // Fondo naranja con baja opacidad
    },
    {
      type: "payments",
      label: "Pagos",
      icon: <CreditCard className="h-4 w-4 text-purple-500" />,
      borderColor: "rgba(168, 85, 247, 0.3)", // Color púrpura
      bgColor: "rgba(168, 85, 247, 0.05)" // Fondo púrpura con baja opacidad
    },
    {
      type: "IA",
      label: "Inteligencia Artificial",
      icon: <CircleOff className="h-4 w-4 text-red-500" />,
      borderColor: "rgba(239, 68, 68, 0.3)", // Color rojo
      bgColor: "rgba(239, 68, 68, 0.05)" // Fondo rojo con baja opacidad
    }
  ];

  const whatsappNodes = [
    {
      type: "whatsappNode",
      label: "WhatsApp baruc",
      icon: <BsWhatsapp className="h-4 w-4 text-green-500" />,
      borderColor: "rgba(34, 197, 94, 0.3)", // Color verde de WhatsApp
      bgColor: "rgba(34, 197, 94, 0.05)" // Fondo verde con baja opacidad
    },
    {
      type: "whatsappBusinessApi",
      label: "WhatsApp API",
      icon: <BsWhatsapp className="h-4 w-4 text-blue-500" />,
      borderColor: "rgba(59, 130, 246, 0.3)", // Color azul
      bgColor: "rgba(59, 130, 246, 0.05)" // Fondo azul con baja opacidad
    }
  ];

  return (
    <div>
      <h3 className="mb-3  font-medium">Baruc</h3>
      
      {/* Primera fila: 3 columnas */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {basicNodes.map((node, index) => (
          <DraggableNode
            key={`basic-${node.type}-${index}`}
            type={node.type}
            label={node.label}
            icon={node.icon}
            borderColor={node.borderColor}
            bgColor={node.bgColor}
          />
        ))}
      </div>
      
      {/* Segunda fila: 2 columnas */}
      <div className="grid grid-cols-2 gap-2">
        {whatsappNodes.map((node, index) => (
          <DraggableNode
            key={`whatsapp-${node.type}-${index}`}
            type={node.type}
            label={node.label}
            icon={node.icon}
            borderColor={node.borderColor}
            bgColor={node.bgColor}
          />
        ))}
      </div>
    </div>
  );
}
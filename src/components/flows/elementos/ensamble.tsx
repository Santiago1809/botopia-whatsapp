import React from "react";
import { DraggableNode } from "../DraggableNode";
import { 
  Zap, 
  Clock, 
  Hash, 
  RotateCcw, 
  GitBranch 
} from "lucide-react";

export function ElementosSection() {
  // Separar nodos en dos grupos
  const primaryElements = [
    {
      type: "trigger",
      label: "Disparador",
      icon: <Zap className="h-4 w-4 text-yellow-500" />
    },
    {
      type: "delay",
      label: "Retraso",
      icon: <Clock className="h-4 w-4 text-blue-400" />
    },
    {
      type: "counter",
      label: "Contador",
      icon: <Hash className="h-4 w-4 text-purple-500" />
    }
  ];

  const secondaryElements = [
    {
      type: "loop",
      label: "Bucle",
      icon: <RotateCcw className="h-4 w-4 text-orange-500" />
    },
    {
      type: "condition",
      label: "Condición",
      icon: <GitBranch className="h-4 w-4 text-teal-500" />
    }
  ];

  return (
    <div>
      <h3 className="mb-3  font-medium">Elementos</h3>
      
      {/* Primera fila: 3 columnas */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {primaryElements.map((node, index) => (
          <DraggableNode
            key={`primary-${node.type}-${index}`}
            type={node.type}
            label={node.label}
            icon={node.icon}
            section="elementos"
          />
        ))}
      </div>
      
      {/* Segunda fila: 2 columnas */}
      <div className="grid grid-cols-2 gap-2">
        {secondaryElements.map((node, index) => (
          <DraggableNode
            key={`secondary-${node.type}-${index}`}
            type={node.type}
            label={node.label}
            icon={node.icon}
            section="elementos" // Añadir esta línea
          />
        ))}
      </div>
    </div>
  );
}
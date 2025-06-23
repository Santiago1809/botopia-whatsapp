import React, { useState } from "react";
import { Zap } from "lucide-react";
import { NodeProps } from "reactflow";

interface TriggerNodeProps extends NodeProps {
  data: {
    label: string;
    triggerType?: "message" | "keyword" | "join" | "time";
    keywords?: string;
    time?: string;
    onChange?: (key: string, value: unknown) => void;
  };
}

export default function TriggerNode({ data, selected }: TriggerNodeProps) {
  const [triggerType, setTriggerType] = useState<string>(data.triggerType || "message");

  const handleTriggerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTriggerType(e.target.value);
    if (data.onChange) {
      data.onChange("triggerType", e.target.value);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${selected ? "border-yellow-500" : "border-yellow-200"} bg-white p-3 shadow-md w-[220px]`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-full bg-yellow-100 p-2">
          <Zap className="h-4 w-4 text-yellow-500" />
        </div>
        <h3 className="text-sm font-medium">{data.label || "Disparador"}</h3>
      </div>
      
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">Tipo de disparador</label>
        <select 
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
          value={triggerType}
          onChange={handleTriggerTypeChange}
        >
          <option value="message">Cualquier mensaje</option>
          <option value="keyword">Palabra clave</option>
          <option value="join">Nuevo usuario</option>
          <option value="time">Programado</option>
        </select>
        
        {triggerType === "keyword" && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Palabras clave</label>
            <input 
              type="text" 
              placeholder="Ej: hola, ayuda, inicio" 
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              onChange={(e) => data.onChange?.("keywords", e.target.value)}
            />
          </div>
        )}

        {triggerType === "time" && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Programación</label>
            <input 
              type="time" 
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs mb-1"
              onChange={(e) => data.onChange?.("time", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3"></div>
        <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3"></div>
      </div>
    </div>
  );
}
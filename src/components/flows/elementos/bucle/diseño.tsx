import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { NodeProps } from "reactflow";

interface LoopNodeProps extends NodeProps {
  data: {
    label: string;
    loopType?: "count" | "while" | "forEach";
    iterations?: number;
    variableName?: string;
    collectionName?: string;
    condition?: string;
    onChange?: (key: string, value: unknown) => void;
  };
}

export default function LoopNode({ data, selected }: LoopNodeProps) {
  const [loopType, setLoopType] = useState<string>(data.loopType || "count");
  const [iterations, setIterations] = useState<number>(data.iterations || 3);
  const [variableName, setVariableName] = useState<string>(data.variableName || "item");
  const [collectionName, setCollectionName] = useState<string>(data.collectionName || "lista");
  const [condition, setCondition] = useState<string>(data.condition || "contador < 5");

  const handleLoopTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoopType(e.target.value);
    if (data.onChange) {
      data.onChange("loopType", e.target.value);
    }
  };

  const handleIterationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setIterations(isNaN(value) ? 1 : value);
    if (data.onChange) {
      data.onChange("iterations", isNaN(value) ? 1 : value);
    }
  };

  const handleVariableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariableName(e.target.value);
    if (data.onChange) {
      data.onChange("variableName", e.target.value);
    }
  };

  const handleCollectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(e.target.value);
    if (data.onChange) {
      data.onChange("collectionName", e.target.value);
    }
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCondition(e.target.value);
    if (data.onChange) {
      data.onChange("condition", e.target.value);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${selected ? "border-orange-500" : "border-orange-200"} bg-white p-3 shadow-md w-[250px]`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-full bg-orange-100 p-2">
          <RotateCcw className="h-4 w-4 text-orange-500" />
        </div>
        <h3 className="text-sm font-medium">{data.label || "Bucle"}</h3>
      </div>
      
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">Tipo de bucle</label>
        <select 
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs mb-2"
          value={loopType}
          onChange={handleLoopTypeChange}
        >
          <option value="count">Repetir N veces</option>
          <option value="while">Mientras se cumpla condición</option>
          <option value="forEach">Por cada elemento</option>
        </select>
        
        {loopType === "count" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Número de repeticiones</label>
            <input 
              type="number" 
              min="1"
              value={iterations}
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              onChange={handleIterationsChange}
            />
          </div>
        )}
        
        {loopType === "forEach" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Variable de elemento</label>
            <input 
              type="text" 
              value={variableName}
              placeholder="item"
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs mb-2"
              onChange={handleVariableNameChange}
            />
            
            <label className="block text-xs text-gray-500 mb-1">Nombre de la colección</label>
            <input 
              type="text" 
              value={collectionName}
              placeholder="lista"
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              onChange={handleCollectionNameChange}
            />
          </div>
        )}
        
        {loopType === "while" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Condición</label>
            <input 
              type="text" 
              value={condition}
              placeholder="contador < 5"
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              onChange={handleConditionChange}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3"></div>
        <div className="flex gap-2">
          <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3"></div>
          <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3"></div>
        </div>
      </div>
    </div>
  );
}
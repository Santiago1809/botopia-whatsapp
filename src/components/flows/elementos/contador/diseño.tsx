import React, { useState } from "react";
import { Hash } from "lucide-react";
import { NodeProps } from "reactflow";

interface CounterNodeProps extends NodeProps {
  data: {
    label: string;
    counterName?: string;
    operation?: "increment" | "decrement" | "reset" | "set";
    value?: number;
    onChange?: (key: string, value: unknown) => void;
  };
}

export default function CounterNode({ data, selected }: CounterNodeProps) {
  const [counterName, setCounterName] = useState<string>(data.counterName || "contador1");
  const [operation, setOperation] = useState<string>(data.operation || "increment");
  const [value, setValue] = useState<number>(data.value || 1);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCounterName(e.target.value);
    if (data.onChange) {
      data.onChange("counterName", e.target.value);
    }
  };

  const handleOperationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOperation(e.target.value);
    if (data.onChange) {
      data.onChange("operation", e.target.value);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(isNaN(newValue) ? 0 : newValue);
    if (data.onChange) {
      data.onChange("value", isNaN(newValue) ? 0 : newValue);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${selected ? "border-purple-500" : "border-purple-200"} bg-white p-3 shadow-md w-[220px]`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-full bg-purple-100 p-2">
          <Hash className="h-4 w-4 text-purple-500" />
        </div>
        <h3 className="text-sm font-medium">{data.label || "Contador"}</h3>
      </div>
      
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">Nombre del contador</label>
        <input 
          type="text"
          value={counterName}
          placeholder="contador1"
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs mb-2"
          onChange={handleNameChange}
        />
        
        <label className="block text-xs text-gray-500 mb-1">Operación</label>
        <select 
          className="w-full rounded border border-gray-200 px-2 py-1 text-xs mb-2"
          value={operation}
          onChange={handleOperationChange}
        >
          <option value="increment">Incrementar</option>
          <option value="decrement">Decrementar</option>
          <option value="reset">Reiniciar a cero</option>
          <option value="set">Establecer valor</option>
        </select>
        
        {(operation === "increment" || operation === "decrement" || operation === "set") && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {operation === "set" ? "Valor" : "Cantidad"}
            </label>
            <input 
              type="number" 
              value={value}
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              onChange={handleValueChange}
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
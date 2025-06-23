import React, { useState } from "react";
import { Clock } from "lucide-react";
import { NodeProps } from "reactflow";

interface DelayNodeProps extends NodeProps {
  data: {
    label: string;
    delayUnit?: "seconds" | "minutes" | "hours" | "days";
    delayValue?: number;
    onChange?: (key: string, value: unknown) => void;
  };
}

export default function DelayNode({ data, selected }: DelayNodeProps) {
  const [delayUnit, setDelayUnit] = useState<string>(data.delayUnit || "minutes");
  const [delayValue, setDelayValue] = useState<number>(data.delayValue || 5);

  const handleDelayUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDelayUnit(e.target.value);
    if (data.onChange) {
      data.onChange("delayUnit", e.target.value);
    }
  };

  const handleDelayValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDelayValue(isNaN(value) ? 0 : value);
    if (data.onChange) {
      data.onChange("delayValue", isNaN(value) ? 0 : value);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${selected ? "border-blue-500" : "border-blue-200"} bg-white p-3 shadow-md w-[220px]`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-full bg-blue-100 p-2">
          <Clock className="h-4 w-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-medium">{data.label || "Retraso"}</h3>
      </div>
      
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">Tiempo de espera</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            min="1"
            value={delayValue}
            className="w-1/3 rounded border border-gray-200 px-2 py-1 text-xs"
            onChange={handleDelayValueChange}
          />
          <select 
            className="w-2/3 rounded border border-gray-200 px-2 py-1 text-xs"
            value={delayUnit}
            onChange={handleDelayUnitChange}
          >
            <option value="seconds">Segundos</option>
            <option value="minutes">Minutos</option>
            <option value="hours">Horas</option>
            <option value="days">Días</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex">
          <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3 mr-1"></div>
        </div>
        <div className="flex">
          <div className="border rounded-full border-gray-100 bg-gray-50 w-3 h-3"></div>
        </div>
      </div>
    </div>
  );
}
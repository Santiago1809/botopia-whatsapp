import React, { useState } from "react";
import { GitBranch } from "lucide-react";
import { NodeProps } from "reactflow";

interface ConditionNodeProps extends NodeProps {
  data: {
    label: string;
    variable?: string;
    operator?: string;
    value?: string;
    useCustom?: boolean;
    customCondition?: string;
    onChange?: (key: string, value: unknown) => void;
  };
}

export default function ConditionNode({ data, selected }: ConditionNodeProps) {
  const [useCustom, setUseCustom] = useState<boolean>(data.useCustom || false);
  const [variable, setVariable] = useState<string>(data.variable || "contador");
  const [operator, setOperator] = useState<string>(data.operator || "==");
  const [value, setValue] = useState<string>(data.value || "5");
  const [customCondition, setCustomCondition] = useState<string>(data.customCondition || "contador > 5 && tiempo < 10");

  const handleUseCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseCustom(e.target.checked);
    if (data.onChange) {
      data.onChange("useCustom", e.target.checked);
    }
  };

  const handleVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariable(e.target.value);
    if (data.onChange) {
      data.onChange("variable", e.target.value);
    }
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOperator(e.target.value);
    if (data.onChange) {
      data.onChange("operator", e.target.value);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (data.onChange) {
      data.onChange("value", e.target.value);
    }
  };

  const handleCustomConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCondition(e.target.value);
    if (data.onChange) {
      data.onChange("customCondition", e.target.value);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${selected ? "border-teal-500" : "border-teal-200"} bg-white p-3 shadow-md w-[250px]`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-full bg-teal-100 p-2">
          <GitBranch className="h-4 w-4 text-teal-500" />
        </div>
        <h3 className="text-sm font-medium">{data.label || "Condición"}</h3>
      </div>
      
      <div className="mt-3">
        <div className="flex items-center mb-2">
          <input 
            type="checkbox" 
            id="useCustom" 
            checked={useCustom}
            onChange={handleUseCustomChange}
            className="mr-2"
          />
          <label htmlFor="useCustom" className="text-xs text-gray-500">Usar condición personalizada</label>
        </div>
        
        {!useCustom ? (
          <>
            <label className="block text-xs text-gray-500 mb-1">Variable</label>
            <input 
              type="text" 
              value={variable}
              placeholder="contador"
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs mb-2"
              onChange={handleVariableChange}
            />
            
            <div className="flex gap-2 mb-2">
              <div className="w-1/3">
                <label className="block text-xs text-gray-500 mb-1">Operador</label>
                <select 
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                  value={operator}
                  onChange={handleOperatorChange}
                >
                  <option value="==">==</option>
                  <option value="!=">!=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
              </div>
              
              <div className="w-2/3">
                <label className="block text-xs text-gray-500 mb-1">Valor</label>
                <input 
                  type="text" 
                  value={value}
                  className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                  onChange={handleValueChange}
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Expresión de condición</label>
            <input 
              type="text" 
              value={customCondition}
              placeholder="contador > 5 && tiempo < 10"
              className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
              onChange={handleCustomConditionChange}
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
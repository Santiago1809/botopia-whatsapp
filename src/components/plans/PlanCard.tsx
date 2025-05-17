// components/plans/PlanCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";

export interface PlanProps {
  id: string;
  title: string;
  phones: string;
  flows: string;
  credits: string;
  creditPrice: string;
  price: string;
  isSelected: boolean;
  isPro?: boolean;
  loading?: boolean;              // <-- nuevo
  onSelect: (planId: string) => void;
}

export const PlanCard: React.FC<PlanProps> = ({
  id,
  title,
  phones,
  flows,
  credits,
  creditPrice,
  price,
  isSelected,
  isPro = false,
  loading = false,                // <-- por defecto
  onSelect,
}) => {
  const baseClasses =
    "w-full md:w-80 text-white overflow-hidden relative transition-all duration-300 h-full flex flex-col";
  const proClasses = isPro
    ? "bg-secondary border-[#a7a1e6] border-2"
    : "bg-primary";
  const selectedClasses = isSelected
    ? "transform scale-105 shadow-xl"
    : "hover:transform hover:scale-[1.02] hover:shadow-lg";

  return (
    <Card
      className={`${baseClasses} ${proClasses} ${selectedClasses}`}
      onClick={() => {
        if (!loading) onSelect(id);
      }}
      style={{ cursor: loading ? "not-allowed" : "pointer" }}
    >
      <div className="p-6 flex-grow">
        {/* ... contenido ... */}
      </div>
      <div className="p-4 flex justify-center mt-auto">
        <Button
          disabled={loading || isSelected}
          className={`w-full bg-white text-accent hover:bg-[#8b86c9] hover:text-tertiary ${
            isSelected ? "ring-2 ring-white" : ""
          }`}
        >
          {loading && isSelected
            ? "Espere…"
            : isSelected
            ? "Plan seleccionado"
            : "Seleccionar plan"}
        </Button>
      </div>
      {isSelected && !loading && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded-bl-md">
          Seleccionado
        </div>
      )}
    </Card>
  );
};

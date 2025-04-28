"use client";

import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PlanProps {
  title: string;
  features: string[];
  price: string;
  credits: string;
  creditPrice: string;
  phones: string;
  flows: string;
  isSelected: boolean;
  isPro?: boolean;
  onSelect: () => void;
}

const PlanCard = ({
  title,
  price,
  credits,
  creditPrice,
  phones,
  flows,
  isSelected,
  isPro = false,
  onSelect,
}: PlanProps) => {
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
      onClick={onSelect}
    >
      <div className="p-6 flex-grow">
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <ul className="space-y-4 mb-8">
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <span>{phones}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <span>{flows}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <span>Tu agente podrá personalizarse con un prompt</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <span>Todos los modelos disponibles</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <span>{credits}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5">•</span>
            <span>Precio del crédito: {creditPrice}</span>
          </li>
        </ul>
        <div className="text-center text-3xl font-bold mt-4">{price}</div>
      </div>
      <div className="p-4 flex justify-center mt-auto">
        <Button
          className={`w-full bg-white text-accent hover:bg-[#8b86c9] hover:text-tertiary cursor-pointer ${
            isSelected ? "ring-2 ring-white" : ""
          }`}
        >
          {isSelected ? "Plan seleccionado" : "Seleccionar plan"}
        </Button>
      </div>
      {isSelected && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded-bl-md">
          Seleccionado
        </div>
      )}
    </Card>
  );
};

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Facturación
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Gestiona tus planes y métodos de pago
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm py-6 mt-6 mb-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              Métodos de pago
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            <PlanCard
              title="PLAN BASIC"
              phones="Puedes vincular hasta 1 número de teléfono"
              flows="Puedes crear y tener hasta 1 flujo activo"
              credits="10.000 créditos gratis"
              creditPrice="0,00009"
              price="49 USD / MES"
              features={[]}
              isSelected={selectedPlan === "basic"}
              onSelect={() => handleSelectPlan("basic")}
            />

            <PlanCard
              title="PLAN PRO"
              phones="Puedes vincular hasta 3 números de teléfono"
              flows="Puedes crear infinitos flujos y tener hasta 5 flujos activos"
              credits="100.000 créditos gratis"
              creditPrice="0,00005"
              price="149 USD / MES"
              features={[]}
              isPro={true}
              isSelected={selectedPlan === "pro"}
              onSelect={() => handleSelectPlan("pro")}
            />

            <PlanCard
              title="PLAN PREMIUM"
              phones="Puedes vincular infinitos números de teléfono"
              flows="Puedes crear y tener hasta 50 flujos activos"
              credits="1.000.000 créditos gratis"
              creditPrice="0,00003"
              price="409 USD / MES"
              features={[]}
              isSelected={selectedPlan === "premium"}
              onSelect={() => handleSelectPlan("premium")}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Consumos de créditos
          </h2>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">WhatsApp:</h3>
            <p className="text-sm text-gray-600 mb-2">
              Dependiendo del modelo elegido, cada palabra consumirá
              aproximadamente la siguiente cantidad de créditos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">gemini-2.0-flash-lite</span>
                <span>0.5 créditos aproximadamente por palabra</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">gemini-2.0-flash-preview</span>
                <span>1 crédito aproximadamente por palabra</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Claude 3 Haiku</span>
                <span>0.5 créditos aproximadamente por palabra</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Claude 3 Opus</span>
                <span>2 créditos aproximadamente por palabra</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">GPT-4.1 nano</span>
                <span>0.5 créditos aproximadamente por palabra</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">OpenAI o3</span>
                <span>1 crédito aproximadamente por palabra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Métodos de pago
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Próximamente podrás gestionar tus métodos de pago y ver el
              historial de transacciones.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

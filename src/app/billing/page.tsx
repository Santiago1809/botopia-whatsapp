"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { PlanCard } from "@/components/plans/PlanCard";
import { useState } from "react";
import { SubscriptionDashboard } from "../../components/subscription/SubscriptionDashboard";
import { useCreateSubscription } from "../hooks/useCreateSubscription";

const PLANS = [
  {
    id: "basic",
    title: "PLAN BÁSICO",
    phones: "2 números de teléfono",
    flows: "3 flujos",
    credits: "Límite de 1000 mensajes al mes",
    creditPrice: "14,00",
    price: "14.90 USD / MES",
    amount: 14.90,
    order_id: 1030,
    features: [
      "2 números de teléfono",
      "Límite de 1000 mensajes al mes",
      "2 agentes",
      "3 flujos",
      "Soporte por email",
    ],
    description: "Para equipos pequeños y profesionales individuales",
    dloToken: "VDgGiFZqrHCdy3YyXcvskOp4z1Xrd6kG",
    theme: {
      gradient: "from-[#FAECD4] to-[#FAECD4]",
      text: "text-[#010009]",
      border: "border-blue-200",
      button: "bg-blue-500 hover:bg-blue-600",
      icon: "text-blue-500",
    },
  },
  {
    id: "pro",
    title: "PLAN PRO",
    phones: "5 números de teléfono",
    flows: "20 flujos",
    credits: "Límite de 5000 mensajes al mes",
    creditPrice: "79,00",
    price: "79 USD / MES",
    amount: 79,
    order_id: 1031,
    features: [
      "5 números de teléfono",
      "Límite de 5000 mensajes al mes",
      "10 agentes",
      "20 flujos",
      "Catálogo de modelos AI completo",
      "Soporte por email y WhatsApp",
    ],
    description: "Para compañías que quieren escalar y crecer",
    popular: true,
    dloToken: "AjAPNLCY3xDjhg9Xfm5iGw4Yul42c9Lc",
    theme: {
      gradient: "from-purple-200 to-purple-200",
      text: "text-[#010009]",
      border: "border-purple-200",
      button: "bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-200",
      icon: "text-purple-500",
    },
  },
  {
    id: "industrial",
    title: "PLAN INDUSTRIAL",
    phones: "20 números de teléfono",
    flows: "20 flujos",
    credits: "Límite de 10.000 mensajes al mes",
    creditPrice: "249,00",
    price: "249 USD / MES",
    amount: 249,
    order_id: 1032,
    features: [
      "20 números de teléfono",
      "Límite de 10.000 mensajes al mes",
      "50 agentes",
      "20 flujos",
      "Catálogo de modelos AI completo",
      "Soporte 1-1 con el equipo entero",
      "Ingeniero de cuenta dedicado",
      "Integra pagos dentro de WhatsApp",
    ],
    description: "Para compañías que realmente desean usar IA",
    dloToken: "AjAPNLCY3xDjhg9Xfm5iGw4Yul42c9Lc",
    theme: {
      gradient: "from-[#FAECD4] to-[#FAECD4]",
      text: "text-[#010009]",
      border: "border-indigo-200",
      button: "bg-indigo-500 hover:bg-indigo-600",
      icon: "text-indigo-500",
    },
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { createSubscription, loading } = useCreateSubscription();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    try {
      const result = await createSubscription({
        planToken: plan.dloToken,
        amount: plan.amount,
        planName: plan.title,
      });

      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      console.error("Error creando la suscripción:", err);
    }
  };

  return (
    <SidebarLayout>
      <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Existing SubscriptionDashboard */}
        <div className="mb-10">
          <SubscriptionDashboard />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mt-6 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Planes</h2>
            <p className="text-gray-600 text-lg">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div key={plan.id} className={plan.popular ? "relative z-10" : ""}>
                <PlanCard
                  {...plan}
                  isSelected={selectedPlan === plan.id}
                  loading={loading}
                  onSelect={handleSelectPlan}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

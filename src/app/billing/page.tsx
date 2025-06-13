"use client";

import React, { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { PlanCard } from "@/components/plans/PlanCard";
import { SubscriptionDashboard } from "../../components/subscription/SubscriptionDashboard";
import { useCreateSubscription } from "../hooks/useCreateSubscription";

const dlo_BASIC_token = process.env.NODE_ENV === 'production'
  ? "IjISC1nT2PL9t7KnGDA9WNUI2KzLO2yF"
  : "VDgGiFZqrHCdy3YyXcvskOp4z1Xrd6kG";
const dlo_PRO_token = process.env.NODE_ENV === 'production'
  ? "oVf3b85mCCmUFukb60doJ8YGciCHlzfD"
  : "Hc7EmOi9YN9RIGya6tMAznse8CW9RX6y";
const dlo_INDUSTRIAL_token = process.env.NODE_ENV === 'production'
  ? "hGojfInMTDTPQIOuoNmpfDfgVtFEKZsW"
  : "Q6wEzUzsVsbfFRWdRQk4vp4BaWewbGwU";

const freeToken =
  process.env.NODE_ENV === 'production'
    ? "TokenFree_Prod"
    : "TokenFree_Dev";

const PLANS = [
  {
    id: "free",
    title: "PLAN GRATUITO",
    phones: "1 número de teléfono",
    flows: "1 flujo",
    credits: "Límite de 50 mensajes al mes",
    creditPrice: "0,00",
    price: "Gratis",
    amount: 0,
    order_id: 1029,
    features: [
      "Sin agentes",
      "Respuesta en 20-30 segundos",
    ],
    description: "Ideal para experimentar la IA",
    dloToken: freeToken,
    theme: {
      gradient: "from-blue-100 to-blue-200",
      text: "text-green-700",
      border: "border-green-200",
      button: "bg-lila-600 hover:bg-lila-600",
      icon: "text-green-600",
    },
  },
  {
    id: "basic",
    title: "PLAN BÁSICO",
    phones: "2 números de teléfono",
    flows: "1 flujo",
    credits: "Límite de 1000 mensajes al mes",
    creditPrice: "14,00",
    price: "14.00 USD / MES",
    amount: 14.00,
    order_id: 1030,
    features: [
      "2 agentes",
      "Respuesta entre 10-20 segundos",
      "Soporte por email",
    ],
    description: "Para equipos pequeños y profesionales individuales",
    dloToken: dlo_BASIC_token,
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
    amount: 79.00,
    order_id: 1031,
    features: [
      "10 agentes",
      "Respuesta entre 7-15 segundos",
      "Catálogo de modelos AI incompleto",
      "Responde grupos de Whatsapp",
      "Soporte por email y WhatsApp",
    ],
    description: "Para compañías que quieren escalar y crecer",
    popular: true,
    dloToken: dlo_PRO_token,
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
    creditPrice: "549,00",
    price: "549 USD / MES",
    amount: 549,
    order_id: 1032,
    features: [
      "50 agentes",
      "Catálogo de modelos AI completo",
      "Soporte 1-1 con el equipo entero",
      "Ingeniero de cuenta dedicado",
      "Respuesta entre 2-7 segundos",
      "Integra pagos dentro de WhatsApp",
    ],
    description: "Para compañías que realmente desean usar IA",
    dloToken: dlo_INDUSTRIAL_token,
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

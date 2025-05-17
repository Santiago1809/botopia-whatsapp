"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { PlanCard } from "@/components/plans/PlanCard";
import { useCreatePayment } from "@/app/hooks/useCreatePayment";


const PLANS = [
  {
    id: "basic",
    title: "PLAN BASIC",
    phones: "Puedes vincular hasta 1 número de teléfono",
    flows: "Puedes crear y tener hasta 1 flujo activo",
    credits: "10.000 créditos gratis",
    creditPrice: "0,00009",
    price: "49 USD / MES",
    amount: 4900,
    order_id: 1012,
  },
  {
    id: "pro",
    title: "PLAN PRO",
    phones: "Puedes vincular hasta 3 números de teléfono",
    flows: "Puedes crear infinitos flujos y tener hasta 5 flujos activos",
    credits: "100.000 créditos gratis",
    creditPrice: "0,00005",
    price: "149 USD / MES",
    amount: 14900,
    order_id: 1013,
  },
  {
    id: "premium",
    title: "PLAN PREMIUM",
    phones: "Puedes vincular infinitos números de teléfono",
    flows: "Puedes crear y tener hasta 50 flujos activos",
    credits: "1.000.000 créditos gratis",
    creditPrice: "0,00003",
    price: "409 USD / MES",
    amount: 40900,
    order_id: 1014,
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { createPayment, loading, error } = useCreatePayment();
  const router = useRouter();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    try {
      const { redirect_url } = await createPayment({
        currency: "COP",
        amount: plan.amount,
        country: "CO",
        order_id: plan.order_id,
        description: `Suscripción ${plan.title}`,
        success_url: `${window.location.origin}/billing/processing`,
        back_url: window.location.origin,
        notification_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/notification`,
      });
      window.location.href = redirect_url;
    } catch (err) {
      console.error("Error creando el pago:", err);
    }
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
              Planes
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                title={plan.title}
                phones={plan.phones}
                flows={plan.flows}
                credits={plan.credits}
                creditPrice={plan.creditPrice}
                price={plan.price}
                isPro={plan.id === "pro"}
                isSelected={selectedPlan === plan.id}
                loading={loading}   
                onSelect={handleSelectPlan}
              />
            ))}
          </div>

          {loading && (
            <p className="text-center mt-4 text-gray-600">Cargando pago…</p>
          )}
          {error && (
            <p className="text-center mt-2 text-red-500">Error: {error}</p>
          )}
        </div>

        {/* Aquí puedes seguir con el resto de la sección de consumos de créditos, métodos de pago, etc. */}
      </div>
    </SidebarLayout>
  );
}

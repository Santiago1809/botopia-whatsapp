// app/billing/cancel/page.tsx
"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Pago cancelado
      </h1>
      <p className="mb-6">
        Has cancelado el proceso de pago. Si fue un error, puedes intentarlo de
        nuevo.
      </p>
      <Link
        href="/billing"
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        Elegir plan nuevamente
      </Link>
    </div>
  );
}

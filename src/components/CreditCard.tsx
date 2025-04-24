"use client";
import { useAuth } from "@/lib/auth";
import { Coins } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function CreditsCard() {
  const pathname = usePathname();
  const { token } = useAuth();
  const [credits, setCredits] = useState(0);

  const getCredits = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/credits/user-credits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Error al obtener los créditos");
    }
    const data = await response.json();
    setCredits(data.currentCredits.usedCredits);
  }, [token]);

  useEffect(() => {
    if (token) {
      getCredits();
    }
  }, [token, getCredits]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <div className="absolute w-fit max-h-44 px-4 py-2 bottom-20 right-2 bg-white rounded-lg shadow-lg border border-gray-200 flex gap-x-2 items-center justify-center text-lg">
      <Coins />
      Créditos usados: {credits}
    </div>
  );
}

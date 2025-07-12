"use client";
import { useAuth } from "@/lib/auth";
import { MessagesSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function MessagesCard() {
  const pathname = usePathname();
  const { token } = useAuth();
  const [credits, setCredits] = useState(0);

  const getCredits = useCallback(async () => {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/message-usage`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Error al obtener los créditos");
    }
    const data = await response.json();
    setCredits(data.usage);
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
    <div className="w-fit max-h-44 text-foreground/80 flex gap-x-2 items-center justify-center text-lg">
      <MessagesSquare />
      Mensajes usados: {credits}
    </div>
  );
}

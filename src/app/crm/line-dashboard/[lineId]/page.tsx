"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LineDashboard() {
  const params = useParams();
  const router = useRouter();
  const lineId = params.lineId as string;

  // 🚀 REDIRECCIÓN AUTOMÁTICA A KANBAN
  useEffect(() => {
    if (lineId) {
      router.replace(`/crm/line-dashboard/${lineId}/kanban`);
    }
  }, [lineId, router]);

  // Mostrar loading mientras redirige
    return (
      <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Redirigiendo al Kanban...</p>
        </div>
      </div>
    </div>
  );
}

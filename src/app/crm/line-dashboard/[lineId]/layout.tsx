"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardHeader from "../../../../components/crm/DashboardHeader";
import NavigationTabs from "../../../../components/crm/NavigationTabs";
import type { LineDashboardData, Contact } from "../../../../types/dashboard";

export default function LineDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dashboardData, setDashboardData] = useState<LineDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const params = useParams();
  const router = useRouter();
  const lineId = params.lineId as string;

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  // Fetch all contacts for the line
  const fetchAllContacts = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lines/${lineId}/contacts`);
      const data = await response.json();
      
      if (data.success) {
        setAllContacts(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      setAllContacts([]);
    }
  }, [lineId, BACKEND_URL]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulamos datos del dashboard de línea
      const mockData: LineDashboardData = {
        line: {
          id: lineId,
          numero: "15556647179",
          proveedor: "META",
          estaActivo: true,
          creadoEn: "2025-07-18T06:04:22.007746+00:00",
          idDeUsuario: "2",
          contactsCount: 4,
          activeContacts: 4,
          lastActivity: "2025-07-20T23:37:09.569Z"
        },
        stats: {
          totalContacts: 4,
          activeContacts: 4,
          newLeads: 4,
          inProgress: 0,
          scheduled: 0,
          closed: 0,
          conversionRate: 0,
          averageResponseTime: "2 min",
          todayMessages: 12,
          weeklyMessages: 45
        },
        recentContacts: []
      };
      
      setDashboardData(mockData);
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [lineId]);

  useEffect(() => {
    if (lineId) {
      fetchDashboardData();
      fetchAllContacts();
    }
  }, [lineId, fetchDashboardData, fetchAllContacts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Error al cargar dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { line } = dashboardData;

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
      {/* Header with navigation - Aparece en TODAS las páginas */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <DashboardHeader 
          line={line}
          totalContacts={allContacts.length}
          onBackClick={() => router.push('/crm')}
        />
        
        <NavigationTabs
          lineId={lineId}
        />
      </div>

      {/* Content Area - Aquí se renderizan las páginas específicas */}
      <div className="px-4 sm:px-6 md:px-8 py-2">
        {children}
      </div>
    </div>
  );
}

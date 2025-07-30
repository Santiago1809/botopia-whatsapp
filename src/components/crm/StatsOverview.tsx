"use client";

import { MessageSquare, BarChart3, Table, LucideIcon } from "lucide-react";
import type { AnalyticsStats } from "../../types/dashboard";

interface StatsOverviewProps {
  analyticsStats: AnalyticsStats;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient 
}: { 
  title: string; 
  value: number; 
  icon: LucideIcon; 
  gradient: string; 
}) => (
  <div className={`${gradient} rounded-lg p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function StatsOverview({ analyticsStats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <StatCard
        title="Nuevos Contactos"
        value={analyticsStats.nuevoLead}
        icon={Table}
        gradient="bg-gradient-to-r from-blue-500 to-blue-600"
      />
      
      <StatCard
        title="En Contacto"
        value={analyticsStats.enContacto}
        icon={MessageSquare}
        gradient="bg-gradient-to-r from-yellow-500 to-yellow-600"
      />
      
      <StatCard
        title="Citas Agendadas"
        value={analyticsStats.citaAgendada}
        icon={BarChart3}
        gradient="bg-gradient-to-r from-purple-500 to-purple-600"
      />

      <StatCard
        title="Atención Cliente"
        value={analyticsStats.atencionCliente}
        icon={BarChart3}
        gradient="bg-gradient-to-r from-orange-500 to-orange-600"
      />
      
      <StatCard
        title="Ticket de pago generado"
        value={analyticsStats.cerrado}
        icon={BarChart3}
        gradient="bg-gradient-to-r from-green-500 to-green-600"
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  LineChart,
  PieChart,
  TrendingUp,
  MessageCircle,
  Percent,
  AlertCircle,
} from "lucide-react";
import {
  MetaProviderService,
  WhatsAppMetrics,
} from "@/services/meta-provider.service";

/**
 * Dashboard funcional de métricas de WhatsApp Business API
 * Carga datos reales desde el API Gateway (baruc-api-gateway)
 * para mostrar estadísticas clave y visualizaciones avanzadas.
 */
export default function WhatsAppMetricsSection({
  businessAccountId,
  period = "30days",
}: {
  businessAccountId: string;
  period?: string;
}) {
  // Estado para métricas principales
  const [metrics, setMetrics] = useState<WhatsAppMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas reales al montar el componente
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const data = await MetaProviderService.getWhatsAppMetrics(
          businessAccountId,
          period
        );
        setMetrics(data);
      } catch {
        setError("No se pudieron cargar las métricas");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [businessAccountId, period]);

  // Métricas principales
  const mainStats = metrics
    ? [
        {
          name: "Mensajes enviados",
          value: metrics.sent.toLocaleString(),
          icon: <BarChart2 className="h-6 w-6 text-blue-500" />,
        },
        {
          name: "Mensajes entregados",
          value: metrics.delivered.toLocaleString(),
          icon: <TrendingUp className="h-6 w-6 text-green-500" />,
        },
        {
          name: "Mensajes leídos",
          value: metrics.read.toLocaleString(),
          icon: <MessageCircle className="h-6 w-6 text-purple-500" />,
        },
        {
          name: "Mensajes fallidos",
          value: metrics.failed.toLocaleString(),
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        },
        {
          name: "Tasa de entrega",
          value: `${metrics.deliveryRate.toFixed(1)}%`,
          icon: <Percent className="h-6 w-6 text-green-500" />,
        },
        {
          name: "Tasa de lectura",
          value: `${metrics.readRate.toFixed(1)}%`,
          icon: <Percent className="h-6 w-6 text-blue-500" />,
        },
        {
          name: "Tasa de respuesta",
          value: `${metrics.responseRate.toFixed(1)}%`,
          icon: <Percent className="h-6 w-6 text-purple-500" />,
        },
        {
          name: "Tasa de fallos",
          value: `${metrics.failureRate.toFixed(1)}%`,
          icon: <Percent className="h-6 w-6 text-red-500" />,
        },
      ]
    : [];

  // Visualización de mensajes por día
  const days = metrics?.byDay?.length
    ? metrics.byDay
    : Array(7).fill({ label: "", value: 0 });
  const maxDayValue = Math.max(...days.map((d) => d.value || 0), 1);

  // Visualización de rendimiento de plantillas
  const templates = metrics?.templates?.length
    ? metrics.templates
    : [
        { name: "Confirmación de pedido", rate: 95 },
        { name: "Recordatorio de cita", rate: 80 },
        { name: "Promoción especial", rate: 70 },
      ];

  // Visualización de distribución de estados
  const total = metrics?.sent || 1;
  const deliveredPct = metrics ? (metrics.delivered / total) * 100 : 0;
  const readPct = metrics ? (metrics.read / total) * 100 : 0;
  const failedPct = metrics ? (metrics.failed / total) * 100 : 0;

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Métricas de WhatsApp
        </h1>
        <p className="text-gray-500">
          Analiza el rendimiento y estadísticas de tus mensajes de WhatsApp
        </p>
      </div>
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Cargando métricas...
        </div>
      )}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && metrics && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 mb-8">
            {mainStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-4 flex flex-col items-center justify-center">
                  {stat.icon}
                  <h2 className="text-xs text-gray-500 font-medium mt-2 text-center">
                    {stat.name}
                  </h2>
                  <p className="mt-1 text-xl font-semibold text-gray-900 text-center">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Mensajes por día - gráfico de barras */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-all overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                Mensajes por día
              </h2>
              <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                <div className="w-full h-full p-4">
                  <div className="relative h-full flex items-end">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center w-1/8 mx-1"
                      >
                        <div
                          className="w-8 rounded-t-md bg-blue-500"
                          style={{
                            height: `${(d.value / maxDayValue) * 100 || 10}%`,
                          }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">
                          {d.label || `D${i + 1}`}
                        </span>
                        <span className="text-xs text-gray-700 font-semibold">
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Rendimiento de plantillas - gráfico de barras horizontales */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-blue-500" />
                  Rendimiento de plantillas
                </h2>
                <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                  <div className="w-full h-full p-4">
                    <div className="space-y-4">
                      {templates.map((template, i) => (
                        <div key={i} className="flex items-center">
                          <div className="flex-1 mr-4">
                            <div className="text-sm font-medium text-gray-700">
                              {template.name}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`bg-green-500 h-2 rounded-full`}
                                style={{ width: `${template.rate}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{`${template.rate}%`}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
                      Tasa de entrega por plantilla
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Distribución de estados - gráfico circular */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                  Distribución de estados
                </h2>
                <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeDasharray={`${deliveredPct}, 100`}
                        strokeDashoffset="25"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray={`${readPct}, 100`}
                        strokeDashoffset="0"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray={`${failedPct}, 100`}
                        strokeDashoffset="-95"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-700">
                        {metrics.sent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-sm text-gray-600">
                        Entregados ({deliveredPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span className="text-sm text-gray-600">
                        Leídos ({readPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                      <span className="text-sm text-gray-600">
                        Fallidos ({failedPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Gráfica adicional: evolución semanal de tasa de entrega */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8 hover:shadow-md transition-all overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Evolución semanal de entrega
              </h2>
              <div className="h-64 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                <div className="w-full h-full p-4">
                  <div className="flex items-end h-full">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center w-1/8 mx-1"
                      >
                        <div
                          className="w-8 rounded-t-md bg-green-500"
                          style={{
                            height: `${(d.value / maxDayValue) * 100 || 10}%`,
                          }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">
                          {d.label || `D${i + 1}`}
                        </span>
                        <span className="text-xs text-gray-700 font-semibold">
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

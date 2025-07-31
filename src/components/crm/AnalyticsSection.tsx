"use client";

import { BarChart3, TrendingUp, Users, Clock, Target, MessageSquare, CheckCircle, Activity, Bot } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { Contact, AnalyticsStats } from "../../types/dashboard";
import { useWebSocket } from "../../hooks/useWebSocket";

interface AnalyticsSectionProps {
  contacts: Contact[];
  stats: AnalyticsStats | null;
  lineId: string;
}

interface ApiMetrics {
  tokensUsed: number;
  tokensLimit: number;
  botResponses: number;
  humanResponses: number;
  averageResponseTime: number;
  satisfactionRate: number;
}

interface DailyActivity {
  date: string;
  day: string;
  newContacts: number;
  botResponses: number;
  humanResponses: number;
  conversions: number;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ contacts, stats, lineId }) => {
  const [apiMetrics, setApiMetrics] = useState<ApiMetrics | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://crm-api-black.vercel.app' 
      : 'http://localhost:5005');

  // 🔥 WEBSOCKET HOOK - TIEMPO REAL PARA ANALYTICS
  const {
    registerContactUpdateHandler,
  } = useWebSocket({ 
    lineId, 
    userId: 'analytics-agent', 
    backendUrl: BACKEND_URL 
  });

  // Fetch API metrics from backend
  const fetchApiMetrics = useCallback(async () => {
    try {
      // console.log('🔍 Frontend: Fetching API metrics for lineId:', lineId);
      const response = await fetch(`${BACKEND_URL}/api/analytics/api-metrics/${lineId}`);
      const data = await response.json();
      
      // console.log('📡 Frontend: API response:', data);
      
      if (data.success) {
        // console.log('✅ Frontend: Setting API metrics:', data.data);
        setApiMetrics(data.data);
      } else {
        // console.log('⚠️ Frontend: API call not successful, using fallback data');
        // Fallback: usar datos simulados
        setApiMetrics({
          tokensUsed: contacts.length * 120,
          tokensLimit: 3000000,
          botResponses: Math.floor(contacts.length * 0.78),
          humanResponses: Math.floor(contacts.length * 0.22),
          averageResponseTime: 0.3,
          satisfactionRate: 4.2
        });
      }
    } catch (error) {
      console.error('❌ Frontend: Error fetching API metrics:', error);
      // Usar datos de ejemplo basados en contactos actuales
      setApiMetrics({
        tokensUsed: contacts.length * 120,
        tokensLimit: 3000000,
        botResponses: Math.floor(contacts.length * 0.78),
        humanResponses: Math.floor(contacts.length * 0.22),
        averageResponseTime: 0.3,
        satisfactionRate: 4.2
      });
    }
  }, [BACKEND_URL, lineId, contacts]);

  // Fetch weekly activity from conversations table
  const fetchWeeklyActivity = useCallback(async () => {
    try {
      // console.log('🔍 Frontend: Fetching weekly activity for lineId:', lineId);
      const response = await fetch(`${BACKEND_URL}/api/analytics/weekly-activity/${lineId}`);
      const data = await response.json();
      
      // console.log('📡 Frontend: Weekly activity response:', data);
      
      if (data.success) {
        // console.log('✅ Frontend: Setting weekly activity data:', data.data);
        
        // Procesar y ajustar las fechas para corregir el desfase
        const adjustedData = data.data.map((day: DailyActivity) => {
          // Crear una nueva fecha basada en la fecha actual para incluir hoy
          const adjustedDate = new Date(day.date);
          adjustedDate.setDate(adjustedDate.getDate() + 1); // Mover un día hacia adelante
          
          const newDateStr = adjustedDate.toISOString().split('T')[0];
          
          // console.log(`🔧 Frontend: Adjusting ${day.date} → ${newDateStr}`, {
          //   originalDate: day.date,
          //   adjustedDate: newDateStr,
          //   isToday: newDateStr === todayStr,
          //   dayName: adjustedDate.toLocaleDateString('es-ES', { weekday: 'short' })
          // });
          
          return {
            ...day,
            date: newDateStr,
            day: adjustedDate.toLocaleDateString('es-ES', { weekday: 'short' })
          };
        });
        
        // Asegurar que tenemos exactamente 7 días incluyendo hoy
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Si no tenemos datos para hoy, agregarlo
        const hasToday = adjustedData.some((day: DailyActivity) => day.date === todayStr);
        if (!hasToday) {
          // console.log('🔧 Frontend: Adding today to weekly data');
          adjustedData.push({
            date: todayStr,
            day: today.toLocaleDateString('es-ES', { weekday: 'short' }),
            newContacts: 0,
            botResponses: 0,
            humanResponses: 0,
            conversions: 0
          });
        }
        
        // Mantener solo los últimos 7 días y ordenar
        const finalData = adjustedData
          .sort((a: DailyActivity, b: DailyActivity) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7);
        
        // console.log('✅ Frontend: Final adjusted weekly activity:', finalData);
        setWeeklyActivity(finalData);
      } else {
        // console.log('⚠️ Frontend: Weekly activity API call not successful, using fallback data');
        // Generate activity based on contact creation dates with realistic bot/agent data
        
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          // Incluir hoy (i=0) hasta hace 6 días (i=6)
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          
          // Contar contactos del día específico
          const dayContacts = contacts.filter(contact => {
            const contactDate = new Date(contact.creadoEn);
            const contactDateStr = contactDate.toISOString().split('T')[0];
            return contactDateStr === dateStr;
          });

          // console.log(`📊 Frontend fallback ${dateStr} (${date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })}):`, {
          //   dayContacts: dayContacts.length,
          //   isToday: dateStr === todayStr,
          //   contactsForDay: dayContacts.map(c => ({ 
          //     id: c.id, 
          //     originalDate: c.creadoEn,
          //     parsedDate: new Date(c.creadoEn).toISOString().split('T')[0]
          //   }))
          // });

          // Usar estimaciones más realistas basadas en contactos reales
          const newContactsCount = dayContacts.length;
          // Si hay contactos nuevos, habrá más actividad de bot
          const estimatedBotResponses = newContactsCount > 0 ? Math.max(1, Math.floor(newContactsCount * 3.5)) : 0;
          const estimatedHumanResponses = newContactsCount > 0 ? Math.max(0, Math.floor(newContactsCount * 0.3)) : 0;

          return {
            date: dateStr,
            day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
            newContacts: newContactsCount,
            botResponses: estimatedBotResponses,
            humanResponses: estimatedHumanResponses,
            conversions: 0
          };
        });

        // console.log('📊 Frontend: Generated fallback weekly activity (including today):', last7Days);
        setWeeklyActivity(last7Days);
      }
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      setWeeklyActivity([]);
    }
  }, [BACKEND_URL, lineId, contacts]);

  // Registrar handler para actualizaciones de contacto
  useEffect(() => {
    // console.log('🔌 ANALYTICS: Registrando handler de WebSocket...');
    
    registerContactUpdateHandler(() => {
      // console.log('🔥 ANALYTICS: Contacto actualizado via WebSocket');
      // Recargar datos cuando se actualice un contacto
      fetchApiMetrics();
      fetchWeeklyActivity();
    });
  }, [registerContactUpdateHandler, fetchApiMetrics, fetchWeeklyActivity]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchApiMetrics(),
        fetchWeeklyActivity()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchApiMetrics, fetchWeeklyActivity]);
  
  // Calculate today's new contacts based on creation date (timezone aware)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const newContactsToday = contacts.filter(contact => {
    const contactDate = new Date(contact.creadoEn);
    const contactDateStr = contactDate.toISOString().split('T')[0];
    // console.log('🔍 Frontend: Checking contact date:', {
    //   contactId: contact.id,
    //   originalDate: contact.creadoEn,
    //   contactDateStr,
    //   todayStr,
    //   matches: contactDateStr === todayStr
    // });
    return contactDateStr === todayStr;
  }).length;

  // console.log('📊 Frontend: Today contacts calculation:', {
  //   todayStr,
  //   newContactsToday,
  //   totalContacts: contacts.length
  // });

  // Calculate conversion funnel based on real data
  const conversionFunnel = [
    {
      stage: 'Nuevos Contactos',
      count: stats?.nuevoLead || 0,
      percentage: stats?.total ? Math.round(((stats?.nuevoLead || 0) / stats.total) * 100) : 0,
      color: 'bg-blue-500',
      icon: Users
    },
    {
      stage: 'En Contacto',
      count: stats?.enContacto || 0,
      percentage: stats?.total ? Math.round(((stats?.enContacto || 0) / stats.total) * 100) : 0,
      color: 'bg-yellow-500',
      icon: MessageSquare
    },
    {
      stage: 'Citas Agendadas',
      count: stats?.citaAgendada || 0,
      percentage: stats?.total ? Math.round(((stats?.citaAgendada || 0) / stats.total) * 100) : 0,
      color: 'bg-purple-500',
      icon: Clock
    },
    {
      stage: 'Atención Cliente',
      count: stats?.atencionCliente || 0,
      percentage: stats?.total ? Math.round(((stats?.atencionCliente || 0) / stats.total) * 100) : 0,
      color: 'bg-orange-500',
      icon: Target
    },
    {
      stage: 'Ticket de pago generado',
      count: stats?.cerrado || 0,
      percentage: stats?.conversion || 0,
      color: 'bg-green-500',
      icon: CheckCircle
    }
  ];

  // Calculate real response metrics based on API data
  const responseMetrics = apiMetrics ? {
    tokensUsed: apiMetrics.tokensUsed,
    tokensLimit: apiMetrics.tokensLimit,
    tokensPercentage: (apiMetrics.tokensUsed / apiMetrics.tokensLimit) * 100,
    botResponses: apiMetrics.botResponses,
    humanResponses: apiMetrics.humanResponses,
    totalResponses: apiMetrics.botResponses + apiMetrics.humanResponses,
    botPercentage: apiMetrics.botResponses + apiMetrics.humanResponses > 0 
      ? Math.round((apiMetrics.botResponses / (apiMetrics.botResponses + apiMetrics.humanResponses)) * 100)
      : 0,
    humanPercentage: apiMetrics.botResponses + apiMetrics.humanResponses > 0
      ? Math.round((apiMetrics.humanResponses / (apiMetrics.botResponses + apiMetrics.humanResponses)) * 100)
      : 0,
    averageResponseTime: apiMetrics.averageResponseTime,
    satisfactionRate: apiMetrics.satisfactionRate
  } : {
    tokensUsed: 0,
    tokensLimit: 3000000,
    tokensPercentage: 0,
    botResponses: 0,
    humanResponses: 0,
    totalResponses: 0,
    botPercentage: 0,
    humanPercentage: 0,
    averageResponseTime: 0,
    satisfactionRate: 0
  };

  // Debug logging
  // console.log('🔢 Frontend: Response metrics calculated:', responseMetrics);

  // Priority distribution based on actual contacts
  const priorityDistribution = {
    alta: contacts.filter(c => c.prioridad === 'alta').length,
    media: contacts.filter(c => c.prioridad === 'media').length,
    baja: contacts.filter(c => c.prioridad === 'baja').length
  };

  // Use real weekly activity data
  const maxActivity = weeklyActivity.length > 0 
    ? Math.max(...weeklyActivity.map(d => Math.max(d.newContacts, d.botResponses, d.humanResponses)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nuevos Contactos Hoy</p>
              <p className="text-3xl font-bold text-foreground">{newContactsToday}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Contactos creados hoy
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tokens API Meta</p>
              <p className="text-2xl font-bold text-foreground">
                {(responseMetrics.tokensUsed / 1000).toFixed(0)}k/{(responseMetrics.tokensLimit / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Activity className="w-3 h-3 mr-1" />
                {responseMetrics.tokensPercentage < 1 && responseMetrics.tokensPercentage > 0
                  ? `${responseMetrics.tokensPercentage.toFixed(5)}%`
                  : `${Math.round(responseMetrics.tokensPercentage)}%`
                } usado
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Embudo de Conversión
          </h3>
          
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-foreground">{stage.count}</span>
                      <span className="text-xs text-muted-foreground">({stage.percentage}%)</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${stage.color} transition-all duration-300`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                  
                  {index < conversionFunnel.length - 1 && (
                    <div className="absolute left-2 -bottom-2 w-0.5 h-4 bg-gray-300 dark:bg-gray-600"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Response Analytics - Bot vs Agent Only */}
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-primary" />
            Respuestas IA vs Humanas
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{responseMetrics.botPercentage}%</span>
              </div>
              <p className="text-sm font-medium text-foreground">Respuestas Bot</p>
              <p className="text-xs text-muted-foreground mt-1">
                {responseMetrics.botResponses.toLocaleString()} mensajes de bot
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{responseMetrics.humanPercentage}%</span>
              </div>
              <p className="text-sm font-medium text-foreground">Respuestas Humanas</p>
              <p className="text-xs text-muted-foreground mt-1">
                {responseMetrics.humanResponses.toLocaleString()} mensajes de agente
              </p>
            </div>
          </div>

          {/* API Usage Progress Bar */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-foreground">Uso de Tokens API Meta</p>
              <p className="text-sm text-muted-foreground">
                {responseMetrics.tokensUsed.toLocaleString()} / {responseMetrics.tokensLimit.toLocaleString()}
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  responseMetrics.tokensPercentage > 80 ? 'bg-red-500' : 
                  responseMetrics.tokensPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(responseMetrics.tokensPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {responseMetrics.tokensPercentage < 1 && responseMetrics.tokensPercentage > 0
                ? `${responseMetrics.tokensPercentage.toFixed(5)}%`
                : `${Math.round(responseMetrics.tokensPercentage)}%`
              } del límite mensual utilizado
              {responseMetrics.tokensPercentage > 80 && (
                <span className="text-red-500 ml-2">⚠️ Acercándose al límite</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Trends and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart - Simplified */}
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Actividad de los Últimos 7 Días
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : weeklyActivity.length > 0 ? (
            <div className="space-y-4">
              {weeklyActivity.map((day) => (
                <div key={day.date} className="flex items-center space-x-4">
                  <div className="w-16 text-xs font-medium text-muted-foreground">
                    <div>{day.day}</div>
                    <div className="text-[10px] text-muted-foreground/80">{new Date(day.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="flex space-x-1 h-8">
                      <div 
                        className="bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs transition-all duration-300 hover:bg-blue-600"
                        style={{ width: `${maxActivity > 0 ? (day.newContacts / maxActivity) * 100 : 0}%`, minWidth: day.newContacts > 0 ? '20px' : '0px' }}
                        title={`Nuevos contactos: ${day.newContacts}`}
                      >
                        {day.newContacts > 0 && day.newContacts}
                      </div>
                      <div 
                        className="bg-green-500 rounded-sm flex items-center justify-center text-white text-xs transition-all duration-300 hover:bg-green-600"
                        style={{ width: `${maxActivity > 0 ? (day.botResponses / maxActivity) * 100 : 0}%`, minWidth: day.botResponses > 0 ? '20px' : '0px' }}
                        title={`Respuestas Bot: ${day.botResponses}`}
                      >
                        {day.botResponses > 0 && day.botResponses}
                      </div>
                      <div 
                        className="bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs transition-all duration-300 hover:bg-orange-600"
                        style={{ width: `${maxActivity > 0 ? (day.humanResponses / maxActivity) * 100 : 0}%`, minWidth: day.humanResponses > 0 ? '20px' : '0px' }}
                        title={`Respuestas Agent: ${day.humanResponses}`}
                      >
                        {day.humanResponses > 0 && day.humanResponses}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay datos de actividad disponibles</p>
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-muted-foreground">Nuevos Contactos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-muted-foreground">Respuestas Bot</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
              <span className="text-muted-foreground">Respuestas Agent</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Distribución por Prioridad
          </h3>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                {/* Simple pie chart representation */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 relative overflow-hidden">
                  <div className="absolute inset-4 bg-white dark:bg-[hsl(240,10%,14%)] rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{contacts.length}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">Alta Prioridad</span>
                </div>
                <span className="text-sm font-bold text-foreground">{priorityDistribution.alta}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">Media Prioridad</span>
                </div>
                <span className="text-sm font-bold text-foreground">{priorityDistribution.media}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">Baja Prioridad</span>
                </div>
                <span className="text-sm font-bold text-foreground">{priorityDistribution.baja}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;

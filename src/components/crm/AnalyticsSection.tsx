"use client";

import { BarChart3, TrendingUp, TrendingDown, Users, Clock, Target, MessageSquare, CheckCircle } from "lucide-react";
import type { Contact, AnalyticsStats } from "../../types/dashboard";

interface AnalyticsSectionProps {
  contacts: Contact[];
  stats: AnalyticsStats | null;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ contacts, stats }) => {
  
  // Calculate conversion funnel
  const conversionFunnel = [
    {
      stage: 'Nuevos Leads',
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
      stage: 'Cerrados',
      count: stats?.cerrado || 0,
      percentage: stats?.conversion || 0,
      color: 'bg-green-500',
      icon: CheckCircle
    }
  ];

  // Calculate response times (mock data for demo)
  const responseTimeStats = {
    average: '4.2min',
    aiResponses: '78%',
    humanResponses: '22%',
    satisfactionRate: '4.2/5'
  };

  // Priority distribution
  const priorityDistribution = {
    alta: contacts.filter(c => c.prioridad === 'alta').length,
    media: contacts.filter(c => c.prioridad === 'media').length,
    baja: contacts.filter(c => c.prioridad === 'baja').length
  };

  // Recent activity trends (last 7 days mock)
  const activityTrends = [
    { day: 'Lun', newContacts: 12, responses: 45, conversions: 3 },
    { day: 'Mar', newContacts: 8, responses: 32, conversions: 2 },
    { day: 'Mié', newContacts: 15, responses: 58, conversions: 4 },
    { day: 'Jue', newContacts: 10, responses: 41, conversions: 3 },
    { day: 'Vie', newContacts: 18, responses: 67, conversions: 5 },
    { day: 'Sáb', newContacts: 6, responses: 23, conversions: 1 },
    { day: 'Dom', newContacts: 4, responses: 15, conversions: 1 }
  ];

  const maxActivity = Math.max(...activityTrends.map(d => Math.max(d.newContacts, d.responses)));

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-bold text-foreground">{stats?.total || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% este mes
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
              <p className="text-sm font-medium text-muted-foreground">Tasa de Conversión</p>
              <p className="text-3xl font-bold text-foreground">{stats?.conversion || 0}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3% esta semana
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiempo de Respuesta</p>
              <p className="text-3xl font-bold text-foreground">{responseTimeStats.average}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingDown className="w-3 h-3 mr-1" />
                -15% más rápido
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chats Activos</p>
              <p className="text-3xl font-bold text-foreground">{stats?.enContacto || 0}</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <MessageSquare className="w-3 h-3 mr-1" />
                Ahora mismo
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
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

        {/* Response Analytics */}
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            Respuestas IA vs Humanas
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{responseTimeStats.aiResponses}</span>
              </div>
              <p className="text-sm font-medium text-foreground">Respuestas IA</p>
              <p className="text-xs text-muted-foreground mt-1">De todas las respuestas este mes</p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Tiempo promedio:</p>
                <p className="text-sm font-semibold text-foreground">0.3 seg</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Satisfacción:</p>
                <p className="text-sm font-semibold text-foreground">4.2/5</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{responseTimeStats.humanResponses}</span>
              </div>
              <p className="text-sm font-medium text-foreground">Respuestas Humanas</p>
              <p className="text-xs text-muted-foreground mt-1">Casos escalados a operadores</p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Tiempo promedio:</p>
                <p className="text-sm font-semibold text-foreground">4.2 min</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Satisfacción:</p>
                <p className="text-sm font-semibold text-foreground">4.6/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trends and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white dark:bg-[hsl(240,10%,14%)] rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Actividad de los Últimos 7 Días
          </h3>
          
          <div className="space-y-4">
            {activityTrends.map((day) => (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-8 text-xs font-medium text-muted-foreground">
                  {day.day}
                </div>
                
                <div className="flex-1 relative">
                  <div className="flex space-x-1 h-8">
                    <div 
                      className="bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs"
                      style={{ width: `${(day.newContacts / maxActivity) * 100}%`, minWidth: '20px' }}
                    >
                      {day.newContacts}
                    </div>
                    <div 
                      className="bg-green-500 rounded-sm flex items-center justify-center text-white text-xs"
                      style={{ width: `${(day.responses / maxActivity) * 100}%`, minWidth: '20px' }}
                    >
                      {day.responses}
                    </div>
                  </div>
                </div>
                
                <div className="w-8 text-xs font-medium text-right text-muted-foreground">
                  {day.conversions}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-muted-foreground">Nuevos Contactos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-muted-foreground">Respuestas</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Conversiones</span>
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

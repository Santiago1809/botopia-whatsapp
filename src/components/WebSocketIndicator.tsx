import React from 'react';
import { useCRMWebSocket } from '../hooks/useCRMWebSocket';

interface WebSocketIndicatorProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'fixed' | 'relative';
}

/**
 * Componente para mostrar el estado de la conexión WebSocket
 * Indicador visual que muestra si el tiempo real está activo
 */
export const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({
  className = '',
  showText = true,
  size = 'md',
  position = 'relative'
}) => {
  const { isConnected, connectionError, connectionStatus, isHealthy } = useCRMWebSocket();

  // Configuración de estilos basada en el tamaño
  const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-sm',
    lg: 'w-4 h-4 text-base'
  };

  // Configuración de posición
  const positionClasses = position === 'fixed' 
    ? 'fixed top-4 right-4 z-50' 
    : 'inline-flex';

  // Estado y colores
  const getStatusConfig = () => {
    if (isHealthy()) {
      return {
        color: 'bg-green-500',
        text: 'Tiempo Real Activo',
        icon: '🟢',
        pulse: 'animate-pulse'
      };
    } else if (connectionStatus === 'connecting') {
      return {
        color: 'bg-yellow-500',
        text: 'Conectando...',
        icon: '🟡',
        pulse: 'animate-pulse'
      };
    } else if (connectionError) {
      return {
        color: 'bg-red-500',
        text: 'Error de Conexión',
        icon: '🔴',
        pulse: ''
      };
    } else {
      return {
        color: 'bg-gray-500',
        text: 'Desconectado',
        icon: '⚫',
        pulse: ''
      };
    }
  };

  const status = getStatusConfig();

  return (
    <div className={`${positionClasses} items-center space-x-2 ${className}`}>
      {/* Indicador visual */}
      <div className="relative flex items-center">
        <div 
          className={`
            ${sizeClasses[size]} 
            ${status.color} 
            rounded-full 
            ${status.pulse}
          `}
        />
        {/* Efecto de pulsación para conexión activa */}
        {isHealthy() && (
          <div 
            className={`
              absolute 
              ${sizeClasses[size]} 
              ${status.color} 
              rounded-full 
              animate-ping 
              opacity-75
            `}
          />
        )}
      </div>

      {/* Texto descriptivo */}
      {showText && (
        <span 
          className={`
            ${sizeClasses[size]} 
            font-medium
            ${isHealthy() ? 'text-green-600' : connectionError ? 'text-red-600' : 'text-gray-600'}
          `}
        >
          {status.text}
        </span>
      )}

      {/* Información adicional en hover */}
      <div className="group relative">
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
          <div>Estado: {connectionStatus}</div>
          <div>Conectado: {isConnected ? 'Sí' : 'No'}</div>
          {connectionError && <div>Error: {connectionError}</div>}
          {/* Flecha del tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para usar el indicador WebSocket en componentes
 */
export const useWebSocketIndicator = () => {
  const { isConnected, connectionError, connectionStatus, isHealthy } = useCRMWebSocket();

  return {
    isConnected,
    connectionError,
    connectionStatus,
    isHealthy: isHealthy(),
    // Métodos de utilidad
    getStatusText: () => {
      if (isHealthy()) return 'Tiempo Real Activo';
      if (connectionStatus === 'connecting') return 'Conectando...';
      if (connectionError) return 'Error de Conexión';
      return 'Desconectado';
    },
    getStatusColor: () => {
      if (isHealthy()) return 'green';
      if (connectionStatus === 'connecting') return 'yellow';
      if (connectionError) return 'red';
      return 'gray';
    },
    getStatusIcon: () => {
      if (isHealthy()) return '🟢';
      if (connectionStatus === 'connecting') return '🟡';
      if (connectionError) return '🔴';
      return '⚫';
    }
  };
};

export default WebSocketIndicator;

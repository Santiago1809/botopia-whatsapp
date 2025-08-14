'use client';

import { useEffect, useState } from 'react';
import { useCRMWebSocket } from '@/hooks/useCRMWebSocket';

interface WebSocketDebuggerProps {
  lineId: string;
}

export const WebSocketDebugger: React.FC<WebSocketDebuggerProps> = ({ lineId }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const wsHook = useCRMWebSocket({ 
    lineId,
    userId: 'debug-user',
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005'
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Log conexión inicial
    addLog(`🔌 Inicializando WebSocket para línea: ${lineId}`);
    
    // Registrar handlers de debug
    wsHook.registerMessageHandler((message) => {
      addLog(`📨 Mensaje recibido: ${message.sender} -> ${message.message.substring(0, 30)}...`);
    });

    wsHook.registerContactUpdateHandler((update) => {
      addLog(`🔄 Contacto actualizado: ${update.id} (${update.funnel_stage})`);
    });

    // Log estado de conexión
    const interval = setInterval(() => {
      const info = wsHook.getConnectionInfo();
      if (info.isConnected && info.connectionStatus === 'connected') {
        addLog(`✅ WebSocket conectado: ${info.socketId}`);
      } else {
        addLog(`❌ WebSocket desconectado: ${info.connectionStatus}`);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lineId, wsHook]);

  // Auto-mostrar si hay problemas de conexión
  useEffect(() => {
    if (wsHook.connectionError || wsHook.connectionStatus === 'error') {
      setIsVisible(true);
      addLog(`🚨 Error de conexión: ${wsHook.connectionError}`);
    }
  }, [wsHook.connectionError, wsHook.connectionStatus]);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug WS
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-green-400 p-4 rounded font-mono text-xs max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">WebSocket Debug</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1 max-h-32 overflow-y-auto">
        <div className="text-blue-400">
          Estado: {wsHook.isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </div>
        <div className="text-blue-400">
          Status: {wsHook.connectionStatus}
        </div>
        {wsHook.connectionError && (
          <div className="text-red-400">Error: {wsHook.connectionError}</div>
        )}
        
        <div className="border-t border-gray-600 my-2"></div>
        
        {logs.map((log, idx) => (
          <div key={idx} className="text-xs">
            {log}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 mt-2">
        <button 
          onClick={() => wsHook.reconnect()}
          className="bg-yellow-600 px-2 py-1 rounded text-xs"
        >
          Reconectar
        </button>
        <button 
          onClick={() => setLogs([])}
          className="bg-gray-600 px-2 py-1 rounded text-xs"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default WebSocketDebugger;


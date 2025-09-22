"use client";

import { ArrowLeft, Bell, Plus, Minus } from "lucide-react";
import Image from "next/image";
import type { Line } from "../../types/dashboard";
import { useCallback, useEffect, useState } from "react";

interface DashboardHeaderProps {
  line: Line;
  totalContacts: number;
  onBackClick: () => void;
}

export default function DashboardHeader({ 
  line, 
  totalContacts, 
  onBackClick 
}: DashboardHeaderProps) {
  const displayName = (line.nombreLinea?.trim() || line.numero);
  const photoUrl = line.fotoLinea?.trim() || '';
  const [isPhonesOpen, setIsPhonesOpen] = useState(false);
  const [phones, setPhones] = useState<string[]>([]);
  const [phoneCount, setPhoneCount] = useState(2); // Inicialmente mostrar 2 campos
  // Derivar y editar sólo los 10 dígitos locales en UI; almacenamos '57'+local
  const localPart = (full?: string) => (full || '').replace(/\D/g, '').replace(/^57/, '').slice(-10);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL2 || 'http://localhost:5005';

  const fetchPhones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/lines/${line.id}/attention-phones`);
      if (res.ok) {
        const payload = await res.json();
        setPhones(payload.data?.attentionPhones || []);
      }
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, line.id]);

  useEffect(() => {
    if (isPhonesOpen) fetchPhones();
  }, [isPhonesOpen, fetchPhones]);

  // Ajustar phoneCount cuando se cargan los números existentes
  useEffect(() => {
    const validPhones = phones.filter(p => p && p.length > 0).length;
    setPhoneCount(Math.max(2, validPhones || 2));
  }, [phones]);

  const savePhones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/lines/${line.id}/attention-phones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones })
      });
      if (res.ok) {
        setIsPhonesOpen(false);
      } else {
        alert('Error guardando teléfonos');
      }
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, line.id, phones]);
  
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-white relative">
      <div className="px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackClick}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              {/* Desktop: mostrar nombre completo + proveedor */}
              <h1 className="hidden md:block text-2xl font-bold">
                {displayName} • {line.proveedor}
              </h1>
              {/* Mobile: solo mostrar el nombre sin proveedor */}
              <h1 className="block md:hidden text-2xl font-bold">
                {displayName}
              </h1>
              {/* Desktop: formato original */}
              <p className="hidden md:block text-white/80 mt-1">
                Línea {line.numero} • {totalContacts} contactos
              </p>
              {/* Mobile: mostrar en formato solicitado */}
              <p className="block md:hidden text-white/80 mt-1">
                Línea {line.numero}
              </p>
              <p className="block md:hidden text-white/60 text-sm">
                {totalContacts} contactos
              </p>
            </div>
          </div>
          
          {/* Desktop: mostrar badge + imagen pequeña */}
          <div className="hidden md:flex space-x-4 items-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white/90 text-gray-800">
              {line.estaActivo ? 'Activa' : 'Inactiva'}
            </span>
            {/* Campanita para configurar teléfonos de atención */}
            <button
              title="Editar teléfonos de atención"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setIsPhonesOpen(true)}
            >
              <Bell className="w-5 h-5" />
            </button>
            {photoUrl && (
              <Image
                src={photoUrl}
                alt={`Foto de ${displayName}`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
              />
            )}
          </div>
          
          {/* Mobile: imagen + campanita editable */}
          <div className="flex md:hidden items-center gap-3">
            <button
              title="Editar teléfonos de atención"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setIsPhonesOpen(true)}
            >
              <Bell className="w-5 h-5" />
            </button>
            {photoUrl && (
              <Image
                src={photoUrl}
                alt={`Foto de ${displayName}`}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal sencillo para editar teléfonos de atención */}
      {isPhonesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsPhonesOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Teléfonos de atención</h3>
            <p className="text-sm text-muted-foreground mb-3">Estos números recibirán las plantillas de aviso cuando un contacto pase a atención al cliente.</p>

            {Array.from({ length: phoneCount }, (_, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-muted-foreground">Número {idx+1}</label>
                  {idx >= 2 && (
                    <button
                      onClick={() => {
                        // Remover este campo específico y ajustar el contador
                        setPhones(prev => {
                          const next = [...prev];
                          next.splice(idx, 1);
                          return next;
                        });
                        setPhoneCount(prev => Math.max(2, prev - 1));
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="Eliminar este número"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded border bg-gray-100 text-gray-700 whitespace-nowrap inline-flex items-center gap-2" title="Colombia">
                    <span role="img" aria-label="Bandera de Colombia">🇨🇴</span>
                    +57
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={localPart(phones[idx])}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0,10);
                      const full = onlyDigits ? `57${onlyDigits}` : '';
                      setPhones(prev => {
                        const next = [...prev];
                        next[idx] = full;
                        return next;
                      });
                    }}
                    placeholder="3001234567"
                    className="w-full px-3 py-2 rounded border bg-background text-foreground"
                  />
                </div>
              </div>
            ))}

            {/* Botón para agregar más números */}
            {phoneCount < 4 && (
              <button
                onClick={() => setPhoneCount(prev => Math.min(4, prev + 1))}
                className="w-full mb-4 px-3 py-2 rounded border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 text-gray-600 hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar número ({phoneCount}/4)
              </button>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setIsPhonesOpen(false)}
                disabled={loading}
              >Cancelar</button>
              <button
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
                onClick={savePhones}
                disabled={loading}
              >{loading ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

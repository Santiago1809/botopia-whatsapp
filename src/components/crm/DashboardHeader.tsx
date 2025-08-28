"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { Line } from "../../types/dashboard";

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
          
          {/* Mobile: solo imagen más grande, sin badge */}
          <div className="block md:hidden">
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
    </div>
  );
}

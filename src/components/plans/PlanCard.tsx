// components/plans/PlanCard.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";
import { Phone, GitBranch, Check } from 'lucide-react';

interface PlanCardProps {
  id: string;
  title: string;
  phones: string;
  flows: string;
  credits: string;
  creditPrice: string;
  price: string;
  features: string[];
  description: string;
  isPro?: boolean;
  popular?: boolean;
  isSelected: boolean;
  loading: boolean;
  onSelect: (id: string) => void;
  theme: {
    gradient: string;
    text: string;
    border: string;
    button: string;
    icon: string;
  };
}

export function PlanCard({
  id,
  title,
  phones,
  flows,
  credits,
  creditPrice,
  price,
  features,
  description,
  isPro,
  popular,
  isSelected,
  loading,
  onSelect,
  theme,
}: PlanCardProps) {
  return (
    <div
      className={`flex flex-col h-full rounded-2xl p-6 transition-all duration-200 bg-gradient-to-br ${
        theme.gradient
      } ${
        isSelected
          ? `ring-2 ${theme.border} shadow-lg`
          : `border ${theme.border} hover:shadow-md`
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Popular ⚡
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-xl font-bold ${theme.text} mb-2`}>{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${theme.text}`}>{creditPrice}</span>
          <span className="text-gray-500">USD / mes</span>
        </div>
        <span className="text-sm text-gray-500">{credits}</span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Phone className={`w-5 h-5 ${theme.icon}`} />
          <span>{phones}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <GitBranch className={`w-5 h-5 ${theme.icon}`} />
          <span>{flows}</span>
        </div>
      </div>

      <div className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className={`w-5 h-5 ${theme.icon} shrink-0 mt-0.5`} />
              <span className="text-gray-600 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onSelect(id)}
        disabled={loading}
        className={`w-full mt-8 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          isSelected
            ? `${theme.button} text-white`
            : `bg-white/50 ${theme.text} hover:bg-white`
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Seleccionar Plan
      </button>
    </div>
  );
}

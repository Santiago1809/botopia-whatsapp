"use client";

import { useState, useCallback } from "react";
import type { Contact, AnalyticsStats } from "../types/dashboard";

interface UseDashboardFiltersProps {
  allContacts: Contact[];
}

export function useDashboardFilters({ allContacts }: UseDashboardFiltersProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter contacts based on selected tags and search term
  const filteredContacts = allContacts.filter(contact => {
    const matchesSearch = searchTerm === "" || 
      contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.telefono.includes(searchTerm);
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => contact.etiquetas.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Toggle tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedTags([]);
    setSearchTerm("");
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Analytics stats calculation
  const analyticsStats: AnalyticsStats = {
    total: allContacts.length,
    pendienteDocumentacion: 0, // Removed but kept for compatibility
    nuevoLead: allContacts.filter(c => c.status === 'nuevo-lead').length,
    enContacto: allContacts.filter(c => c.status === 'en-contacto').length,
    citaAgendada: allContacts.filter(c => c.status === 'cita-agendada').length,
    atencionCliente: allContacts.filter(c => c.status === 'atencion-cliente').length,
    cerrado: allContacts.filter(c => c.status === 'cerrado').length,
    conversion: allContacts.length > 0 ? 
      (allContacts.filter(c => c.status === 'cerrado').length / allContacts.length * 100) : 0,
  };

  // Debug logs
  // console.log('📊 Analytics Debug - Total contacts:', allContacts.length);
  // console.log('📊 All contacts details:', allContacts);
  // console.log('📊 Analytics stats:', analyticsStats);
  
  // Log each status group
  // console.log('🔵 Nuevo lead:', allContacts.filter(c => c.status === 'nuevo-lead'));
  // console.log('🟡 En contacto:', allContacts.filter(c => c.status === 'en-contacto'));
  // console.log('🟣 Cita agendada:', allContacts.filter(c => c.status === 'cita-agendada'));
  // console.log('🟠 Atención cliente:', allContacts.filter(c => c.status === 'atencion-cliente'));
  // console.log('🟢 Cerrado:', allContacts.filter(c => c.status === 'cerrado'));

  return {
    selectedTags,
    searchTerm,
    filteredContacts,
    analyticsStats,
    toggleTag,
    clearFilters,
    handleSearchChange
  };
}

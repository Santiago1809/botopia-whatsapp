import { useState, memo } from 'react';
import { NodeProps } from 'reactflow';
import { SupabaseUI, demoSupabaseProjects } from './diseño';

// Componente de nodo personalizado para Supabase
function SupabaseNode({  }: NodeProps) {
  const [selectedProject, setSelectedProject] = useState(demoSupabaseProjects[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectProject = (project: typeof demoSupabaseProjects[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedProject(project);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <SupabaseUI
      selectedProject={selectedProject}
      projects={demoSupabaseProjects}
      isLoading={isLoading}
      onSelectProject={handleSelectProject}
    />
  );
}

// Exportar el componente como memo para optimizar renderizados
export default memo(SupabaseNode);
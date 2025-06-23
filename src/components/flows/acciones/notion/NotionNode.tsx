import { useState } from 'react';
import { NotionUI, demoNotionWorkspaces } from './diseño';

export function NotionNode() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(demoNotionWorkspaces[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectWorkspace = (workspace: typeof demoNotionWorkspaces[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedWorkspace(workspace);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <NotionUI
      selectedWorkspace={selectedWorkspace}
      workspaces={demoNotionWorkspaces}
      isLoading={isLoading}
      onSelectWorkspace={handleSelectWorkspace}
    />
  );
}
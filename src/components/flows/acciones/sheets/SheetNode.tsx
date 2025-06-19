import { useState } from 'react';
import { GoogleSheetsUI, demoGoogleSheets } from './diseño';

export function GoogleSheetsNode(/* _props: NodeProps */) {
  const [selectedSheet, setSelectedSheet] = useState(demoGoogleSheets[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectSheet = (sheet: typeof demoGoogleSheets[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedSheet(sheet);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <GoogleSheetsUI
      selectedSheet={selectedSheet}
      sheets={demoGoogleSheets}
      isLoading={isLoading}
      onSelectSheet={handleSelectSheet}
    />
  );
}
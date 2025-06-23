import { useState } from 'react';
import { GmailUI, demoGmailAccounts } from './diseño';

export function GmailNode() {
  const [selectedAccount, setSelectedAccount] = useState(demoGmailAccounts[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectAccount = (account: typeof demoGmailAccounts[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedAccount(account);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <GmailUI
      selectedAccount={selectedAccount}
      accounts={demoGmailAccounts}
      isLoading={isLoading}
      onSelectAccount={handleSelectAccount}
    />
  );
}
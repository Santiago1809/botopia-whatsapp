import { useState } from 'react';
import { GoogleCalendarUI, demoCalendarAccounts } from './diseño';

export function GoogleCalendarNode() {
  const [selectedAccount, setSelectedAccount] = useState(demoCalendarAccounts[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectAccount = (account: typeof demoCalendarAccounts[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedAccount(account);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <GoogleCalendarUI
      selectedAccount={selectedAccount}
      accounts={demoCalendarAccounts}
      isLoading={isLoading}
      onSelectAccount={handleSelectAccount}
    />
  );
}
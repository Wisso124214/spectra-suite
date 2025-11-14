import { useContext } from 'react';
import AppContext, { type AppContextType } from '@/contexts/AppContext';

export function useAppContext(): AppContextType {
  const ctx = useContext(
    AppContext as unknown as React.Context<AppContextType | undefined>
  );
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}

export default useAppContext;

import React, { createContext, useContext } from 'react';
import { useAbhangas } from '../hooks/useAbhangas';
import { useFavorites } from '../hooks/useFavorites';
import { useUserAbhangas } from '../hooks/useUserAbhangas';

type AppContextValue = {
  abhangas: ReturnType<typeof useAbhangas>;
  favorites: ReturnType<typeof useFavorites>;
  userAbhangas: ReturnType<typeof useUserAbhangas>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const userAbhangsHook = useUserAbhangas();
  const abhangasHook = useAbhangas(userAbhangsHook.userAbhangas);
  const favoritesHook = useFavorites();

  return (
    <AppContext.Provider
      value={{
        abhangas: abhangasHook,
        favorites: favoritesHook,
        userAbhangas: userAbhangsHook,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

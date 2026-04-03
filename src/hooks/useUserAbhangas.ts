import { useState, useEffect, useCallback } from 'react';
import { loadUserAbhangas, saveUserAbhangas } from '../storage/userAbhangas';
import type { Abhang } from '../types';

export function useUserAbhangas() {
  const [userAbhangas, setUserAbhangas] = useState<Abhang[]>([]);

  useEffect(() => {
    loadUserAbhangas().then(setUserAbhangas);
  }, []);

  const addAbhang = useCallback((abhang: Abhang) => {
    setUserAbhangas(prev => {
      const next = [...prev, abhang];
      saveUserAbhangas(next);
      return next;
    });
  }, []);

  const updateAbhang = useCallback((id: string, updates: Partial<Abhang>) => {
    setUserAbhangas(prev => {
      const next = prev.map(a => (a.id === id ? { ...a, ...updates } : a));
      saveUserAbhangas(next);
      return next;
    });
  }, []);

  const deleteAbhang = useCallback((id: string) => {
    setUserAbhangas(prev => {
      const next = prev.filter(a => a.id !== id);
      saveUserAbhangas(next);
      return next;
    });
  }, []);

  return { userAbhangas, addAbhang, updateAbhang, deleteAbhang };
}

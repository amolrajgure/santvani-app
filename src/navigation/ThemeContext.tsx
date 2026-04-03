import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@santvani/theme';

export const LIGHT_COLORS = {
  primary: '#ff9800',
  primaryDark: '#e65100',
  primaryLight: '#fff3e0',
  primaryBorder: '#ffe0b2',
  background: '#f4f4f9',
  card: '#ffffff',
  text: '#333333',
  textMuted: '#666666',
  textFaint: '#999999',
  border: '#dddddd',
  highlight: '#fff176',
  clearBtn: '#dddddd',
  danger: '#e53935',
  userBadgeBg: '#e8f5e9',
  userBadgeBorder: '#a5d6a7',
  userBadgeText: '#2e7d32',
  meaningBorder: '#78909c',
  meaningLabel: '#78909c',
} as const;

export const DARK_COLORS = {
  primary: '#ff9800',
  primaryDark: '#ffb74d',
  primaryLight: '#2d1f00',
  primaryBorder: '#4d3500',
  background: '#121212',
  card: '#1e1e1e',
  text: '#e0e0e0',
  textMuted: '#aaaaaa',
  textFaint: '#555555',
  border: '#333333',
  highlight: '#4d3a00',
  clearBtn: '#444444',
  danger: '#ef5350',
  userBadgeBg: '#1a3a1c',
  userBadgeBorder: '#2e6630',
  userBadgeText: '#81c784',
  meaningBorder: '#546e7a',
  meaningLabel: '#90a4ae',
} as const;

export type AppColors = typeof LIGHT_COLORS;

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: AppColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark,
      toggleTheme: () => {
        setIsDark(prev => {
          const next = !prev;
          AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
          return next;
        });
      },
      colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

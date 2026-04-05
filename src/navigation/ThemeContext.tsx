import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@santvani/theme';

export const LIGHT_COLORS = {
  // Warm devotional palette
  primary: '#FF9800',
  primaryDark: '#E65100',
  primaryLight: '#FFF3E0',
  primaryBorder: '#FFE0B2',
  background: '#FFF8F0',      // warm cream
  surface: '#FFF3E0',         // light saffron tint
  card: '#FFFFFF',
  text: '#3E2000',            // warm dark brown
  textMuted: '#8D6E63',       // medium brown
  textFaint: '#BCAAA4',       // light brown-grey
  border: '#F0DDD0',          // warm border
  highlight: '#FFE082',       // warm amber highlight
  clearBtn: '#E0CFC0',
  danger: '#D84315',
  userBadgeBg: '#E8F5E9',
  userBadgeBorder: '#A5D6A7',
  userBadgeText: '#2E7D32',
  meaningBorder: '#A1887F',
  meaningLabel: '#8D6E63',
  drawerBg: '#FFF8F0',
  topBarBg: '#FFF8F0',
} as const;

export const DARK_COLORS = {
  primary: '#FF9800',
  primaryDark: '#FFB74D',
  primaryLight: '#2D1F00',
  primaryBorder: '#4D3500',
  background: '#1A1008',      // very dark warm brown
  surface: '#2D1A08',         // slightly lighter
  card: '#251608',            // dark warm card
  text: '#F5E6D0',            // warm off-white
  textMuted: '#C4956A',       // warm muted
  textFaint: '#7A5C3A',       // dim warm
  border: '#3D2810',          // dark warm border
  highlight: '#4D3A00',
  clearBtn: '#4A3020',
  danger: '#EF5350',
  userBadgeBg: '#1A3A1C',
  userBadgeBorder: '#2E6630',
  userBadgeText: '#81C784',
  meaningBorder: '#5D4037',
  meaningLabel: '#A1887F',
  drawerBg: '#251608',
  topBarBg: '#1A1008',
} as const;

export type AppColors = { [K in keyof typeof LIGHT_COLORS]: string };

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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'auto';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    tabBar: string;
    tabBarActive: string;
  };
}

const lightColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  primary: '#f97316',
  secondary: '#14B8A6',
  accent: '#F97316',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  tabBar: '#FFFFFF',
  tabBarActive: '#ef4444',
};

const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#f97316',
  secondary: '#2DD4BF',
  accent: '#FB923C',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  tabBar: '#1E293B',
  tabBarActive: '#ef4444',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('auto');
  
  const colorScheme: ColorScheme = theme === 'auto' 
    ? (systemColorScheme || 'light') 
    : theme === 'dark' ? 'dark' : 'light';
  
  const colors = colorScheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
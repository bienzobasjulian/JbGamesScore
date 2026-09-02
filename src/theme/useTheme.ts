import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import type { AppTheme, ColorScheme, ThemePreference } from './types';

type UseThemeResult = {
  theme: AppTheme;
  colorScheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isReady: boolean;
};

export function useTheme(): AppTheme {
  return useThemeContext().theme;
}

export function useThemeContext(): UseThemeResult {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

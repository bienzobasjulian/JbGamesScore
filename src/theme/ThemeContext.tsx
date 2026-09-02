import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { loadThemePreference, saveThemePreference } from './storage';
import { darkTheme, lightTheme } from './themes';
import type { AppTheme, ColorScheme, ThemePreference } from './types';

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isReady: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadThemePreference().then((stored) => {
      if (!cancelled) {
        setPreferenceState(stored);
        setIsReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const colorScheme: ColorScheme =
    preference === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : preference;

  const theme = colorScheme === 'light' ? lightTheme : darkTheme;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void saveThemePreference(next);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      preference,
      setPreference,
      isReady,
    }),
    [theme, colorScheme, preference, setPreference, isReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

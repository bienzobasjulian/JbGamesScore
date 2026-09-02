import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from './types';

export const THEME_PREFERENCE_KEY = '@jbgamesscore/theme-preference';

export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const raw = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // ignore read errors
  }
  return 'system';
}

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}

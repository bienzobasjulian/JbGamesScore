import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './useTheme';
import type { AppTheme } from './types';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: AppTheme) => T,
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
}

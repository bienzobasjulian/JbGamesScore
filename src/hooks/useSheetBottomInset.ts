import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/**
 * Inset inferior para bottom-sheets. En Android, un Modal transparente
 * a veces reporta 0 si el root ya aplicó el padding; el valor de ventana
 * cubre ese caso.
 */
export function useSheetBottomInset() {
  const insets = useSafeAreaInsets();
  const fromWindow = initialWindowMetrics?.insets.bottom ?? 0;
  return Math.max(insets.bottom, fromWindow);
}

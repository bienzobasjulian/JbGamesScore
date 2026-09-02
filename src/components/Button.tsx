import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.text : '#fff'} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' && styles.primaryLabel,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'danger' && styles.primaryLabel,
            variant === 'ghost' && styles.ghostLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.accent,
  },
  secondary: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  danger: {
    backgroundColor: theme.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: theme.onAccent,
  },
  secondaryLabel: {
    color: theme.text,
  },
  ghostLabel: {
    color: theme.textMuted,
    fontWeight: '600',
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Variant = 'matches' | 'players';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
};

const variants: Record<
  Variant,
  { bg: string; border: string; iconBg: string; text: string }
> = {
  matches: {
    bg: theme.accent + '18',
    border: theme.accent + '55',
    iconBg: theme.accent,
    text: theme.accent,
  },
  players: {
    bg: '#9B59B622',
    border: '#9B59B655',
    iconBg: '#9B59B6',
    text: '#C39BD3',
  },
};

export function SectionActionButton({
  label,
  onPress,
  variant = 'matches',
}: Props) {
  const colors = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.iconBg }]}>
        <Text style={styles.icon}>+</Text>
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});

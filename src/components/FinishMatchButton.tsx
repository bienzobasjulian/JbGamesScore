import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  onPress: () => void;
};

export function FinishMatchButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>🏁</Text>
      </View>
      <Text style={styles.label}>Finalizar partida</Text>
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
    borderColor: theme.warning + '55',
    backgroundColor: theme.warning + '12',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.warning,
  },
});

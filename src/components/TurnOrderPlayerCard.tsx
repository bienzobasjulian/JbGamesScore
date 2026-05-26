import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Player } from '../types';

type Props = {
  player: Player;
  isActive?: boolean;
  onDrag: () => void;
  onRemove: () => void;
};

export function TurnOrderPlayerCard({
  player,
  isActive = false,
  onDrag,
  onRemove,
}: Props) {
  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onLongPress={onDrag}
            delayLongPress={120}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <Text style={styles.iconText}>::</Text>
          </Pressable>

          <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
            <Text style={styles.removeText}>x</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardActive: {
    borderColor: theme.accent,
    backgroundColor: theme.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    opacity: 0.8,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  removeBtn: {
    padding: 4,
  },
  removeText: {
    fontSize: 18,
    color: theme.textMuted,
  },
});

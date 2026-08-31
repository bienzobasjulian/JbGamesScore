import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Flip7RoundEntry, Player } from '../types';
import {
  emptyFlip7RoundEntry,
  getFlip7EntryStripStatus,
  isFlip7Frozen,
} from '../utils/flip7';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  players: Player[];
  roundByPlayer: Record<string, Flip7RoundEntry>;
  turnPlayerId: string | null;
  focusedPlayerId: string;
  pendingDraws: Record<string, number>;
  onSelectPlayer: (playerId: string) => void;
};

export function Flip7PlayerStrip({
  players,
  roundByPlayer,
  turnPlayerId,
  focusedPlayerId,
  pendingDraws,
  onSelectPlayer,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      keyboardShouldPersistTaps="handled"
    >
      {players.map((player) => {
        const entry = roundByPlayer[player.id] ?? emptyFlip7RoundEntry();
        const isTurn = player.id === turnPlayerId;
        const isFocused = player.id === focusedPlayerId;
        const isFrozen = isFlip7Frozen(entry);
        const pending = pendingDraws[player.id] ?? 0;

        return (
          <Pressable
            key={player.id}
            onPress={() => onSelectPlayer(player.id)}
            style={({ pressed }) => [
              styles.chip,
              isFocused && styles.chipFocused,
              isTurn && styles.chipTurn,
              isFrozen && styles.chipFrozen,
              pressed && styles.chipPressed,
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: player.color }]}>
              <Text
                style={[
                  styles.avatarText,
                  { color: getPlayerAvatarTextColor(player.color) },
                ]}
              >
                {player.name.charAt(0).toUpperCase()}
              </Text>
              {pending > 0 ? (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{pending}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>
            <Text
              style={[styles.status, isFrozen && styles.statusFrozen]}
              numberOfLines={1}
            >
              {getFlip7EntryStripStatus(entry, isTurn)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    width: 88,
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipFocused: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '14',
  },
  chipTurn: {
    borderColor: theme.warning,
  },
  chipFrozen: {
    borderColor: '#5B9BD5',
    backgroundColor: '#5B9BD518',
  },
  chipPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  pendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.warning,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A2332',
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  status: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textMuted,
    textAlign: 'center',
  },
  statusFrozen: {
    color: '#5B9BD5',
    fontWeight: '800',
  },
});

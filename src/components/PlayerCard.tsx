import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Player } from '../types';
import { ScoreStepper } from './ScoreStepper';

type Props = {
  player: Player;
  total: number;
  roundScore: number;
  rank?: number;
  onAdjust: (delta: number) => void;
  onSetScore?: (value: number) => void;
  onRemove?: () => void;
  showRoundControls?: boolean;
  showTotal?: boolean;
  controlsDisabled?: boolean;
};

export function PlayerCard({
  player,
  total,
  roundScore,
  rank,
  onAdjust,
  onSetScore,
  onRemove,
  showRoundControls = true,
  showTotal = true,
  controlsDisabled,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>
            {rank !== undefined && rank <= 3 && (
              <View
                style={[
                  styles.badge,
                  rank === 1 && styles.gold,
                  rank === 2 && styles.silver,
                  rank === 3 && styles.bronze,
                ]}
              >
                <Text style={styles.badgeText}>#{rank}</Text>
              </View>
            )}
          </View>
          {showTotal && (
            <Text style={styles.totalLabel}>
              Total: <Text style={styles.total}>{total}</Text>
            </Text>
          )}
        </View>
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={12} style={styles.remove}>
            <Text style={styles.removeText}>✕</Text>
          </Pressable>
        )}
      </View>

      {showRoundControls && (
        <View style={styles.roundRow}>
          <Text style={styles.roundLabel}>Esta ronda</Text>
          <ScoreStepper
            value={roundScore}
            onAdjust={onAdjust}
            onSetValue={onSetScore ?? (() => {})}
            color={player.color}
            disabled={controlsDisabled}
          />
        </View>
      )}
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
    gap: 14,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.surfaceLight,
  },
  gold: { backgroundColor: '#F5A62333' },
  silver: { backgroundColor: '#8B9CB333' },
  bronze: { backgroundColor: '#CD7F3233' },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.warning,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.textMuted,
  },
  total: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.accent,
  },
  remove: {
    padding: 4,
  },
  removeText: {
    fontSize: 18,
    color: theme.textMuted,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  roundLabel: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '500',
  },
});

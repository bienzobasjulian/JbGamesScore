import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { PelusasPlayerCounts, Player } from '../types';
import {
  calculatePelusasScore,
  formatPelusasCardLabel,
  getPelusasCardValues,
} from '../utils/pelusas';
import { CardCountStepper } from './CardCountStepper';

type Props = {
  player: Player;
  counts: PelusasPlayerCounts;
  revolutionMode: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChangeCount: (cardValue: number, count: number) => void;
};

export function PelusasPlayerPanel({
  player,
  counts,
  revolutionMode,
  expanded,
  onToggle,
  onChangeCount,
}: Props) {
  const score = calculatePelusasScore(counts, revolutionMode);
  const cards = getPelusasCardValues(revolutionMode);

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.hint}>
            {expanded ? 'Ocultar cartas' : 'Contar cartas'}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Puntos</Text>
          <Text style={[styles.score, score < 0 && styles.scoreNegative]}>
            {score}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.grid}>
          {cards.map((cardValue) => (
            <View key={cardValue} style={styles.cardRow}>
              <View style={styles.cardLabelWrap}>
                <Text style={styles.cardLabel}>
                  {formatPelusasCardLabel(cardValue)}
                </Text>
                <Text style={styles.cardPts}>
                  {cardValue > 0 ? `×${cardValue} pt` : `${cardValue} pt`}
                </Text>
              </View>
              <CardCountStepper
                value={counts[String(cardValue)] ?? 0}
                onChange={(n) => onChangeCount(cardValue, n)}
                color={player.color}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  headerPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  scoreBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.accent,
  },
  scoreNegative: {
    color: theme.danger,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
    marginLeft: 4,
  },
  grid: {
    gap: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cardLabelWrap: {
    flex: 1,
    gap: 1,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
  cardPts: {
    fontSize: 12,
    color: theme.textMuted,
  },
});

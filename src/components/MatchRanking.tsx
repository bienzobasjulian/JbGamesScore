import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { RankedPlayer } from '../utils/match';

type Props = {
  ranking: RankedPlayer[];
};

const MEDAL = ['🥇', '🥈', '🥉'];

export function MatchRanking({ ranking }: Props) {
  if (ranking.length === 0) return null;

  const podiumOrder =
    ranking.length >= 3
      ? [ranking[1], ranking[0], ranking[2]]
      : ranking.length === 2
        ? [ranking[1], ranking[0]]
        : [ranking[0]];

  const podiumHeights =
    ranking.length >= 3 ? [72, 96, 56] : ranking.length === 2 ? [72, 96] : [88];

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Resultado</Text>

      <View style={styles.podiumRow}>
        {podiumOrder.map((entry, index) => {
          const place =
            ranking.length >= 3
              ? index === 0
                ? 2
                : index === 1
                  ? 1
                  : 3
              : ranking.length === 2
                ? index === 0
                  ? 2
                  : 1
                : 1;
          const height = podiumHeights[index];

          return (
            <View key={entry.player.id} style={styles.podiumCol}>
              <Text style={styles.medal}>
                {place <= 3 ? MEDAL[place - 1] : `#${place}`}
              </Text>
              <View
                style={[
                  styles.pedestal,
                  { height, borderColor: entry.player.color + '88' },
                  place === 1 && styles.pedestalFirst,
                ]}
              >
                <Text style={styles.pedestalScore}>{entry.total}</Text>
                <Text style={styles.pedestalPts}>pts</Text>
              </View>
              <View
                style={[styles.avatar, { backgroundColor: entry.player.color }]}
              >
                <Text style={styles.avatarText}>
                  {entry.player.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {entry.player.name}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>Clasificación</Text>
        {ranking.map((entry) => (
          <View key={entry.player.id} style={styles.listRow}>
            <Text style={styles.listRank}>#{entry.rank}</Text>
            <View
              style={[styles.listDot, { backgroundColor: entry.player.color }]}
            />
            <Text style={styles.listName} numberOfLines={1}>
              {entry.player.name}
            </Text>
            <Text style={styles.listScore}>{entry.total} pts</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 8,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    maxWidth: 110,
  },
  medal: {
    fontSize: 22,
  },
  pedestal: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  pedestalFirst: {
    backgroundColor: theme.accent + '18',
  },
  pedestalScore: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  pedestalPts: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: '600',
    marginTop: -2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  list: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  listRank: {
    width: 28,
    fontSize: 14,
    fontWeight: '800',
    color: theme.textMuted,
  },
  listDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  listScore: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.accent,
  },
});

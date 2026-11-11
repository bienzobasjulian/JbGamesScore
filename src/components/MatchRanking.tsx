import { StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { RankedPlayer } from '../utils/match';
import { PlayerAvatar } from './PlayerAvatar';
import { ScoreProgressFill } from './ScoreProgressFill';

type Props = {
  ranking: RankedPlayer[];
  showPodium?: boolean;
  /** Si la partida tiene un tope, la lista muestra el avance hacia esa meta. */
  pointsGoal?: number | null;
  note?: string | null;
};

const MEDAL = ['🥇', '🥈', '🥉'];

export function MatchRanking({
  ranking,
  showPodium = true,
  pointsGoal = null,
  note = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  if (ranking.length === 0) return null;

  const podiumOrder = showPodium
    ? ranking.length >= 3
      ? [ranking[1], ranking[0], ranking[2]]
      : ranking.length === 2
        ? [ranking[1], ranking[0]]
        : [ranking[0]]
    : [];

  const hasGoal = pointsGoal != null && pointsGoal > 0;

  const podiumHeights = showPodium
    ? ranking.length >= 3
      ? [72, 96, 56]
      : ranking.length === 2
        ? [72, 96]
        : [88]
    : [];

  return (
    <View style={styles.wrap}>
      {showPodium ? (
        <>
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
                  <PlayerAvatar
                    name={entry.player.name}
                    color={entry.player.color}
                    avatar={entry.player.avatar}
                    size={36}
                    radius={10}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entry.player.name}
                  </Text>
                </View>
              );
            })}
          </View>
          {note ? <Text style={styles.note}>{note}</Text> : null}
        </>
      ) : null}

      <View style={[styles.list, !showPodium && styles.listOnly]}>
        {ranking.map((entry) => {
          const goal = hasGoal ? pointsGoal : null;
          const reached = goal != null && entry.total >= goal;
          const behind = goal != null && entry.total < 0;
          const fill =
            goal != null ? Math.min(1, Math.max(0, entry.total) / goal) : 0;

          return (
            <View key={entry.player.id} style={styles.listItem}>
              <View style={styles.listRow}>
                <Text style={styles.listRank}>#{entry.rank}</Text>
                <PlayerAvatar
                  name={entry.player.name}
                  color={entry.player.color}
                  avatar={entry.player.avatar}
                  size={28}
                  radius={8}
                />
                <Text style={styles.listName} numberOfLines={1}>
                  {entry.player.name}
                </Text>
                <Text
                  style={[
                    styles.listScore,
                    reached && styles.listScoreReached,
                    behind && styles.listScoreBehind,
                  ]}
                >
                  {goal != null ? `${entry.total}/${goal}` : `${entry.total} pts`}
                </Text>
              </View>
              {goal != null ? (
                <View style={styles.track}>
                  <ScoreProgressFill
                    progress={fill}
                    color={reached ? theme.success : entry.player.color}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
  listOnly: {
    paddingTop: 0,
    borderTopWidth: 0,
  },
  note: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listItem: {
    gap: 6,
    paddingVertical: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.surfaceLight,
    marginLeft: 38,
    overflow: 'hidden',
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
    fontVariant: ['tabular-nums'],
  },
  listScoreReached: {
    color: theme.success,
  },
  listScoreBehind: {
    color: theme.danger,
  },
});

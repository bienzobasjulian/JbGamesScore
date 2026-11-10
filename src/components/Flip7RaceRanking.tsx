import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { ScoreProgressFill } from './ScoreProgressFill';

type Entry = {
  player: Player;
  total: number;
};

type Props = {
  entries: Entry[];
  goal: number;
  /** El marcador puede ser negativo; la barra solo avanza de 0 a la meta. */
  allowNegative?: boolean;
};

export function Flip7RaceRanking({ entries, goal, allowNegative = false }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.list}>
      {entries.map(({ player, total }, index) => {
        const won = total >= goal;
        const negative = allowNegative && total < 0;
        const forward = Math.min(1, Math.max(0, total) / goal);

        return (
          <View key={player.id} style={styles.row}>
            <View style={styles.identity}>
              <Text style={styles.pos}>{index + 1}.</Text>
              <PlayerAvatar
                name={player.name}
                color={player.color}
                avatar={player.avatar}
                size={28}
                radius={8}
              />
              <Text style={styles.name} numberOfLines={1}>
                {player.name}
              </Text>
              <Text
                style={[
                  styles.score,
                  won && styles.scoreWin,
                  negative && styles.scoreNegative,
                ]}
              >
                {total}/{goal}
              </Text>
            </View>
            <View style={styles.track}>
              <ScoreProgressFill
                progress={forward}
                color={won ? styles.fillWin.backgroundColor : player.color}
              />
              <View style={styles.finishLine} />
            </View>
          </View>
        );
      })}
      <View style={styles.axis}>
        <Text style={styles.axisLabel}>0</Text>
        <Text style={styles.axisLabel}>{goal}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    list: {
      gap: 12,
    },
    row: {
      gap: 6,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pos: {
      width: 22,
      fontSize: 14,
      fontWeight: '700',
      color: theme.textMuted,
    },
    name: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
    score: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      fontVariant: ['tabular-nums'],
    },
    scoreWin: {
      color: theme.success,
    },
    scoreNegative: {
      color: theme.danger,
    },
    track: {
      height: 8,
      borderRadius: 999,
      backgroundColor: theme.surfaceLight,
      marginLeft: 30,
      overflow: 'hidden',
    },
    fillWin: {
      backgroundColor: theme.success,
    },
    finishLine: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      width: 2,
      backgroundColor: theme.success,
    },
    axis: {
      marginLeft: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    axisLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textMuted,
    },
  });

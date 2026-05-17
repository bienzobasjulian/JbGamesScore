import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Player, RoundScores } from '../types';
import { getRoundScore } from '../utils/game';

type Props = {
  players: Player[];
  rounds: RoundScores[];
};

function getCumulativeAtRound(
  rounds: RoundScores[],
  roundIndex: number,
  playerId: string,
): number {
  let total = 0;
  for (let i = 0; i <= roundIndex; i++) {
    total += rounds[i][playerId] ?? 0;
  }
  return total;
}

function getMatchTotals(rounds: RoundScores[], players: Player[]): Record<string, number> {
  const totals: Record<string, number> = {};
  players.forEach((p) => {
    totals[p.id] = 0;
  });
  for (const round of rounds) {
    players.forEach((p) => {
      totals[p.id] += round[p.id] ?? 0;
    });
  }
  return totals;
}

function formatRoundDelta(score: number): string {
  if (score > 0) return `+${score}`;
  return String(score);
}

type ScoreCellProps = {
  roundScore: number;
  cumulative: number;
};

function ScoreCell({ roundScore, cumulative }: ScoreCellProps) {
  return (
    <View style={styles.scoreCell}>
      <Text
        style={[styles.roundDelta, roundScore < 0 && styles.negative]}
      >
        {formatRoundDelta(roundScore)}
      </Text>
      <Text style={styles.cumulative}>Total: {cumulative}</Text>
    </View>
  );
}

export function RoundHistory({ players, rounds }: Props) {
  if (rounds.length === 0) return null;

  const matchTotals = getMatchTotals(rounds, players);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Historial de rondas</Text>
        <Text style={styles.legend}>+ronda · total tras la ronda</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerCell, styles.roundCol]}>
              Ronda
            </Text>
            {players.map((p) => (
              <View key={p.id} style={[styles.cell, styles.playerCol]}>
                <Text style={styles.headerCell} numberOfLines={1}>
                  {p.name}
                </Text>
              </View>
            ))}
          </View>
          {rounds.map((round, index) => (
            <View key={index} style={styles.dataRow}>
              <Text style={[styles.cell, styles.roundCol, styles.roundNum]}>
                {index + 1}
              </Text>
              {players.map((p) => {
                const roundScore = getRoundScore(round, p.id);
                const cumulative = getCumulativeAtRound(rounds, index, p.id);
                return (
                  <View key={p.id} style={[styles.cell, styles.playerCol]}>
                    <ScoreCell
                      roundScore={roundScore}
                      cumulative={cumulative}
                    />
                  </View>
                );
              })}
            </View>
          ))}
          <View style={[styles.dataRow, styles.totalRow]}>
            <Text style={[styles.cell, styles.roundCol, styles.totalLabel]}>
              Total
            </Text>
            {players.map((p) => (
              <View key={p.id} style={[styles.cell, styles.playerCol]}>
                <Text style={styles.finalTotal}>{matchTotals[p.id]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  titleRow: {
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legend: {
    fontSize: 12,
    color: theme.textMuted,
  },
  table: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  totalRow: {
    backgroundColor: theme.surfaceLight,
    borderBottomWidth: 0,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  headerCell: {
    fontWeight: '700',
    color: theme.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  roundCol: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCol: {
    width: 88,
    alignItems: 'center',
  },
  roundNum: {
    fontWeight: '700',
    color: theme.accent,
    fontSize: 14,
    textAlign: 'center',
  },
  scoreCell: {
    alignItems: 'center',
    gap: 2,
  },
  roundDelta: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
  },
  cumulative: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accent,
  },
  negative: {
    color: theme.danger,
  },
  totalLabel: {
    fontWeight: '800',
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
  },
  finalTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
});

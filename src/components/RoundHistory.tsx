import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Player, RoundScores } from '../types';
import { getRoundScore } from '../utils/game';

type Props = {
  players: Player[];
  rounds: RoundScores[];
};

export function RoundHistory({ players, rounds }: Props) {
  if (rounds.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de rondas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.headerCell, styles.roundCol]}>
              Ronda
            </Text>
            {players.map((p) => (
              <Text
                key={p.id}
                style={[styles.cell, styles.headerCell, styles.playerCol]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
            ))}
          </View>
          {rounds.map((round, index) => (
            <View key={index} style={styles.dataRow}>
              <Text style={[styles.cell, styles.roundCol, styles.roundNum]}>
                {index + 1}
              </Text>
              {players.map((p) => {
                const score = getRoundScore(round, p.id);
                return (
                  <Text
                    key={p.id}
                    style={[
                      styles.cell,
                      styles.playerCol,
                      score < 0 && styles.negative,
                    ]}
                  >
                    {score > 0 ? `+${score}` : score}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: '700',
    color: theme.textMuted,
    fontSize: 12,
  },
  roundCol: {
    width: 56,
  },
  playerCol: {
    width: 72,
  },
  roundNum: {
    fontWeight: '700',
    color: theme.accent,
  },
  negative: {
    color: theme.danger,
  },
});

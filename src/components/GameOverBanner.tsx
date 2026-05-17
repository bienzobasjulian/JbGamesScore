import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { GameOverResult } from '../utils/game';

type Props = {
  result: GameOverResult;
};

export function GameOverBanner({ result }: Props) {
  if (!result.isOver) return null;

  const winnerNames = result.winners.map((p) => p.name).join(', ');
  const reasonText =
    result.reason === 'points'
      ? '¡Objetivo de puntos alcanzado!'
      : '¡Todas las rondas completadas!';

  return (
    <View style={styles.banner}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>¡Partida terminada!</Text>
      <Text style={styles.reason}>{reasonText}</Text>
      {result.winners.length > 0 && (
        <Text style={styles.winner}>
          Ganador{result.winners.length > 1 ? 'es' : ''}: {winnerNames}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.accent + '22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.accent,
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.accent,
  },
  reason: {
    fontSize: 14,
    color: theme.textMuted,
  },
  winner: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginTop: 4,
    textAlign: 'center',
  },
});

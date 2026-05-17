import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { GameOverBanner } from '../components/GameOverBanner';
import { PlayerCard } from '../components/PlayerCard';
import { RoundHistory } from '../components/RoundHistory';
import { theme } from '../constants';
import { GameState } from '../types';
import {
  checkGameOver,
  formatPointsGoal,
  formatRoundProgress,
  getPlayerTotal,
  getRoundScore,
  sortPlayersByScore,
} from '../utils/game';

type Props = {
  state: GameState;
  onAdjust: (playerId: string, delta: number) => void;
  onSetScore: (playerId: string, value: number) => void;
  onFinishRound: () => void;
  onUndoRound: () => void;
  onBack: () => void;
  onReset: () => void;
};

export function GameScreen({
  state,
  onAdjust,
  onSetScore,
  onFinishRound,
  onUndoRound,
  onBack,
  onReset,
}: Props) {
  const gameOver = checkGameOver(state);
  const rankedPlayers = sortPlayersByScore(state.players, state);
  const leader = rankedPlayers[0];
  const leaderTotal = leader ? getPlayerTotal(leader.id, state) : 0;
  const pointsGoal = formatPointsGoal(state);
  const isLastRound =
    state.settings.maxRounds != null &&
    state.completedRounds.length + 1 >= state.settings.maxRounds;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.roundBadge}>{formatRoundProgress(state)}</Text>
          {pointsGoal && (
            <Text style={styles.goal}>{pointsGoal}</Text>
          )}
          {!gameOver.isOver && leader && (
            <Text style={styles.leader} numberOfLines={1}>
              🏆 {leader.name} — {leaderTotal} pts
            </Text>
          )}
        </View>
        <Button label="Salir" onPress={onBack} variant="ghost" style={styles.exitBtn} />
      </View>

      <FlatList
        style={styles.list}
        data={state.players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {gameOver.isOver && <GameOverBanner result={gameOver} />}
            {state.completedRounds.length > 0 && (
              <RoundHistory
                players={state.players}
                rounds={state.completedRounds}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            total={getPlayerTotal(item.id, state)}
            roundScore={getRoundScore(state.currentRound, item.id)}
            onAdjust={(delta) => onAdjust(item.id, delta)}
            onSetScore={(value) => onSetScore(item.id, value)}
            controlsDisabled={gameOver.isOver}
          />
        )}
      />

      <View style={styles.footer}>
        {!gameOver.isOver && (
          <Button
            label={
              isLastRound
                ? 'Finalizar última ronda'
                : `Finalizar ronda ${state.completedRounds.length + 1}`
            }
            onPress={onFinishRound}
          />
        )}
        {state.completedRounds.length > 0 && !gameOver.isOver && (
          <Button
            label="Deshacer última ronda"
            onPress={onUndoRound}
            variant="secondary"
          />
        )}
        <Button
          label="Nueva partida"
          onPress={onReset}
          variant="danger"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  roundBadge: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.accent,
  },
  goal: {
    fontSize: 14,
    color: theme.warning,
    fontWeight: '600',
  },
  leader: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 2,
  },
  exitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 12,
  },
  listHeader: {
    gap: 12,
    marginBottom: 4,
  },
  footer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

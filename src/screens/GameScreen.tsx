import { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { FinishMatchButton } from '../components/FinishMatchButton';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { MatchRanking } from '../components/MatchRanking';
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
import { getMatchRankingFromState } from '../utils/match';

type Props = {
  state: GameState;
  matchTitle?: string;
  isMatchFinished?: boolean;
  onAdjust: (playerId: string, delta: number) => void;
  onSetScore: (playerId: string, value: number) => void;
  onFinishRound: () => void;
  onUndoRound: () => void;
  onBack: () => void;
  onFinishMatch: () => void;
  onResumeMatch: () => void;
  onRepeatMatch: () => void;
  onDeleteMatch: () => void;
};

export function GameScreen({
  state,
  matchTitle,
  isMatchFinished = false,
  onAdjust,
  onSetScore,
  onFinishRound,
  onUndoRound,
  onBack,
  onFinishMatch,
  onResumeMatch,
  onRepeatMatch,
  onDeleteMatch,
}: Props) {
  const [finishModalVisible, setFinishModalVisible] = useState(false);

  const gameOver = checkGameOver(state);
  const showResults = gameOver.isOver || isMatchFinished;
  const ranking = useMemo(
    () => getMatchRankingFromState(state),
    [state.players, state.completedRounds, state.currentRound],
  );

  const rankedPlayers = sortPlayersByScore(state.players, state);
  const leader = rankedPlayers[0];
  const leaderTotal = leader ? getPlayerTotal(leader.id, state) : 0;
  const pointsGoal = formatPointsGoal(state);
  const isLastRound =
    state.settings.maxRounds != null &&
    state.completedRounds.length + 1 >= state.settings.maxRounds;

  const handleSaveFinished = () => {
    setFinishModalVisible(false);
    onFinishMatch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          {matchTitle ? (
            <Text style={styles.matchTitle} numberOfLines={1}>
              {matchTitle}
            </Text>
          ) : null}
          {!showResults && (
            <>
              <Text style={styles.roundBadge}>{formatRoundProgress(state)}</Text>
              {pointsGoal && (
                <Text style={styles.goal}>{pointsGoal}</Text>
              )}
              {leader && (
                <Text style={styles.leader} numberOfLines={1}>
                  🏆 {leader.name} — {leaderTotal} pts
                </Text>
              )}
            </>
          )}
          {showResults && (
            <Text style={styles.finishedBadge}>Partida finalizada</Text>
          )}
        </View>
        <Button label="Salir" onPress={onBack} variant="ghost" style={styles.exitBtn} />
      </View>

      <View style={styles.body}>
        {showResults ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <MatchRanking ranking={ranking} />
            {state.completedRounds.length > 0 && (
              <RoundHistory
                players={state.players}
                rounds={state.completedRounds}
              />
            )}
          </ScrollView>
        ) : (
          <FlatList
            style={styles.scroll}
            data={state.players}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              state.completedRounds.length > 0 ? (
                <View style={styles.listHeader}>
                  <RoundHistory
                    players={state.players}
                    rounds={state.completedRounds}
                  />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <PlayerCard
                player={item}
                total={getPlayerTotal(item.id, state)}
                roundScore={getRoundScore(state.currentRound, item.id)}
                onAdjust={(delta) => onAdjust(item.id, delta)}
                onSetScore={(value) => onSetScore(item.id, value)}
              />
            )}
          />
        )}
      </View>

      <View style={styles.footer}>
        {showResults ? (
          <>
            <Button label="Repetir partida" onPress={onRepeatMatch} />
            <Button
              label="Retomar partida"
              onPress={onResumeMatch}
              variant="secondary"
            />
            <Button
              label="Eliminar partida"
              onPress={onDeleteMatch}
              variant="danger"
            />
          </>
        ) : (
          <>
            <Button
              label={
                isLastRound
                  ? 'Finalizar última ronda'
                  : `Finalizar ronda ${state.completedRounds.length + 1}`
              }
              onPress={onFinishRound}
            />
            {state.completedRounds.length > 0 && (
              <Button
                label="Deshacer última ronda"
                onPress={onUndoRound}
                variant="secondary"
              />
            )}
            <FinishMatchButton onPress={() => setFinishModalVisible(true)} />
          </>
        )}
      </View>

      {!showResults && (
        <FinishMatchModal
          visible={finishModalVisible}
          matchTitle={matchTitle}
          onClose={() => setFinishModalVisible(false)}
          onSaveFinished={handleSaveFinished}
          onDelete={onDeleteMatch}
        />
      )}
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
  matchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 2,
  },
  roundBadge: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.accent,
  },
  finishedBadge: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.success,
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
  body: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
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

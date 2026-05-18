import { useEffect, useMemo, useState } from 'react';
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
import { RoundPagination } from '../components/RoundPagination';
import { TruncateRoundsModal } from '../components/TruncateRoundsModal';
import { theme } from '../constants';
import { GameState, ScoringMode } from '../types';
import {
  checkGameOver,
  formatPointsGoal,
  formatRoundProgress,
  getActiveRoundScores,
  getPlayerTotal,
  getRoundScore,
  sortPlayersByScore,
} from '../utils/game';
import { getMatchRankingFromState, RankedPlayer } from '../utils/match';
import { hasLaterRoundsWithScores } from '../utils/rounds';
import {
  getPlayerBreakdownItems,
  getPlayerScoringMode,
} from '../utils/scoring';

type ScoreMutation = (truncateLater: boolean) => void;

type Props = {
  state: GameState;
  matchTitle?: string;
  resultsRanking?: RankedPlayer[];
  isMatchFinished?: boolean;
  isDedicatedGameMatch?: boolean;
  onAdjust: (playerId: string, delta: number, truncateLater?: boolean) => void;
  onSetScore: (playerId: string, value: number, truncateLater?: boolean) => void;
  onScoringModeChange: (
    playerId: string,
    mode: ScoringMode,
    truncateLater?: boolean,
  ) => void;
  onAddBreakdownItem: (
    playerId: string,
    value: number,
    truncateLater?: boolean,
  ) => void;
  onRemoveBreakdownItem: (
    playerId: string,
    index: number,
    truncateLater?: boolean,
  ) => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onBack: () => void;
  onFinishMatch: () => void;
  onResumeMatch: () => void;
  onRepeatMatch: () => void;
  onDeleteMatch: () => void;
};

export function GameScreen({
  state,
  matchTitle,
  resultsRanking,
  isMatchFinished = false,
  isDedicatedGameMatch = false,
  onAdjust,
  onSetScore,
  onScoringModeChange,
  onAddBreakdownItem,
  onRemoveBreakdownItem,
  onGoToRound,
  onAddRound,
  onBack,
  onFinishMatch,
  onResumeMatch,
  onRepeatMatch,
  onDeleteMatch,
}: Props) {
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [viewingResults, setViewingResults] = useState(isMatchFinished);

  useEffect(() => {
    if (isMatchFinished) {
      setViewingResults(true);
    }
  }, [isMatchFinished]);
  const [truncatePrompt, setTruncatePrompt] = useState<{
    roundNumber: number;
    removedCount: number;
    pending: ScoreMutation;
  } | null>(null);

  const gameOver = checkGameOver(state);
  const showResults = gameOver.isOver || isMatchFinished || viewingResults;

  const pastRounds =
    state.activeRoundIndex > 0
      ? state.rounds.slice(0, state.activeRoundIndex)
      : [];
  const activeRound = getActiveRoundScores(state);
  const activeBreakdown =
    state.roundBreakdowns[state.activeRoundIndex] ?? {};
  const hasLaterRounds = hasLaterRoundsWithScores(
    state.activeRoundIndex,
    state.rounds,
    state.roundBreakdowns,
  );

  const ranking = useMemo(() => {
    if (resultsRanking) return resultsRanking;
    return getMatchRankingFromState(state);
  }, [resultsRanking, state.players, state.rounds, state.activeRoundIndex]);

  const rankedPlayers = sortPlayersByScore(state.players, state);
  const leader = rankedPlayers[0];
  const leaderTotal = leader ? getPlayerTotal(leader.id, state) : 0;
  const pointsGoal = formatPointsGoal(state);

  const handleSaveFinished = () => {
    setFinishModalVisible(false);
    setViewingResults(true);
    onFinishMatch();
  };

  const handleResumeMatch = () => {
    setViewingResults(false);
    onResumeMatch();
  };

  const withTruncateGuard = (mutation: ScoreMutation) => {
    if (hasLaterRounds) {
      setTruncatePrompt({
        roundNumber: state.activeRoundIndex + 1,
        removedCount: state.rounds.length - state.activeRoundIndex - 1,
        pending: mutation,
      });
      return;
    }
    mutation(false);
  };

  const confirmTruncate = () => {
    truncatePrompt?.pending(true);
    setTruncatePrompt(null);
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
            {state.rounds.length > 0 && (
              <RoundHistory players={state.players} rounds={state.rounds} />
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
              pastRounds.length > 0 ? (
                <View style={styles.listHeader}>
                  <RoundHistory
                    players={state.players}
                    rounds={pastRounds}
                  />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <PlayerCard
                player={item}
                total={getPlayerTotal(item.id, state)}
                roundScore={getRoundScore(activeRound, item.id)}
                breakdownItems={getPlayerBreakdownItems(
                  activeBreakdown,
                  item.id,
                )}
                scoringMode={getPlayerScoringMode(
                  state.roundScoringMode,
                  item.id,
                  activeBreakdown[item.id],
                )}
                onAdjust={(delta) =>
                  withTruncateGuard((t) => onAdjust(item.id, delta, t))
                }
                onSetScore={(value) =>
                  withTruncateGuard((t) => onSetScore(item.id, value, t))
                }
                onScoringModeChange={(mode) =>
                  withTruncateGuard((t) =>
                    onScoringModeChange(item.id, mode, t),
                  )
                }
                onAddBreakdownItem={(value) =>
                  withTruncateGuard((t) =>
                    onAddBreakdownItem(item.id, value, t),
                  )
                }
                onRemoveBreakdownItem={(index) =>
                  withTruncateGuard((t) =>
                    onRemoveBreakdownItem(item.id, index, t),
                  )
                }
              />
            )}
          />
        )}
      </View>

      <View style={styles.footer}>
        {showResults ? (
          <>
            <Button label="Repetir partida" onPress={onRepeatMatch} />
            {!isDedicatedGameMatch ? (
              <Button
                label="Retomar partida"
                onPress={handleResumeMatch}
                variant="secondary"
              />
            ) : null}
            <Button
              label="Eliminar partida"
              onPress={onDeleteMatch}
              variant="danger"
            />
          </>
        ) : (
          <>
            <RoundPagination
              roundCount={state.rounds.length}
              activeIndex={state.activeRoundIndex}
              maxRounds={state.settings.maxRounds}
              onSelectRound={onGoToRound}
              onAddRound={onAddRound}
            />
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

      <TruncateRoundsModal
        visible={truncatePrompt != null}
        roundNumber={truncatePrompt?.roundNumber ?? 1}
        removedCount={truncatePrompt?.removedCount ?? 0}
        onConfirm={confirmTruncate}
        onCancel={() => setTruncatePrompt(null)}
      />
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  footer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

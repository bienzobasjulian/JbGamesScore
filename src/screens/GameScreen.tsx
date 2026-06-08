import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { MatchResultsPager } from '../components/MatchResultsPager';
import { PlayerCard } from '../components/PlayerCard';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
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
import {
  getPlayerBreakdownItems,
  getPlayerScoringMode,
} from '../utils/scoring';

type Props = {
  state: GameState;
  matchTitle?: string;
  resultsRanking?: RankedPlayer[];
  isMatchFinished?: boolean;
  editingAfterFinish?: boolean;
  isDedicatedGameMatch?: boolean;
  onAdjust: (playerId: string, delta: number) => void;
  onSetScore: (playerId: string, value: number) => void;
  onScoringModeChange: (playerId: string, mode: ScoringMode) => void;
  onAddBreakdownItem: (playerId: string, value: number) => void;
  onRemoveBreakdownItem: (playerId: string, index: number) => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onBack: () => void;
  onEditMatch?: () => void;
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
  editingAfterFinish = false,
  isDedicatedGameMatch = false,
  onAdjust,
  onSetScore,
  onScoringModeChange,
  onAddBreakdownItem,
  onRemoveBreakdownItem,
  onGoToRound,
  onAddRound,
  onBack,
  onEditMatch,
  onFinishMatch,
  onResumeMatch,
  onRepeatMatch,
  onDeleteMatch,
}: Props) {
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [viewingResults, setViewingResults] = useState(isMatchFinished);

  useEffect(() => {
    if (isMatchFinished) {
      setViewingResults(true);
    }
  }, [isMatchFinished]);

  const objectivesReached = checkGameOver(state).isOver;
  const showResults =
    viewingResults || (objectivesReached && !editingAfterFinish);
  const showingUnsavedResults = viewingResults && !isMatchFinished;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (finishModalVisible) {
          setFinishModalVisible(false);
          return true;
        }

        if (rankingModalVisible) {
          setRankingModalVisible(false);
          return true;
        }

        if (actionsMenuVisible) {
          setActionsMenuVisible(false);
          return true;
        }

        if (exitModalVisible) {
          setExitModalVisible(false);
          return true;
        }

        if (showResults) {
          if (showingUnsavedResults) {
            setExitModalVisible(true);
          } else {
            onBack();
          }
          return true;
        }

        setExitModalVisible(true);
        return true;
      },
    );

    return () => subscription.remove();
  }, [
    exitModalVisible,
    finishModalVisible,
    actionsMenuVisible,
    rankingModalVisible,
    onBack,
    showResults,
    showingUnsavedResults,
  ]);

  const pastRounds =
    state.activeRoundIndex > 0
      ? state.rounds.slice(0, state.activeRoundIndex)
      : [];
  const activeRound = getActiveRoundScores(state);
  const activeBreakdown =
    state.roundBreakdowns[state.activeRoundIndex] ?? {};
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

  const handleViewResults = () => {
    setFinishModalVisible(false);
    setViewingResults(true);
  };

  const handleSaveAndExit = () => {
    setExitModalVisible(false);
    if (showingUnsavedResults) {
      onFinishMatch();
    }
    onBack();
  };

  const handleDeleteAndExit = () => {
    setExitModalVisible(false);
    onDeleteMatch();
  };

  const handleBackPress = () => {
    if (showResults && !showingUnsavedResults) {
      onBack();
      return;
    }
    setExitModalVisible(true);
  };

  const canEditMatch =
    !isDedicatedGameMatch && Boolean(onEditMatch) && !showResults;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBackPress}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

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

        {!showResults ? (
          <Pressable
            onPress={() => setActionsMenuVisible(true)}
            hitSlop={12}
            style={({ pressed }) => [
              styles.menuBtn,
              pressed && styles.backBtnPressed,
            ]}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </Pressable>
        ) : (
          <View style={styles.menuPlaceholder} />
        )}
      </View>

      <View style={styles.body}>
        {showResults ? (
          <MatchResultsPager
            ranking={ranking}
            players={state.players}
            rounds={state.rounds}
          />
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
                onAdjust={(delta) => onAdjust(item.id, delta)}
                onSetScore={(value) => onSetScore(item.id, value)}
                onScoringModeChange={(mode) =>
                  onScoringModeChange(item.id, mode)
                }
                onAddBreakdownItem={(value) =>
                  onAddBreakdownItem(item.id, value)
                }
                onRemoveBreakdownItem={(index) =>
                  onRemoveBreakdownItem(item.id, index)
                }
              />
            )}
          />
        )}
      </View>

      <View style={styles.footer}>
        {showResults ? (
          <>
            {showingUnsavedResults ? (
              <>
                <Button
                  label="Guardar partida"
                  onPress={handleSaveFinished}
                />
                <Button
                  label="Retomar partida"
                  onPress={handleResumeMatch}
                  variant="secondary"
                />
                <Button
                  label="Salir sin guardar"
                  onPress={onDeleteMatch}
                  variant="danger"
                />
              </>
            ) : (
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
            )}
          </>
        ) : (
          <>
            <Text style={styles.roundsLabel}>Rondas</Text>
            <RoundPagination
              roundCount={state.rounds.length}
              activeIndex={state.activeRoundIndex}
              maxRounds={state.settings.maxRounds}
              rounds={state.rounds}
              roundBreakdowns={state.roundBreakdowns}
              onSelectRound={onGoToRound}
              onAddRound={onAddRound}
            />
          </>
        )}
      </View>

      {!showResults && (
        <>
          <MatchActionsMenu
            visible={actionsMenuVisible}
            onClose={() => setActionsMenuVisible(false)}
            onViewRanking={() => setRankingModalVisible(true)}
            onEditMatch={() => onEditMatch?.()}
            onFinishMatch={() => setFinishModalVisible(true)}
            canEditMatch={canEditMatch}
          />
          <CurrentRankingModal
            visible={rankingModalVisible}
            ranking={ranking}
            onClose={() => setRankingModalVisible(false)}
          />
          <FinishMatchModal
            visible={finishModalVisible}
            matchTitle={matchTitle}
            onClose={() => setFinishModalVisible(false)}
            onViewResults={handleViewResults}
            onSaveFinished={handleSaveFinished}
            onDelete={onDeleteMatch}
          />
          <ExitMatchModal
            visible={exitModalVisible}
            matchTitle={matchTitle}
            onClose={() => setExitModalVisible(false)}
            onSaveAndExit={handleSaveAndExit}
            onDeleteAndExit={handleDeleteAndExit}
          />
        </>
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
    gap: 10,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 2,
  },
  backBtnPressed: {
    opacity: 0.8,
  },
  backIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '600',
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 2,
  },
  menuIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '800',
    lineHeight: 24,
  },
  menuPlaceholder: {
    width: 40,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
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
  roundsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

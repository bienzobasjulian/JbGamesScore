import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { MatchResultsPager, PoopIcon } from '../components/MatchResultsPager';
import { PlayerCard } from '../components/PlayerCard';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { ScoreBigView } from '../components/ScoreBigView';
import { ScoreTableView } from '../components/ScoreTableView';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { TourAnchor, useAutoTour } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { GameState, ScoreLayout, ScoreRoundOrder, ScoreTileWidth } from '../types';
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
import { getPlayerBreakdownItems } from '../utils/scoring';

type Props = {
  state: GameState;
  matchId: string;
  matchTitle?: string;
  resultsRanking?: RankedPlayer[];
  isMatchFinished?: boolean;
  editingAfterFinish?: boolean;
  isDedicatedGameMatch?: boolean;
  floorRoundTotalsAtZero?: boolean;
  roundLabels?: string[];
  isWinnerOnlyMatch?: boolean;
  onSetScore: (playerId: string, value: number) => void;
  onAdjustScore: (playerId: string, delta: number) => void;
  onChangeScoreLayout: (layout: ScoreLayout) => void;
  onChangeScoreTileWidth: (width: ScoreTileWidth) => void;
  onChangeScoreRoundOrder: (order: ScoreRoundOrder) => void;
  onSetBreakdown: (playerId: string, items: number[]) => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onBack: () => void;
  onEditMatch?: () => void;
  onFinishMatch: () => void;
  onResetMatch: () => void;
  onResumeMatch: () => void;
  onRepeatMatch: () => void;
  onDeleteMatch: () => void;
};

export function GameScreen({
  state,
  matchId,
  matchTitle,
  resultsRanking,
  isMatchFinished = false,
  editingAfterFinish = false,
  isDedicatedGameMatch = false,
  floorRoundTotalsAtZero = false,
  roundLabels,
  isWinnerOnlyMatch = false,
  onSetScore,
  onAdjustScore,
  onChangeScoreLayout,
  onChangeScoreTileWidth,
  onChangeScoreRoundOrder,
  onSetBreakdown,
  onGoToRound,
  onAddRound,
  onBack,
  onEditMatch,
  onFinishMatch,
  onResumeMatch,
  onRepeatMatch,
  onDeleteMatch,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [repeatConfirmVisible, setRepeatConfirmVisible] = useState(false);
  const [viewingResults, setViewingResults] = useState(isMatchFinished);

  useEffect(() => {
    setViewingResults(isMatchFinished);
  }, [matchId]);

  useEffect(() => {
    if (isMatchFinished) {
      setViewingResults(true);
    }
  }, [isMatchFinished]);

  const objectivesReached = checkGameOver(state).isOver;
  const showResults =
    viewingResults || (objectivesReached && !editingAfterFinish);
  const showingUnsavedResults = viewingResults && !isMatchFinished;
  useAutoTour('match', {
    enabled: !showResults && !isWinnerOnlyMatch,
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
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
            setViewingResults(false);
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
    setViewingResults(true);
    onFinishMatch();
  };

  const handleResumeMatch = () => {
    setViewingResults(false);
    onResumeMatch();
  };

  const handleRepeatMatch = () => {
    setViewingResults(false);
    onRepeatMatch();
  };

  const handleRepeatPress = () => {
    if (showingUnsavedResults) {
      setRepeatConfirmVisible(true);
      return;
    }
    handleRepeatMatch();
  };

  const handleRepeatSaving = () => {
    setRepeatConfirmVisible(false);
    onFinishMatch();
    handleRepeatMatch();
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
              {leader && state.settings.lowestScoreLoses && rankedPlayers.length > 1 ? (
                <View style={styles.leaderRow}>
                  <PoopIcon size={14} />
                  <Text style={styles.leader} numberOfLines={1}>
                    {(() => {
                      const floor = getPlayerTotal(
                        rankedPlayers[rankedPlayers.length - 1].id,
                        state,
                      );
                      const names = rankedPlayers
                        .filter((player) => getPlayerTotal(player.id, state) === floor)
                        .map((player) => player.name);
                      return `${names.join(', ')} ${names.length > 1 ? 'van' : 'va'} perdiendo`;
                    })()}
                  </Text>
                </View>
              ) : leader ? (
                <Text style={styles.leader} numberOfLines={1}>
                  🏆 {leader.name} — {leaderTotal} pts
                </Text>
              ) : null}
            </>
          )}
          {showResults && (
            <Text style={styles.finishedBadge}>Partida finalizada</Text>
          )}
        </View>

        {!showResults ? (
          <TourAnchor id="match.menu">
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
          </TourAnchor>
        ) : (
          <View style={styles.menuPlaceholder} />
        )}
      </View>

      <View style={styles.body}>
        {showResults ? (
          isWinnerOnlyMatch ? (
            <View style={styles.winnerOnlyWrap}>
              <Text style={styles.winnerOnlyHeading}>Ganador</Text>
              {ranking
                .filter((entry) => entry.total > 0)
                .map((entry) => (
                  <View key={entry.player.id} style={styles.winnerOnlyRow}>
                    <PlayerAvatar
                      name={entry.player.name}
                      color={entry.player.color}
                      avatar={entry.player.avatar}
                      size={28}
                      radius={8}
                    />
                    <Text style={styles.winnerOnlyName}>
                      {entry.player.name}
                    </Text>
                  </View>
                ))}
              <Text style={styles.winnerOnlyNote}>
                Partida registrada sin puntuación.
              </Text>
            </View>
          ) : (
            <MatchResultsPager
              ranking={ranking}
              players={state.players}
              rounds={state.rounds}
              floorTotalAtZero={floorRoundTotalsAtZero}
              roundLabels={roundLabels}
              lowestScoreWins={state.settings.lowestScoreWins === true}
              lowestScoreLoses={state.settings.lowestScoreLoses === true}
              pointsGoal={
                state.settings.maxPointsToWin != null &&
                state.settings.maxPointsToWin > 0
                  ? state.settings.maxPointsToWin
                  : null
              }
            />
          )
        ) : (
          <TourAnchor id="match.scores" style={styles.scroll}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {state.scoreLayout === 'cards' && pastRounds.length > 0 ? (
              <RoundHistory
                players={state.players}
                rounds={pastRounds}
                floorTotalAtZero={floorRoundTotalsAtZero}
                roundLabels={roundLabels}
              />
            ) : null}
            {state.scoreLayout === 'table' ? (
              <ScoreTableView
                players={state.players}
                rounds={state.rounds}
                roundBreakdowns={state.roundBreakdowns}
                activeRoundIndex={state.activeRoundIndex}
                roundLabels={roundLabels}
                onGoToRound={onGoToRound}
                onSetScore={onSetScore}
                onSetBreakdown={onSetBreakdown}
                maxRounds={state.settings.maxRounds}
                onAddRound={onAddRound}
                roundOrder={state.scoreRoundOrder}
              />
            ) : state.scoreLayout === 'big' ? (
              <ScoreBigView
                players={state.players}
                roundScores={activeRound}
                tileWidth={state.scoreTileWidth}
                breakdown={activeBreakdown}
                onSetScore={onSetScore}
                onSetBreakdown={onSetBreakdown}
                onAdjustScore={onAdjustScore}
              />
            ) : (
              state.players.map((item) => (
                <PlayerCard
                  key={item.id}
                  player={item}
                  total={getPlayerTotal(item.id, state)}
                  roundScore={getRoundScore(activeRound, item.id)}
                  breakdownItems={getPlayerBreakdownItems(
                    activeBreakdown,
                    item.id,
                  )}
                  onSetScore={(value) => onSetScore(item.id, value)}
                  onSetBreakdown={(items) => onSetBreakdown(item.id, items)}
                />
              ))
            )}
          </ScrollView>
          </TourAnchor>
        )}
      </View>

      <View
        style={[
          styles.footer,
          !showResults && state.scoreLayout === 'table' && styles.footerHidden,
        ]}
      >
        {showResults ? (
          <View style={styles.footerGrid}>
            <View style={styles.footerRow}>
              {showingUnsavedResults ? (
                <View style={styles.footerCell}>
                  <Button
                    label="Guardar finalizada"
                    onPress={handleSaveFinished}
                    numberOfLines={1}
                    style={styles.footerButton}
                  />
                </View>
              ) : !isDedicatedGameMatch ? (
                <View style={styles.footerCell}>
                  <Button
                    label="Seguir jugando"
                    onPress={handleResumeMatch}
                    variant="secondary"
                    numberOfLines={1}
                    style={styles.footerButton}
                  />
                </View>
              ) : null}
              <View style={styles.footerCell}>
                <Button
                  label="Repetir partida"
                  onPress={handleRepeatPress}
                  variant={showingUnsavedResults ? 'secondary' : 'primary'}
                  numberOfLines={1}
                  style={styles.footerButton}
                />
              </View>
            </View>
            <View style={styles.footerRow}>
              {!isDedicatedGameMatch && showingUnsavedResults ? (
                <View style={styles.footerCell}>
                  <Button
                    label="Seguir jugando"
                    onPress={handleResumeMatch}
                    variant="secondary"
                    numberOfLines={1}
                    style={styles.footerButton}
                  />
                </View>
              ) : null}
              <View style={styles.footerCell}>
                <Button
                  label="Eliminar partida"
                  onPress={() => setDeleteConfirmVisible(true)}
                  variant="danger"
                  numberOfLines={1}
                  style={styles.footerButton}
                />
              </View>
            </View>
          </View>
        ) : state.scoreLayout === 'table' ? null : (
          <>
            <Text style={styles.roundsLabel}>Rondas</Text>
            <TourAnchor id="match.rounds">
              <RoundPagination
                roundCount={state.rounds.length}
                activeIndex={state.activeRoundIndex}
                maxRounds={state.settings.maxRounds}
                rounds={state.rounds}
                roundBreakdowns={state.roundBreakdowns}
                onSelectRound={onGoToRound}
                onAddRound={onAddRound}
              />
            </TourAnchor>
          </>
        )}
      </View>

      {!showResults && (
        <>
          <MatchActionsMenu
            visible={actionsMenuVisible}
            onClose={() => setActionsMenuVisible(false)}
            onViewRanking={
              state.players.length > 1
                ? () => setRankingModalVisible(true)
                : undefined
            }
            onEditMatch={() => onEditMatch?.()}
            onFinishMatch={() => setViewingResults(true)}
            canEditMatch={canEditMatch}
            scoreLayout={state.scoreLayout}
            scoreTileWidth={state.scoreTileWidth}
            onChangeScoreLayout={onChangeScoreLayout}
            onChangeScoreTileWidth={onChangeScoreTileWidth}
            scoreRoundOrder={state.scoreRoundOrder}
            onChangeScoreRoundOrder={onChangeScoreRoundOrder}
          />
          <CurrentRankingModal
            visible={rankingModalVisible}
            ranking={ranking}
            players={state.players}
            rounds={state.rounds}
            floorTotalAtZero={floorRoundTotalsAtZero}
            roundLabels={roundLabels}
            pointsGoal={
              state.settings.maxPointsToWin != null &&
              state.settings.maxPointsToWin > 0
                ? state.settings.maxPointsToWin
                : null
            }
            onClose={() => setRankingModalVisible(false)}
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

      <ConfirmModal
        visible={deleteConfirmVisible}
        title="¿Eliminar partida?"
        message="Se borra de forma permanente, con sus puntos y rondas."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          setDeleteConfirmVisible(false);
          onDeleteMatch();
        }}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
      <ConfirmModal
        visible={repeatConfirmVisible}
        title="¿Guardar la partida actual?"
        message="Vas a empezar otra con la misma configuración y los mismos jugadores."
        confirmLabel="Guardar y repetir"
        secondaryLabel="Repetir sin guardar"
        onConfirm={handleRepeatSaving}
        onSecondary={() => {
          setRepeatConfirmVisible(false);
          handleRepeatMatch();
        }}
        onCancel={() => setRepeatConfirmVisible(false)}
      />

    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
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
  footer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  footerGrid: {
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  footerCell: {
    flex: 1,
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  footerHidden: {
    display: 'none',
  },
  roundsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  winnerOnlyWrap: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  winnerOnlyHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  winnerOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  winnerOnlyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  winnerOnlyName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  winnerOnlyNote: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});

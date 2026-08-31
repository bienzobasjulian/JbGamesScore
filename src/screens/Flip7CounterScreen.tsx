import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { Flip7ActivePlayerPanel } from '../components/Flip7ActivePlayerPanel';
import { Flip7CelebrationModal } from '../components/Flip7CelebrationModal';
import { Flip7PickPlayerModal } from '../components/Flip7PickPlayerModal';
import { Flip7PlayerStrip } from '../components/Flip7PlayerStrip';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { theme } from '../constants';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { Flip7Modifier, Flip7PlayerRoundStatus, Flip7Session, Player } from '../types';
import {
  emptyFlip7RoundEntry,
  FLIP7_WIN_AT,
  getFlip7GameOverWinners,
  getFlip7RoundEntryScore,
  getFlip7RoundNumber,
  hasFlip7Bonus,
  hasFlip7GameOver,
  isFlip7RoundComplete,
  sortPlayersByFlip7Total,
} from '../utils/flip7';
import {
  getFlip7ActiveTargetCandidates,
  canFlip7Undo,
  getFlip7Dealer,
  getFlip7PlayersInTurnOrder,
  getFlip7RoundState,
  getFlip7TurnPlayer,
  resolveFlip7TargetPlayerId,
} from '../utils/flip7Turn';

type PickAction = 'freeze' | 'flipThree' | 'secondChance';

type Props = {
  session: Flip7Session;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onRegisterNumber: (
    roundIndex: number,
    playerId: string,
    number: number,
  ) => { flip7Achieved: boolean } | null;
  onRegisterModifier: (
    roundIndex: number,
    playerId: string,
    modifier: Flip7Modifier,
  ) => void;
  onSetPlayerStatus: (
    roundIndex: number,
    playerId: string,
    status: Flip7PlayerRoundStatus,
  ) => void;
  onApplyFreeze: (
    roundIndex: number,
    sourcePlayerId: string,
    targetPlayerId: string,
  ) => void;
  onApplyFlipThree: (
    roundIndex: number,
    sourcePlayerId: string,
    targetPlayerId: string,
  ) => void;
  onDrawSecondChance: (
    roundIndex: number,
    playerId: string,
    targetPlayerId?: string,
  ) => void;
  onUndo: () => void;
};

export function Flip7CounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onGoToRound,
  onAddRound,
  onRegisterNumber,
  onRegisterModifier,
  onSetPlayerStatus,
  onApplyFreeze,
  onApplyFlipThree,
  onDrawSecondChance,
  onUndo,
}: Props) {
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [flip7ModalPlayer, setFlip7ModalPlayer] = useState<Player | null>(null);
  const [pickAction, setPickAction] = useState<PickAction | null>(null);
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | null>(null);
  const celebratedFlip7Ref = useRef<Set<string>>(new Set());
  const autoAdvancedRoundRef = useRef<string | null>(null);
  const {
    exitModalVisible,
    setExitModalVisible,
    requestExit,
  } = useExitMatchModal();

  const roundIndex = session.activeRoundIndex;
  const roundNumber = getFlip7RoundNumber(roundIndex);
  const isCurrentRound = roundIndex === session.rounds.length - 1;
  const roundByPlayer = session.rounds[roundIndex] ?? {};
  const roundState = getFlip7RoundState(session, roundIndex);
  const turnOrder = useMemo(
    () => getFlip7PlayersInTurnOrder(session.players, roundIndex),
    [session.players, roundIndex],
  );
  const dealer = getFlip7Dealer(session.players, roundIndex);
  const turnPlayer = getFlip7TurnPlayer(session, roundIndex);
  const turnPlayerId = turnPlayer?.id ?? null;
  const roundComplete = isFlip7RoundComplete(roundByPlayer, session.players);
  const canUndo = canFlip7Undo(session);

  const focusedPlayer =
    session.players.find((p) => p.id === focusedPlayerId) ??
    turnPlayer ??
    session.players[0] ??
    null;

  useEffect(() => {
    if (turnPlayerId) {
      setFocusedPlayerId(turnPlayerId);
    }
  }, [turnPlayerId, roundState.turnOrderIndex, roundIndex]);

  const completedRounds = useMemo(
    () =>
      session.rounds.slice(0, roundIndex).map((roundByPlayerAtRound) => {
        const scores: Record<string, number> = {};
        for (const player of session.players) {
          const entry =
            roundByPlayerAtRound[player.id] ?? emptyFlip7RoundEntry();
          scores[player.id] = getFlip7RoundEntryScore(entry);
        }
        return scores;
      }),
    [session.players, session.rounds, roundIndex],
  );

  const cumulativeRanking = useMemo(
    () => sortPlayersByFlip7Total(session, session.rounds.length, true),
    [session],
  );

  const gameOver = hasFlip7GameOver(session, session.rounds.length, true);
  const winners = useMemo(
    () => getFlip7GameOverWinners(session, session.rounds.length, true),
    [session],
  );

  useEffect(() => {
    if (!isCurrentRound) return;

    for (const player of session.players) {
      const key = `${roundIndex}-${player.id}`;
      const entry = roundByPlayer[player.id] ?? emptyFlip7RoundEntry();

      if (!hasFlip7Bonus(entry)) {
        celebratedFlip7Ref.current.delete(key);
        continue;
      }

      if (celebratedFlip7Ref.current.has(key)) continue;

      celebratedFlip7Ref.current.add(key);
      setFlip7ModalPlayer(player);
    }
  }, [roundByPlayer, roundIndex, session.players, isCurrentRound]);

  useEffect(() => {
    if (!isCurrentRound) return;

    const roundKey = `${session.rounds.length}-${roundIndex}`;
    if (flip7ModalPlayer != null) return;

    if (!isFlip7RoundComplete(roundByPlayer, session.players)) {
      autoAdvancedRoundRef.current = null;
      return;
    }

    if (autoAdvancedRoundRef.current === roundKey) return;
    autoAdvancedRoundRef.current = roundKey;
    onAddRound();
  }, [
    roundByPlayer,
    roundIndex,
    session.players,
    session.rounds.length,
    flip7ModalPlayer,
    onAddRound,
    isCurrentRound,
  ]);

  const pickCandidates = useMemo(() => {
    if (!pickAction || !turnPlayerId) return [];

    if (pickAction === 'secondChance') {
      const entry = roundByPlayer[turnPlayerId] ?? emptyFlip7RoundEntry();
      if (!entry.hasSecondChance) return [];
      const candidates = getFlip7ActiveTargetCandidates(
        turnOrder,
        roundByPlayer,
        turnPlayerId,
        (targetEntry) => !targetEntry.hasSecondChance,
      );
      const self = session.players.find((p) => p.id === turnPlayerId);
      if (self && !candidates.some((player) => player.id === self.id)) {
        return [...candidates, self];
      }
      return candidates;
    }

    const others = getFlip7ActiveTargetCandidates(
      turnOrder,
      roundByPlayer,
      turnPlayerId,
    );
    const self = session.players.find((p) => p.id === turnPlayerId);
    const selfEntry = roundByPlayer[turnPlayerId] ?? emptyFlip7RoundEntry();
    if (
      self &&
      selfEntry.status === 'active' &&
      !others.some((player) => player.id === self.id)
    ) {
      return [...others, self];
    }
    return others;
  }, [pickAction, turnOrder, roundByPlayer, turnPlayerId, session.players]);

  const buildActionCandidates = () => {
    if (!turnPlayerId) return [];
    const others = getFlip7ActiveTargetCandidates(
      turnOrder,
      roundByPlayer,
      turnPlayerId,
    );
    const self = session.players.find((p) => p.id === turnPlayerId);
    const selfEntry = roundByPlayer[turnPlayerId] ?? emptyFlip7RoundEntry();
    if (
      self &&
      selfEntry.status === 'active' &&
      !others.some((player) => player.id === self.id)
    ) {
      return [...others, self];
    }
    return others;
  };

  const navigatePlayer = (delta: number) => {
    if (turnOrder.length === 0 || !focusedPlayer) return;
    const currentIndex = turnOrder.findIndex((p) => p.id === focusedPlayer.id);
    const nextIndex =
      (currentIndex + delta + turnOrder.length) % turnOrder.length;
    setFocusedPlayerId(turnOrder[nextIndex].id);
  };

  const handleSelectStripPlayer = (playerId: string) => {
    setFocusedPlayerId(playerId);
  };

  const openPickOrAuto = (action: PickAction) => {
    if (!turnPlayerId) return;

    if (action === 'secondChance') {
      const entry = roundByPlayer[turnPlayerId] ?? emptyFlip7RoundEntry();
      if (!entry.hasSecondChance) {
        onDrawSecondChance(roundIndex, turnPlayerId);
        return;
      }
      const candidates = getFlip7ActiveTargetCandidates(
        turnOrder,
        roundByPlayer,
        turnPlayerId,
        (targetEntry) => !targetEntry.hasSecondChance,
      );
      const self = session.players.find((p) => p.id === turnPlayerId);
      const withSelf =
        self && !candidates.some((player) => player.id === self.id)
          ? [...candidates, self]
          : candidates;
      const targetId = resolveFlip7TargetPlayerId(withSelf, turnPlayerId);
      if (withSelf.length <= 1) {
        onDrawSecondChance(roundIndex, turnPlayerId, targetId);
        return;
      }
      setPickAction(action);
      return;
    }

    const candidates = buildActionCandidates();
    const targetId = resolveFlip7TargetPlayerId(candidates, turnPlayerId);
    if (candidates.length === 0) {
      if (action === 'freeze') {
        onApplyFreeze(roundIndex, turnPlayerId, turnPlayerId);
      } else {
        onApplyFlipThree(roundIndex, turnPlayerId, turnPlayerId);
      }
      return;
    }
    if (candidates.length === 1) {
      if (action === 'freeze') {
        onApplyFreeze(roundIndex, turnPlayerId, targetId);
      } else {
        onApplyFlipThree(roundIndex, turnPlayerId, targetId);
      }
      return;
    }
    setPickAction(action);
  };

  const handlePickPlayer = (targetPlayerId: string) => {
    if (!pickAction || !turnPlayerId) return;
    if (pickAction === 'freeze') {
      onApplyFreeze(roundIndex, turnPlayerId, targetPlayerId);
    } else if (pickAction === 'flipThree') {
      onApplyFlipThree(roundIndex, turnPlayerId, targetPlayerId);
    } else {
      onDrawSecondChance(roundIndex, turnPlayerId, targetPlayerId);
    }
    setPickAction(null);
  };

  const handleRegisterNumber = (number: number) => {
    if (!focusedPlayer || !turnPlayerId) return;
    if (focusedPlayer.id !== turnPlayerId) return;
    const result = onRegisterNumber(roundIndex, focusedPlayer.id, number);
    if (result?.flip7Achieved) {
      setFlip7ModalPlayer(focusedPlayer);
    }
  };

  const handleUndo = () => {
    celebratedFlip7Ref.current.clear();
    setFlip7ModalPlayer(null);
    onUndo();
  };

  const handleSaveFinished = () => {
    setFinishModalVisible(false);
    onFinishMatch();
  };

  const handleAddRound = () => {
    if (!roundComplete) return;
    onAddRound();
  };

  const handleFlip7NextRound = () => {
    setFlip7ModalPlayer(null);
    autoAdvancedRoundRef.current = `${session.rounds.length}-${roundIndex}`;
    onAddRound();
  };

  const pickTitle =
    pickAction === 'freeze'
      ? '¿A quién congelas?'
      : pickAction === 'flipThree'
        ? '¿Quién roba 3?'
        : '¿A quién das Segunda oportunidad?';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={requestExit}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Flip 7</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleUndo}
            disabled={!isCurrentRound || !canUndo}
            hitSlop={12}
            style={({ pressed }) => [
              styles.iconBtn,
              (!isCurrentRound || !canUndo) && styles.iconBtnDisabled,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <Text style={styles.undoIcon}>↩</Text>
          </Pressable>
          <Pressable
            onPress={() => setActionsMenuVisible(true)}
            hitSlop={12}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.roundBanner}>
          <Text style={styles.roundTitle}>
            Ronda {roundNumber}
            {!isCurrentRound ? ' · consulta' : ''}
          </Text>
          <Text style={styles.roundSub}>
            Repartidor: {dealer?.name ?? '—'}
            {isCurrentRound && turnPlayer
              ? ` · Turno: ${turnPlayer.name}`
              : ''}
          </Text>
          <Text style={styles.roundSub}>
            Primer jugador en llegar a {FLIP7_WIN_AT} puntos gana. Al registrar
            carta pasa el turno (salvo roba 3). ↩ deshace paso a paso.
          </Text>
        </View>

        {gameOver ? (
          <View style={styles.gameOverBanner}>
            <Text style={styles.gameOverTitle}>¡Objetivo alcanzado!</Text>
            <Text style={styles.gameOverText}>
              {winners.length > 1
                ? `Empate: ${winners.map((w) => w.name).join(', ')}`
                : `Ganador: ${winners[0]?.name ?? ''}`}
            </Text>
          </View>
        ) : null}

        <View style={styles.rankingPanel}>
          <Text style={styles.rankingTitle}>Clasificación</Text>
          {cumulativeRanking.map(({ player, total }, index) => (
            <View key={player.id} style={styles.rankingRow}>
              <Text style={styles.rankingPos}>{index + 1}.</Text>
              <View
                style={[styles.rankingDot, { backgroundColor: player.color }]}
              />
              <Text style={styles.rankingName} numberOfLines={1}>
                {player.name}
              </Text>
              <Text
                style={[
                  styles.rankingScore,
                  total >= FLIP7_WIN_AT && styles.rankingScoreWin,
                ]}
              >
                {total} pts
              </Text>
            </View>
          ))}
        </View>

        {completedRounds.length > 0 ? (
          <RoundHistory players={session.players} rounds={completedRounds} />
        ) : null}

        <Flip7PlayerStrip
          players={turnOrder}
          roundByPlayer={roundByPlayer}
          turnPlayerId={isCurrentRound ? turnPlayerId : null}
          focusedPlayerId={focusedPlayer?.id ?? ''}
          pendingDraws={roundState.pendingDraws}
          onSelectPlayer={handleSelectStripPlayer}
        />

        <View style={styles.carouselNav}>
          <Pressable
            onPress={() => navigatePlayer(-1)}
            style={({ pressed }) => [styles.navBtn, pressed && styles.iconBtnPressed]}
          >
            <Text style={styles.navBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.carouselLabel} numberOfLines={1}>
            {focusedPlayer?.name ?? '—'}
          </Text>
          <Pressable
            onPress={() => navigatePlayer(1)}
            style={({ pressed }) => [styles.navBtn, pressed && styles.iconBtnPressed]}
          >
            <Text style={styles.navBtnText}>›</Text>
          </Pressable>
        </View>

        {focusedPlayer ? (
          <Flip7ActivePlayerPanel
            player={focusedPlayer}
            entry={roundByPlayer[focusedPlayer.id] ?? emptyFlip7RoundEntry()}
            roundByPlayer={roundByPlayer}
            readOnly={!isCurrentRound}
            isTurnPlayer={
              isCurrentRound && focusedPlayer.id === turnPlayerId
            }
            pendingDraws={roundState.pendingDraws[focusedPlayer.id] ?? 0}
            onAddNumber={handleRegisterNumber}
            onAddModifier={(modifier) =>
              onRegisterModifier(roundIndex, focusedPlayer.id, modifier)
            }
            onSetStatus={(status) =>
              onSetPlayerStatus(roundIndex, focusedPlayer.id, status)
            }
            onFreeze={() => openPickOrAuto('freeze')}
            onFlipThree={() => openPickOrAuto('flipThree')}
            onSecondChance={() => openPickOrAuto('secondChance')}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <RoundPagination
          roundCount={session.rounds.length}
          activeIndex={roundIndex}
          maxRounds={null}
          addRoundLocked={!roundComplete}
          lockedHint="Todos deben plantarse/bloquearse o quedar eliminados para cerrar la ronda"
          onSelectRound={onGoToRound}
          onAddRound={handleAddRound}
        />
      </View>

      <Flip7PickPlayerModal
        visible={pickAction != null}
        title={pickTitle}
        message="Si no hay otro jugador válido, se aplica a ti."
        players={pickCandidates}
        roundByPlayer={roundByPlayer}
        onSelect={handlePickPlayer}
        onCancel={() => setPickAction(null)}
      />

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle="Flip 7"
        onClose={() => setExitModalVisible(false)}
        onSaveAndExit={() => {
          setExitModalVisible(false);
          onSaveAndExit();
        }}
        onDeleteAndExit={() => {
          setExitModalVisible(false);
          onDeleteAndExit();
        }}
      />

      <FinishMatchModal
        visible={finishModalVisible}
        matchTitle="Flip 7"
        onClose={() => setFinishModalVisible(false)}
        onViewResults={handleSaveFinished}
        onSaveFinished={handleSaveFinished}
        onDelete={() => {
          setFinishModalVisible(false);
          onDeleteAndExit();
        }}
      />

      <MatchActionsMenu
        visible={actionsMenuVisible}
        onClose={() => setActionsMenuVisible(false)}
        onViewRanking={() => setRankingModalVisible(true)}
        onEditMatch={() => {}}
        onFinishMatch={() => setFinishModalVisible(true)}
        canEditMatch={false}
      />

      <CurrentRankingModal
        visible={rankingModalVisible}
        onClose={() => setRankingModalVisible(false)}
        ranking={cumulativeRanking.map((entry, index) => ({
          player: entry.player,
          total: entry.total,
          rank: index + 1,
        }))}
      />

      <Flip7CelebrationModal
        visible={flip7ModalPlayer != null}
        player={flip7ModalPlayer}
        onNextRound={handleFlip7NextRound}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconBtnPressed: {
    opacity: 0.7,
  },
  backIcon: {
    fontSize: 24,
    color: theme.text,
    fontWeight: '600',
  },
  menuIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtnDisabled: {
    opacity: 0.35,
  },
  undoIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  roundBanner: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
  roundSub: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  rankingPanel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  rankingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textMuted,
    marginBottom: 4,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  rankingPos: {
    width: 22,
    fontSize: 14,
    fontWeight: '700',
    color: theme.textMuted,
  },
  rankingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rankingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  rankingScore: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.accent,
  },
  rankingScoreWin: {
    color: theme.success,
  },
  carouselNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.text,
    lineHeight: 32,
  },
  carouselLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  gameOverBanner: {
    backgroundColor: theme.success + '22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.success,
    gap: 4,
  },
  gameOverTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.success,
  },
  gameOverText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

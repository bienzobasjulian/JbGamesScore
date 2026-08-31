import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { Flip7CelebrationModal } from '../components/Flip7CelebrationModal';
import { Flip7PlayerRoundPanel } from '../components/Flip7PlayerRoundPanel';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { theme } from '../constants';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { Flip7Modifier, Flip7PlayerRoundStatus, Flip7Session, Player } from '../types';
import {
  calculateFlip7RoundScore,
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

type Props = {
  session: Flip7Session;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onToggleNumber: (roundIndex: number, playerId: string, number: number) => void;
  onToggleModifier: (
    roundIndex: number,
    playerId: string,
    modifier: Flip7Modifier,
  ) => void;
  onSetPlayerStatus: (
    roundIndex: number,
    playerId: string,
    status: Flip7PlayerRoundStatus,
  ) => void;
};

export function Flip7CounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onGoToRound,
  onAddRound,
  onToggleNumber,
  onToggleModifier,
  onSetPlayerStatus,
}: Props) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [flip7ModalPlayer, setFlip7ModalPlayer] = useState<Player | null>(null);
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
  const roundComplete = isFlip7RoundComplete(roundByPlayer, session.players);

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
    () => sortPlayersByFlip7Total(session, session.rounds.length),
    [session],
  );

  const gameOver = hasFlip7GameOver(session, session.rounds.length);
  const winners = useMemo(
    () => getFlip7GameOverWinners(session, session.rounds.length),
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

  const togglePlayer = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
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
        <Pressable
          onPress={() => setActionsMenuVisible(true)}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </Pressable>
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
            Primer jugador en llegar a {FLIP7_WIN_AT} puntos gana. La ronda
            termina con Flip 7 o cuando todos se planten o queden eliminados.
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

        <Text style={styles.sectionHint}>
          «Plantarse/Bloqueado» conserva los puntos. «Eliminado» si repetiste un
          número (0 pts). Cierra la ronda con + cuando todos hayan terminado, o
          con Flip 7.
        </Text>

        {session.players.map((player) => (
          <Flip7PlayerRoundPanel
            key={player.id}
            player={player}
            entry={roundByPlayer[player.id] ?? emptyFlip7RoundEntry()}
            roundByPlayer={roundByPlayer}
            readOnly={!isCurrentRound}
            expanded={expandedPlayers.has(player.id)}
            onToggle={() => togglePlayer(player.id)}
            onToggleNumber={(number) =>
              onToggleNumber(roundIndex, player.id, number)
            }
            onToggleModifier={(modifier) =>
              onToggleModifier(roundIndex, player.id, modifier)
            }
            onSetStatus={(status) =>
              onSetPlayerStatus(roundIndex, player.id, status)
            }
          />
        ))}
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
  sectionHint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
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

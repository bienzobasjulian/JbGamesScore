import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { PiliPiliPlayerRoundPanel } from '../components/PiliPiliPlayerRoundPanel';
import { PiliPiliRoundMissionsPanel } from '../components/PiliPiliRoundMissionsPanel';
import { RoundErrorsModal } from '../components/RoundErrorsModal';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { CardCountStepper } from '../components/CardCountStepper';
import { theme } from '../constants';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import {
  PiliPiliRoundConfig,
  PiliPiliRoundEntry,
  PiliPiliSession,
} from '../types';
import {
  calculatePiliPiliRoundScore,
  emptyPiliPiliRoundConfig,
  emptyPiliPiliRoundEntry,
  getPiliPiliBidSum,
  getPiliPiliPlayersForRound,
  getPiliPiliPlayerTotal,
  getPiliPiliRoundErrors,
  getPiliPiliRoundNumber,
  hasPiliPiliGameOver,
  PILI_PILI_LOSE_AT,
  sortPlayersByPiliPiliTotal,
} from '../utils/piliPili';

type Props = {
  session: PiliPiliSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onUpdateRoundEntry: (
    roundIndex: number,
    playerId: string,
    patch: Partial<PiliPiliRoundEntry>,
  ) => void;
  onUpdateRoundConfig: (
    roundIndex: number,
    patch: Partial<PiliPiliRoundConfig>,
  ) => void;
};

export function PiliPiliCounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onGoToRound,
  onAddRound,
  onUpdateRoundEntry,
  onUpdateRoundConfig,
}: Props) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [missionsExpanded, setMissionsExpanded] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [roundErrorsModalVisible, setRoundErrorsModalVisible] = useState(false);
  const {
    exitModalVisible,
    setExitModalVisible,
    requestExit,
  } = useExitMatchModal();

  const roundIndex = session.activeRoundIndex;
  const roundNumber = getPiliPiliRoundNumber(roundIndex);
  const roundByPlayer = session.rounds[roundIndex] ?? {};
  const roundConfig = session.roundConfigs[roundIndex] ?? emptyPiliPiliRoundConfig();
  const playersInOrder = getPiliPiliPlayersForRound(session.players, roundIndex);
  const cardsDealt = roundConfig.cardsDealt ?? 0;
  const bidSum = getPiliPiliBidSum(roundByPlayer, session.players);
  const roundErrors = useMemo(
    () =>
      getPiliPiliRoundErrors(
        roundByPlayer,
        session.players,
        roundConfig,
        roundIndex,
      ),
    [roundByPlayer, session.players, roundConfig, roundIndex],
  );
  const hasRoundErrors = roundErrors.length > 0;

  const completedRounds = useMemo(
    () =>
      session.rounds.slice(0, roundIndex).map((roundByPlayerAtRound, index) => {
        const config = session.roundConfigs[index] ?? emptyPiliPiliRoundConfig();
        const scores: Record<string, number> = {};
        for (const player of session.players) {
          scores[player.id] = calculatePiliPiliRoundScore(
            roundByPlayerAtRound,
            config,
            player.id,
          );
        }
        return scores;
      }),
    [session.players, session.rounds, session.roundConfigs, roundIndex],
  );

  const cumulativeRanking = useMemo(
    () => sortPlayersByPiliPiliTotal(session, session.rounds.length),
    [session],
  );

  const gameOver = hasPiliPiliGameOver(session, session.rounds.length);

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

  const showRoundErrorsModal = () => {
    if (roundErrors.length > 0) {
      setRoundErrorsModalVisible(true);
    }
  };

  const handleAddRound = () => {
    if (gameOver) {
      setFinishModalVisible(true);
      return;
    }
    if (hasRoundErrors) {
      showRoundErrorsModal();
      return;
    }
    onAddRound();
  };

  const handleSaveFinished = () => {
    setFinishModalVisible(false);
    onFinishMatch();
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
        <Text style={styles.headerTitle}>Pili pili</Text>
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
          <Text style={styles.roundTitle}>Ronda {roundNumber}</Text>
          <Text style={styles.roundSub}>
            Reparte {playersInOrder[0]?.name ?? '—'}
          </Text>

          <View style={styles.cardsDealtRow}>
            <View style={styles.cardsDealtInfo}>
              <Text style={styles.cardsDealtLabel}>Cartas repartidas</Text>
              <Text style={styles.cardsDealtHint}>
                Por jugador en esta ronda
              </Text>
            </View>
            <CardCountStepper
              value={cardsDealt}
              onChange={(next) =>
                onUpdateRoundConfig(roundIndex, { cardsDealt: next })
              }
              max={52}
            />
          </View>

          {cardsDealt > 0 ? (
            <Text style={styles.roundSub}>
              Suma apuestas: {bidSum} · El último en apostar debe evitar total de{' '}
              {cardsDealt}
            </Text>
          ) : null}
          {gameOver ? (
            <Text style={styles.gameOverWarn}>
              Alguien llegó a {PILI_PILI_LOSE_AT} Pilis. Pulsa + para finalizar.
            </Text>
          ) : null}
        </View>

        {completedRounds.length > 0 ? (
          <RoundHistory
            players={session.players}
            rounds={completedRounds}
            floorTotalAtZero
          />
        ) : null}

        <PiliPiliRoundMissionsPanel
          config={roundConfig}
          expanded={missionsExpanded}
          onToggle={() => setMissionsExpanded((v) => !v)}
          onChange={(patch) => onUpdateRoundConfig(roundIndex, patch)}
        />

        <Text style={styles.sectionHint}>
          Orden de apuestas: empieza el repartidor. Toca un jugador para registrar
          apuesta y bazas ganadas.
        </Text>

        {playersInOrder.map((player) => (
          <PiliPiliPlayerRoundPanel
            key={player.id}
            player={player}
            allPlayers={session.players}
            players={playersInOrder}
            roundIndex={roundIndex}
            roundByPlayer={roundByPlayer}
            config={roundConfig}
            entry={roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry()}
            totalBeforeRound={getPiliPiliPlayerTotal(
              session,
              player.id,
              roundIndex,
            )}
            expanded={expandedPlayers.has(player.id)}
            onToggle={() => togglePlayer(player.id)}
            onChange={(patch) =>
              onUpdateRoundEntry(roundIndex, player.id, patch)
            }
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <RoundPagination
          roundCount={session.rounds.length}
          activeIndex={roundIndex}
          maxRounds={null}
          onSelectRound={onGoToRound}
          onAddRound={handleAddRound}
        />
      </View>

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle="Pili pili"
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

      <RoundErrorsModal
        visible={roundErrorsModalVisible}
        errors={roundErrors}
        onClose={() => setRoundErrorsModalVisible(false)}
      />

      <FinishMatchModal
        visible={finishModalVisible}
        matchTitle="Pili pili"
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
    gap: 10,
    marginBottom: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconBtnPressed: {
    opacity: 0.8,
  },
  backIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '600',
  },
  menuIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '800',
    lineHeight: 24,
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
    gap: 4,
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.accent,
  },
  roundSub: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
  },
  cardsDealtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cardsDealtInfo: {
    flex: 1,
    gap: 2,
  },
  cardsDealtLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  cardsDealtHint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  gameOverWarn: {
    fontSize: 13,
    color: theme.danger,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  footer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { SkullKingPlayerRoundPanel } from '../components/SkullKingPlayerRoundPanel';
import { theme } from '../constants';
import { SkullKingRoundEntry, SkullKingSession } from '../types';
import {
  calculateSkullKingRoundScore,
  emptySkullKingRoundEntry,
  getSkullKingCardsDealt,
  getSkullKingRoundNumber,
  SKULL_KING_TOTAL_ROUNDS,
  sortPlayersBySkullKingTotal,
} from '../utils/skullKing';

type Props = {
  session: SkullKingSession;
  onBack: () => void;
  onFinishMatch: () => void;
  onGoToRound: (roundIndex: number) => void;
  onUpdateRoundEntry: (
    roundIndex: number,
    playerId: string,
    patch: Partial<SkullKingRoundEntry>,
  ) => void;
};

export function SkullKingCounterScreen({
  session,
  onBack,
  onFinishMatch,
  onGoToRound,
  onUpdateRoundEntry,
}: Props) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);

  const roundIndex = session.activeRoundIndex;
  const roundNumber = getSkullKingRoundNumber(roundIndex);
  const cardsDealt = getSkullKingCardsDealt(roundIndex);
  const roundByPlayer = session.rounds[roundIndex] ?? {};

  const completedRounds = useMemo(
    () =>
      session.rounds.slice(0, roundIndex).map((roundByPlayerAtRound, index) => {
        const roundNumberAtIndex = getSkullKingRoundNumber(index);
        const scores: Record<string, number> = {};
        for (const player of session.players) {
          const entry =
            roundByPlayerAtRound[player.id] ?? emptySkullKingRoundEntry();
          scores[player.id] = calculateSkullKingRoundScore(roundNumberAtIndex, entry);
        }
        return scores;
      }),
    [session.players, session.rounds, roundIndex],
  );

  const ranking = useMemo(
    () => sortPlayersBySkullKingTotal(session, roundIndex),
    [session, roundIndex],
  );

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Skull King</Text>
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
            Ronda {roundNumber} de {SKULL_KING_TOTAL_ROUNDS}
          </Text>
          <Text style={styles.roundSub}>
            {cardsDealt} {cardsDealt === 1 ? 'carta' : 'cartas'} por jugador ·
            Apuesta de 0 a {roundNumber}
          </Text>
        </View>

        {completedRounds.length > 0 ? (
          <RoundHistory players={session.players} rounds={completedRounds} />
        ) : null}

        <Text style={styles.sectionHint}>
          Toca un jugador para registrar apuesta, bazas ganadas y bonificaciones
          de esta ronda.
        </Text>

        {session.players.map((player) => (
          <SkullKingPlayerRoundPanel
            key={player.id}
            player={player}
            roundIndex={roundIndex}
            entry={roundByPlayer[player.id] ?? emptySkullKingRoundEntry()}
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
          roundCount={SKULL_KING_TOTAL_ROUNDS}
          activeIndex={roundIndex}
          maxRounds={SKULL_KING_TOTAL_ROUNDS}
          onSelectRound={onGoToRound}
          onAddRound={() => setFinishModalVisible(true)}
        />
      </View>

      <FinishMatchModal
        visible={finishModalVisible}
        matchTitle="Skull King"
        onClose={() => setFinishModalVisible(false)}
        onViewResults={handleSaveFinished}
        onSaveFinished={handleSaveFinished}
        onDelete={() => {
          setFinishModalVisible(false);
          onBack();
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
        ranking={ranking.map((entry, index) => ({
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

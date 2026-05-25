import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { FinishMatchButton } from '../components/FinishMatchButton';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { RoundPagination } from '../components/RoundPagination';
import { SkullKingPlayerRoundPanel } from '../components/SkullKingPlayerRoundPanel';
import { theme } from '../constants';
import { SkullKingRoundEntry, SkullKingSession } from '../types';
import {
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

  const roundIndex = session.activeRoundIndex;
  const roundNumber = getSkullKingRoundNumber(roundIndex);
  const cardsDealt = getSkullKingCardsDealt(roundIndex);
  const roundByPlayer = session.rounds[roundIndex] ?? {};

  const completedRounds = roundIndex;
  const ranking = useMemo(
    () => sortPlayersBySkullKingTotal(session, roundIndex),
    [session, roundIndex],
  );
  const rankingHint =
    completedRounds === 0
      ? 'Se actualiza al pasar a la siguiente ronda'
      : completedRounds === 1
        ? 'Suma de la ronda 1'
        : `Suma de las rondas 1 a ${completedRounds}`;

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
      <AppHeader title="Skull King" onBack={onBack} />

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

        <View style={styles.rankingPanel}>
          <Text style={styles.rankingTitle}>Clasificación total</Text>
          <Text style={styles.rankingHint}>{rankingHint}</Text>
          {ranking.map(({ player, total }, index) => (
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
                  total < 0 && styles.rankingScoreNegative,
                ]}
              >
                {total} pts
              </Text>
            </View>
          ))}
        </View>

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
          onAddRound={() => {}}
        />
        <FinishMatchButton onPress={() => setFinishModalVisible(true)} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  rankingHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 6,
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
  rankingScoreNegative: {
    color: theme.danger,
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

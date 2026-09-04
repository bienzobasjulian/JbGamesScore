import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { HowToPlayScreen } from '../components/HowToPlayScreen';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { SkullKingPlayerRoundPanel } from '../components/SkullKingPlayerRoundPanel';
import { TourAnchor, TourScrollView, useAutoTour, useOnboarding } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { SkullKingRoundEntry, SkullKingSession } from '../types';
import {
  calculateSkullKingRoundScore,
  emptySkullKingRoundEntry,
  getSkullKingCardsDealt,
  getSkullKingRoundNumber,
  getSkullKingRoundRoles,
  SKULL_KING_HOW_TO_PLAY_SECTIONS,
  SKULL_KING_TOTAL_ROUNDS,
  sortPlayersBySkullKingTotal,
} from '../utils/skullKing';

type Props = {
  session: SkullKingSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
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
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onGoToRound,
  onUpdateRoundEntry,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { startTour } = useOnboarding();
  useAutoTour('skullKing');

  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [howToVisible, setHowToVisible] = useState(false);
  const {
    exitModalVisible,
    setExitModalVisible,
    requestExit,
  } = useExitMatchModal();

  const roundIndex = session.activeRoundIndex;
  const roundNumber = getSkullKingRoundNumber(roundIndex);
  const cardsDealt = getSkullKingCardsDealt(roundIndex);
  const roundByPlayer = session.rounds[roundIndex] ?? {};
  const { dealerId, starterId } = getSkullKingRoundRoles(
    session.players,
    roundIndex,
  );
  const dealerName =
    session.players.find((player) => player.id === dealerId)?.name;
  const starterName =
    session.players.find((player) => player.id === starterId)?.name;

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

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (howToVisible) {
        setHowToVisible(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [howToVisible]);

  if (howToVisible) {
    return (
      <View style={styles.container}>
        <HowToPlayScreen
          title="Cómo jugar"
          sections={SKULL_KING_HOW_TO_PLAY_SECTIONS}
          onBack={() => setHowToVisible(false)}
        />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Skull King</Text>
        <TourAnchor id="rounds.menu">
          <Pressable
            onPress={() => setActionsMenuVisible(true)}
            hitSlop={12}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </Pressable>
        </TourAnchor>
      </View>

      <TourScrollView
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
          {dealerName && starterName ? (
            <Text style={styles.roundRoles}>
              Reparte {dealerName} · Jugador inicial de la ronda: {starterName}
            </Text>
          ) : null}
        </View>

        {completedRounds.length > 0 ? (
          <RoundHistory players={session.players} rounds={completedRounds} />
        ) : null}

        <Text style={styles.sectionHint}>
          El jugador inicial abre la primera baza de la ronda. Toca un jugador
          para registrar apuesta, bazas y bonificaciones.
        </Text>

        {session.players.map((player, index) => {
          const panel = (
            <SkullKingPlayerRoundPanel
              player={player}
              roundIndex={roundIndex}
              entry={roundByPlayer[player.id] ?? emptySkullKingRoundEntry()}
              expanded={expandedPlayers.has(player.id)}
              isDealer={player.id === dealerId}
              isRoundStarter={player.id === starterId}
              onToggle={() => togglePlayer(player.id)}
              onChange={(patch) =>
                onUpdateRoundEntry(roundIndex, player.id, patch)
              }
            />
          );
          if (index === 0) {
            return (
              <TourAnchor id="skullKing.players" key={player.id}>
                {panel}
              </TourAnchor>
            );
          }
          return <View key={player.id}>{panel}</View>;
        })}
      </TourScrollView>

      <View style={styles.footer}>
        <TourAnchor id="skullKing.rounds">
          <RoundPagination
            roundCount={SKULL_KING_TOTAL_ROUNDS}
            activeIndex={roundIndex}
            maxRounds={SKULL_KING_TOTAL_ROUNDS}
            onSelectRound={onGoToRound}
            onAddRound={() => setFinishModalVisible(true)}
          />
        </TourAnchor>
      </View>

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle="Skull King"
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
        matchTitle="Skull King"
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
        onViewRanking={
          session.players.length > 1
            ? () => setRankingModalVisible(true)
            : undefined
        }
        onEditMatch={() => {}}
        onFinishMatch={() => setFinishModalVisible(true)}
        canEditMatch={false}
        onViewTutorial={() => startTour('skullKing', { force: true })}
        onHowToPlay={() => setHowToVisible(true)}
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
  roundRoles: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text,
    lineHeight: 19,
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

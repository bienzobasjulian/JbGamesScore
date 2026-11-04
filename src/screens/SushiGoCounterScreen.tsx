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
import { SushiGoPlayerRoundPanel } from '../components/SushiGoPlayerRoundPanel';
import { TourScrollView } from '../onboarding';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { useThemedStyles, type AppTheme } from '../theme';
import { SushiGoRoundEntry, SushiGoSession } from '../types';
import {
  emptySushiGoRoundEntry,
  getSushiGoPuddingBeforeRound,
  getSushiGoRoundScoreList,
  getSushiGoStandings,
  rankSushiGoStandings,
  SUSHI_GO_HOW_TO_PLAY_SECTIONS,
  SUSHI_GO_TOTAL_ROUNDS,
  sushiGoHandSize,
} from '../utils/sushiGo';

type Props = {
  session: SushiGoSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onGoToRound: (roundIndex: number) => void;
  onUpdateRoundEntry: (
    roundIndex: number,
    playerId: string,
    patch: Partial<SushiGoRoundEntry>,
  ) => void;
};

export function SushiGoCounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onGoToRound,
  onUpdateRoundEntry,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [howToVisible, setHowToVisible] = useState(false);
  const { exitModalVisible, setExitModalVisible, requestExit } =
    useExitMatchModal();

  const roundIndex = session.activeRoundIndex;
  const roundNumber = roundIndex + 1;
  const handSize = sushiGoHandSize(session.players.length);
  const roundByPlayer = session.rounds[roundIndex] ?? {};

  const roundRows = useMemo(
    () => getSushiGoRoundScoreList(session.players, roundByPlayer),
    [session.players, roundByPlayer],
  );
  const roundRowById = useMemo(() => {
    const map = new Map(roundRows.map((row) => [row.playerId, row]));
    return map;
  }, [roundRows]);

  const standings = useMemo(() => getSushiGoStandings(session), [session]);
  const ranking = useMemo(() => rankSushiGoStandings(standings), [standings]);
  const standingById = useMemo(() => {
    const map = new Map(standings.map((row) => [row.player.id, row]));
    return map;
  }, [standings]);

  const completedRounds = useMemo(
    () =>
      session.rounds.slice(0, roundIndex).map((round) => {
        const scores: Record<string, number> = {};
        for (const row of getSushiGoRoundScoreList(session.players, round)) {
          scores[row.playerId] = row.total;
        }
        return scores;
      }),
    [session.players, session.rounds, roundIndex],
  );

  const togglePlayer = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
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
          sections={SUSHI_GO_HOW_TO_PLAY_SECTIONS}
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
        <Text style={styles.headerTitle}>Sushi Go</Text>
        <Pressable
          onPress={() => setActionsMenuVisible(true)}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <Text style={styles.menuIcon}>⋮</Text>
        </Pressable>
      </View>

      <TourScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.roundBanner}>
          <Text style={styles.roundTitle}>
            Ronda {roundNumber} de {SUSHI_GO_TOTAL_ROUNDS}
          </Text>
          <Text style={styles.roundSub}>{handSize} cartas por jugador</Text>
        </View>

        {completedRounds.length > 0 ? (
          <RoundHistory players={session.players} rounds={completedRounds} />
        ) : null}

        <Text style={styles.sectionHint}>
          Anota las cartas que cada jugador tiene delante al acabar la ronda.
          La última carta de la mano se pone boca arriba con el resto.
        </Text>

        {session.players.map((player) => {
          const row = roundRowById.get(player.id);
          const standing = standingById.get(player.id);
          return (
            <SushiGoPlayerRoundPanel
              key={player.id}
              player={player}
              entry={roundByPlayer[player.id] ?? emptySushiGoRoundEntry()}
              expanded={expandedPlayers.has(player.id)}
              handSize={handSize}
              roundScore={row?.total ?? 0}
              makiPoints={row?.maki ?? 0}
              totalScore={standing?.total ?? 0}
              puddingCount={standing?.puddingCount ?? 0}
              carriedPudding={getSushiGoPuddingBeforeRound(
                session,
                player.id,
                roundIndex,
              )}
              onToggle={() => togglePlayer(player.id)}
              onChange={(patch) =>
                onUpdateRoundEntry(roundIndex, player.id, patch)
              }
            />
          );
        })}
      </TourScrollView>

      <View style={styles.footer}>
        <RoundPagination
          roundCount={SUSHI_GO_TOTAL_ROUNDS}
          activeIndex={roundIndex}
          maxRounds={SUSHI_GO_TOTAL_ROUNDS}
          onSelectRound={onGoToRound}
          onAddRound={() => setFinishModalVisible(true)}
        />
      </View>

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle="Sushi Go"
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
        matchTitle="Sushi Go"
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
        onHowToPlay={() => setHowToVisible(true)}
      />

      <CurrentRankingModal
        visible={rankingModalVisible}
        onClose={() => setRankingModalVisible(false)}
        ranking={ranking.map(({ standing, rank }) => ({
          player: standing.player,
          total: standing.total,
          rank,
        }))}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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

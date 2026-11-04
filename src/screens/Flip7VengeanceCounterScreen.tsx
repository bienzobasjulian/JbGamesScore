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
import { Flip7VengeancePlayerRoundPanel } from '../components/Flip7VengeancePlayerRoundPanel';
import { HowToPlayScreen } from '../components/HowToPlayScreen';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { RoundErrorsModal } from '../components/RoundErrorsModal';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPagination } from '../components/RoundPagination';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { TourAnchor, TourScrollView, useAutoTour, useOnboarding } from '../onboarding';
import { useThemedStyles, type AppTheme } from '../theme';
import {
  Flip7VengeanceModifier,
  Flip7VengeanceSession,
  Flip7VengeanceSpecial,
} from '../types';
import {
  emptyFlip7VengeanceRoundEntry,
  FLIP7_VENGEANCE_HOW_TO_PLAY,
  FLIP7_VENGEANCE_HOW_TO_PLAY_ITEMS,
  FLIP7_VENGEANCE_WIN_AT,
  getFlip7VengeanceGameOverWinners,
  getFlip7VengeanceRoundNumberErrors,
  getFlip7VengeanceRoundScore,
  hasFlip7VengeanceGameOver,
  sortPlayersByFlip7VengeanceTotal,
} from '../utils/flip7Vengeance';

type Props = {
  session: Flip7VengeanceSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onGoToRound: (roundIndex: number) => void;
  onAddRound: () => void;
  onCycleNumber: (roundIndex: number, playerId: string, number: number) => void;
  onToggleModifier: (
    roundIndex: number,
    playerId: string,
    modifier: Flip7VengeanceModifier,
  ) => void;
  onToggleSpecial: (
    roundIndex: number,
    playerId: string,
    special: Flip7VengeanceSpecial,
  ) => void;
  onStealFrom: (
    roundIndex: number,
    playerId: string,
    targetId: string | null,
  ) => void;
  onClearPlayer: (roundIndex: number, playerId: string) => void;
};

export function Flip7VengeanceCounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onGoToRound,
  onAddRound,
  onCycleNumber,
  onToggleModifier,
  onToggleSpecial,
  onStealFrom,
  onClearPlayer,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const { startTour } = useOnboarding();
  useAutoTour('flip7Vengeance');
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [roundErrorsModalVisible, setRoundErrorsModalVisible] = useState(false);
  const [howToVisible, setHowToVisible] = useState(false);
  const { exitModalVisible, setExitModalVisible, requestExit } =
    useExitMatchModal();

  const roundIndex = session.activeRoundIndex;
  const isCurrentRound = roundIndex === session.rounds.length - 1;
  const roundByPlayer = session.rounds[roundIndex] ?? {};
  const roundNumberErrors = useMemo(
    () => getFlip7VengeanceRoundNumberErrors(roundByPlayer),
    [roundByPlayer],
  );

  const completedRounds = useMemo(
    () =>
      session.rounds.slice(0, roundIndex).map((round) => {
        const scores: Record<string, number> = {};
        for (const player of session.players) {
          scores[player.id] = getFlip7VengeanceRoundScore(
            round,
            player.id,
            session.brutal,
          );
        }
        return scores;
      }),
    [session.players, session.rounds, session.brutal, roundIndex],
  );

  const cumulativeRanking = useMemo(
    () => sortPlayersByFlip7VengeanceTotal(session),
    [session],
  );
  const gameOver = hasFlip7VengeanceGameOver(session);
  const winners = useMemo(
    () => getFlip7VengeanceGameOverWinners(session),
    [session],
  );

  const togglePlayer = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
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
          body={FLIP7_VENGEANCE_HOW_TO_PLAY}
          items={FLIP7_VENGEANCE_HOW_TO_PLAY_ITEMS}
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
        <Text style={styles.headerTitle}>Flip7 Venganza</Text>
        <TourAnchor id="flip7Vengeance.menu">
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
            Ronda {roundIndex + 1}
            {!isCurrentRound ? ' · edición' : ''}
          </Text>
          <Text style={styles.roundSub}>
            Anota lo que queda delante de cada jugador. Gana quien más puntos
            tenga al llegar alguien a {FLIP7_VENGEANCE_WIN_AT}.
            {session.brutal ? ' Modo brutal activo.' : ''}
          </Text>
        </View>

        {gameOver ? (
          <View style={styles.gameOverBanner}>
            <Text style={styles.gameOverTitle}>Objetivo alcanzado</Text>
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
              <PlayerAvatar
                name={player.name}
                color={player.color}
                avatar={player.avatar}
                size={28}
                radius={8}
              />
              <Text style={styles.rankingName} numberOfLines={1}>
                {player.name}
              </Text>
              <Text
                style={[
                  styles.rankingScore,
                  total >= FLIP7_VENGEANCE_WIN_AT && styles.rankingScoreWin,
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

        {session.players.map((player, index) => {
          const panel = (
          <Flip7VengeancePlayerRoundPanel
            player={player}
            players={session.players}
            entry={roundByPlayer[player.id] ?? emptyFlip7VengeanceRoundEntry()}
            brutal={session.brutal}
            roundScore={getFlip7VengeanceRoundScore(
              roundByPlayer,
              player.id,
              session.brutal,
            )}
            expanded={expandedPlayers.has(player.id)}
            onToggle={() => togglePlayer(player.id)}
            onCycleNumber={(number) =>
              onCycleNumber(roundIndex, player.id, number)
            }
            onToggleModifier={(modifier) =>
              onToggleModifier(roundIndex, player.id, modifier)
            }
            onToggleSpecial={(special) =>
              onToggleSpecial(roundIndex, player.id, special)
            }
            onStealFrom={(targetId) =>
              onStealFrom(roundIndex, player.id, targetId)
            }
            onClear={() => onClearPlayer(roundIndex, player.id)}
          />
          );
          if (index === 0) {
            return (
              <TourAnchor id="flip7Vengeance.players" key={player.id}>
                {panel}
              </TourAnchor>
            );
          }
          return <View key={player.id}>{panel}</View>;
        })}
      </TourScrollView>

      <View style={styles.footer}>
        <TourAnchor id="flip7Vengeance.rounds">
        <RoundPagination
          roundCount={session.rounds.length}
          activeIndex={roundIndex}
          maxRounds={null}
          onSelectRound={onGoToRound}
          onAddRound={() => {
            if (roundNumberErrors.length > 0) {
              setRoundErrorsModalVisible(true);
              return;
            }
            onAddRound();
          }}
        />
        </TourAnchor>
      </View>

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle="Flip7 Venganza"
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
        matchTitle="Flip7 Venganza"
        onClose={() => setFinishModalVisible(false)}
        onViewResults={() => {
          setFinishModalVisible(false);
          onFinishMatch();
        }}
        onSaveFinished={() => {
          setFinishModalVisible(false);
          onFinishMatch();
        }}
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
        onViewTutorial={() => startTour('flip7Vengeance', { force: true })}
        onHowToPlay={() => setHowToVisible(true)}
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

      <RoundErrorsModal
        visible={roundErrorsModalVisible}
        errors={roundNumberErrors}
        onClose={() => setRoundErrorsModalVisible(false)}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, padding: 20 },
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
    iconBtnPressed: { opacity: 0.7 },
    backIcon: { fontSize: 24, color: theme.text, fontWeight: '600' },
    menuIcon: { fontSize: 22, color: theme.text, fontWeight: '800' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.text },
    scroll: { flex: 1 },
    scrollContent: { gap: 14, paddingBottom: 12 },
    roundBanner: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    roundTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
    roundSub: { fontSize: 13, color: theme.textMuted, lineHeight: 18 },
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
    rankingName: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.text },
    rankingScore: { fontSize: 15, fontWeight: '800', color: theme.accent },
    rankingScoreWin: { color: theme.success },
    gameOverBanner: {
      backgroundColor: theme.success + '22',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.success,
      gap: 4,
    },
    gameOverTitle: { fontSize: 16, fontWeight: '800', color: theme.success },
    gameOverText: { fontSize: 14, color: theme.text, fontWeight: '600' },
    footer: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
  });

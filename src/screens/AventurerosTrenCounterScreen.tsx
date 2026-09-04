import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AventurerosTrenPlayerPanel } from '../components/AventurerosTrenPlayerPanel';
import { Button } from '../components/Button';
import { CurrentRankingModal } from '../components/CurrentRankingModal';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchButton } from '../components/FinishMatchButton';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { HowToPlayScreen } from '../components/HowToPlayScreen';
import { MatchActionsMenu } from '../components/MatchActionsMenu';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { TourAnchor, TourScrollView, useAutoTour, useOnboarding } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import {
  AventurerosTrenDestinationEntry,
  AventurerosTrenPhase,
  AventurerosTrenPlayerScoring,
  AventurerosTrenRouteEntry,
  AventurerosTrenSession,
} from '../types';
import {
  createDefaultPlayerScoring,
  compareAventurerosTrenCriteria,
  getAventurerosTrenHowToPlay,
  getSubmodeLabel,
  getTakenDestinationTickets,
  sortPlayersByAventurerosTrenTotal,
} from '../utils/aventurerosTren';

type Props = {
  session: AventurerosTrenSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onSetPhase: (phase: AventurerosTrenPhase) => void;
  onAddRoute: (playerId: string) => void;
  onUpdateRoute: (
    playerId: string,
    routeId: string,
    patch: Partial<AventurerosTrenRouteEntry>,
  ) => void;
  onRemoveRoute: (playerId: string, routeId: string) => void;
  onAddDestination: (
    playerId: string,
    ticket: {
      origin: string;
      destination: string;
      points: number;
    },
  ) => void;
  onUpdateDestination: (
    playerId: string,
    destId: string,
    patch: Partial<AventurerosTrenDestinationEntry>,
  ) => void;
  onRemoveDestination: (playerId: string, destId: string) => void;
  onUpdatePlayerScoring: (
    playerId: string,
    patch: Partial<AventurerosTrenPlayerScoring>,
  ) => void;
};

export function AventurerosTrenCounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onSetPhase,
  onAddRoute,
  onUpdateRoute,
  onRemoveRoute,
  onAddDestination,
  onUpdateDestination,
  onRemoveDestination,
  onUpdatePlayerScoring,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { startTour, skipTour, activeStep, activeTourId } = useOnboarding();

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

  const phase = session.activePhase;
  const isConstruccion = phase === 'construccion';
  const phaseTourId = isConstruccion
    ? 'aventurerosConstruccion'
    : 'aventurerosDestinos';
  useAutoTour('aventurerosConstruccion', { enabled: isConstruccion });
  useAutoTour('aventurerosDestinos', { enabled: !isConstruccion });
  const title = getSubmodeLabel(session.submode);

  const ranking = useMemo(() => {
    const sorted = sortPlayersByAventurerosTrenTotal(session);
    let rank = 0;
    let prev: (typeof sorted)[number] | null = null;
    return sorted.map((row, index) => {
      if (
        !prev ||
        compareAventurerosTrenCriteria(row, prev, session.submode) !== 0
      ) {
        rank = index + 1;
        prev = row;
      }
      return { ...row, rank };
    });
  }, [session]);
  const takenTickets = useMemo(
    () => getTakenDestinationTickets(session),
    [session],
  );
  const howToPlay = useMemo(
    () => getAventurerosTrenHowToPlay(session.submode),
    [session.submode],
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

  const firstPlayerId = session.players[0]?.id;
  useEffect(() => {
    const stepId = activeStep?.id;
    if (!stepId?.startsWith('aventureros.')) return;
    if (!firstPlayerId) return;
    setExpandedPlayers((prev) => {
      if (prev.size === 1 && prev.has(firstPlayerId)) return prev;
      return new Set([firstPlayerId]);
    });
  }, [activeStep?.id, firstPlayerId]);

  useEffect(() => {
    if (!activeTourId) return;
    if (isConstruccion && activeTourId === 'aventurerosDestinos') {
      skipTour();
    }
    if (!isConstruccion && activeTourId === 'aventurerosConstruccion') {
      skipTour();
    }
  }, [activeTourId, isConstruccion, skipTour]);

  const phaseIntro = isConstruccion
    ? session.submode === 'europa'
      ? 'Longitudes de vía: 1, 2, 3, 4, 6 y 8. Origen y destino opcionales.'
      : 'Longitudes de vía: 1, 2, 3, 4, 5 y 6. Origen y destino opcionales.'
    : session.submode === 'europa'
      ? 'Elige destinos de la lista. Ruta más larga (+10) y estaciones sin usar (+4 c/u).'
      : 'Elige destinos de la lista y la ruta más larga (+10). Desempate por billetes completados.';

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
          body={howToPlay.body}
          items={howToPlay.items}
          onBack={() => setHowToVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={title}
        onBack={requestExit}
        onMenuPress={() => setActionsMenuVisible(true)}
        menuIcon="more"
      />

      <TourScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.phaseBadge}>
          Fase: {isConstruccion ? 'Construcción' : 'Destinos'}
        </Text>
        <Text style={styles.phaseIntro}>{phaseIntro}</Text>

        <View style={styles.rankingPanel}>
          <Text style={styles.rankingTitle}>Clasificación</Text>
          {ranking.map(
            ({
              player,
              construccion,
              destinosCards,
              bonuses,
              total,
              rank,
            }) => (
              <View key={player.id} style={styles.rankingRow}>
                <Text style={styles.rankingPos}>{rank}.</Text>
                <PlayerAvatar
                  name={player.name}
                  color={player.color}
                  avatar={player.avatar}
                  size={28}
                  radius={8}
                />
                <View style={styles.rankingTexts}>
                  <Text style={styles.rankingName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={styles.rankingSub}>
                    Constr. {construccion} · Dest.{' '}
                    {destinosCards > 0 ? '+' : ''}
                    {destinosCards}
                    {bonuses > 0 ? ` · Bonif. +${bonuses}` : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rankingScore,
                    total < 0 && styles.rankingScoreNegative,
                  ]}
                >
                  {total} pts
                </Text>
              </View>
            ),
          )}
        </View>

        {session.players.map((player, index) => {
          const panel = (
            <AventurerosTrenPlayerPanel
              player={player}
              submode={session.submode}
              phase={phase}
              routes={session.construccion[player.id] ?? []}
              destinations={session.destinos[player.id] ?? []}
              takenTickets={takenTickets}
              scoring={
                session.scoring[player.id] ??
                createDefaultPlayerScoring(session.submode)
              }
              expanded={expandedPlayers.has(player.id)}
              onToggle={() => togglePlayer(player.id)}
              onAddRoute={() => onAddRoute(player.id)}
              onUpdateRoute={(routeId, patch) =>
                onUpdateRoute(player.id, routeId, patch)
              }
              onRemoveRoute={(routeId) => onRemoveRoute(player.id, routeId)}
              onAddDestination={(ticket) =>
                onAddDestination(player.id, ticket)
              }
              onUpdateDestination={(destId, patch) =>
                onUpdateDestination(player.id, destId, patch)
              }
              onRemoveDestination={(destId) =>
                onRemoveDestination(player.id, destId)
              }
              onUpdateScoring={(patch) =>
                onUpdatePlayerScoring(player.id, patch)
              }
            />
          );
          if (index === 0) {
            return (
              <TourAnchor id="aventureros.players" key={player.id}>
                {panel}
              </TourAnchor>
            );
          }
          return <View key={player.id}>{panel}</View>;
        })}
      </TourScrollView>

      <View style={styles.footer}>
        <TourAnchor id="aventureros.phase">
          {isConstruccion ? (
            <Button
              label="Finalizar fase de construcción"
              onPress={() => onSetPhase('destinos')}
            />
          ) : (
            <Button
              label="Volver a construcción"
              onPress={() => onSetPhase('construccion')}
              variant="secondary"
            />
          )}
        </TourAnchor>
        <FinishMatchButton onPress={() => setFinishModalVisible(true)} />
      </View>

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle={title}
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
        matchTitle={title}
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
        onViewTutorial={() => startTour(phaseTourId, { force: true })}
        onHowToPlay={() => setHowToVisible(true)}
      />

      <CurrentRankingModal
        visible={rankingModalVisible}
        onClose={() => setRankingModalVisible(false)}
        ranking={ranking.map((entry) => ({
          player: entry.player,
          total: entry.total,
          rank: entry.rank,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  phaseBadge: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.accent,
  },
  phaseIntro: {
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
  rankingTexts: {
    flex: 1,
    gap: 2,
  },
  rankingName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  rankingSub: {
    fontSize: 11,
    color: theme.textMuted,
  },
  rankingScore: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.accent,
  },
  rankingScoreNegative: {
    color: theme.danger,
  },
  footer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

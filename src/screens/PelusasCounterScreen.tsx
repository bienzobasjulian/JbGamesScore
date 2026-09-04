import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ExitMatchModal } from '../components/ExitMatchModal';
import { FinishMatchButton } from '../components/FinishMatchButton';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { GameOverflowMenu } from '../components/GameOverflowMenu';
import { HowToPlayScreen } from '../components/HowToPlayScreen';
import { PelusasPlayerPanel } from '../components/PelusasPlayerPanel';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { TourAnchor, TourScrollView, useAutoTour, useOnboarding } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { useExitMatchModal } from '../hooks/useExitMatchModal';
import { PelusasSession } from '../types';
import {
  emptyPelusasCounts,
  PELUSAS_HOW_TO_PLAY,
  sortPlayersByPelusasScore,
} from '../utils/pelusas';

type Props = {
  session: PelusasSession;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
  onFinishMatch: () => void;
  onSetRevolutionMode: (enabled: boolean) => void;
  onSetCardCount: (
    playerId: string,
    cardValue: number,
    count: number,
  ) => void;
  onResetCounts: () => void;
  onEditMatch: () => void;
};

export function PelusasCounterScreen({
  session,
  onSaveAndExit,
  onDeleteAndExit,
  onFinishMatch,
  onSetRevolutionMode,
  onSetCardCount,
  onResetCounts,
  onEditMatch,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { startTour } = useOnboarding();
  useAutoTour('pelusas');

  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [actionsMenuVisible, setActionsMenuVisible] = useState(false);
  const [howToVisible, setHowToVisible] = useState(false);
  const {
    exitModalVisible,
    setExitModalVisible,
    requestExit,
  } = useExitMatchModal();

  const ranking = useMemo(
    () =>
      sortPlayersByPelusasScore(
        session.players,
        session.countsByPlayer,
        session.revolutionMode,
      ),
    [session],
  );

  const leader = ranking[0];

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
      if (actionsMenuVisible) {
        setActionsMenuVisible(false);
        return true;
      }
      if (howToVisible) {
        setHowToVisible(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [actionsMenuVisible, howToVisible]);

  if (howToVisible) {
    return (
      <View style={styles.container}>
        <HowToPlayScreen
          title="Cómo jugar"
          body={PELUSAS_HOW_TO_PLAY}
          onBack={() => setHowToVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Pelusas"
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
        <TourAnchor id="pelusas.revolution">
        <View style={styles.revolutionPanel}>
          <View style={styles.revolutionInfo}>
            <Text style={styles.revolutionTitle}>Modo Revolution</Text>
            <Text style={styles.revolutionHint}>
              Añade cartas de 20 y de −7 al conteo
            </Text>
          </View>
          <Switch
            value={session.revolutionMode}
            onValueChange={onSetRevolutionMode}
            trackColor={{ false: theme.border, true: theme.accentDark }}
            thumbColor={
              session.revolutionMode ? theme.accent : theme.textMuted
            }
          />
        </View>
        </TourAnchor>

        {leader && session.players.length > 1 ? (
          <View style={styles.rankingPanel}>
            <Text style={styles.rankingTitle}>Clasificación</Text>
            {ranking.map(({ player, score }, index) => (
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
                    score < 0 && styles.rankingScoreNegative,
                  ]}
                >
                  {score} pts
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Cartas por jugador</Text>
        <Text style={styles.sectionHint}>
          Toca un jugador para abrir o cerrar su contador de cartas.
        </Text>

        {session.players.map((player, index) => {
          const panel = (
            <PelusasPlayerPanel
              player={player}
              counts={
                session.countsByPlayer[player.id] ??
                emptyPelusasCounts(session.revolutionMode)
              }
              revolutionMode={session.revolutionMode}
              expanded={expandedPlayers.has(player.id)}
              onToggle={() => togglePlayer(player.id)}
              onChangeCount={(cardValue, count) =>
                onSetCardCount(player.id, cardValue, count)
              }
            />
          );
          if (index === 0) {
            return (
              <TourAnchor id="pelusas.players" key={player.id}>
                {panel}
              </TourAnchor>
            );
          }
          return <View key={player.id}>{panel}</View>;
        })}

        <Button
          label="Reiniciar conteos"
          onPress={onResetCounts}
          variant="ghost"
          style={styles.resetBtn}
        />
      </TourScrollView>

      <View style={styles.footer}>
        <FinishMatchButton onPress={() => setFinishModalVisible(true)} />
      </View>

      <ExitMatchModal
        visible={exitModalVisible}
        matchTitle="Pelusas"
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
        matchTitle="Pelusas"
        onClose={() => setFinishModalVisible(false)}
        onViewResults={handleSaveFinished}
        onSaveFinished={handleSaveFinished}
        onDelete={() => {
          setFinishModalVisible(false);
          onDeleteAndExit();
        }}
      />

      <GameOverflowMenu
        visible={actionsMenuVisible}
        onClose={() => setActionsMenuVisible(false)}
        items={[
          {
            title: 'Editar partida',
            hint: 'Cambia los jugadores sin perder el conteo',
            onPress: onEditMatch,
          },
          {
            title: 'Ver tutorial',
            hint: 'Repasa los botones de esta pantalla',
            onPress: () => startTour('pelusas', { force: true }),
          },
          {
            title: 'Cómo jugar',
            hint: 'Resumen de las reglas de Pelusas',
            onPress: () => setHowToVisible(true),
          },
        ]}
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
  revolutionPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  revolutionInfo: {
    flex: 1,
    gap: 4,
  },
  revolutionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  revolutionHint: {
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
  rankingScoreNegative: {
    color: theme.danger,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
    marginTop: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  resetBtn: {
    marginTop: 4,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

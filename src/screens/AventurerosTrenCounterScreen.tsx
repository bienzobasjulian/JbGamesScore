import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AventurerosTrenPlayerPanel } from '../components/AventurerosTrenPlayerPanel';
import { Button } from '../components/Button';
import { FinishMatchButton } from '../components/FinishMatchButton';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { theme } from '../constants';
import {
  AventurerosTrenDestinationEntry,
  AventurerosTrenPhase,
  AventurerosTrenRouteEntry,
  AventurerosTrenSession,
} from '../types';
import { sortPlayersByAventurerosTrenTotal } from '../utils/aventurerosTren';

type Props = {
  session: AventurerosTrenSession;
  onBack: () => void;
  onFinishMatch: () => void;
  onSetPhase: (phase: AventurerosTrenPhase) => void;
  onAddRoute: (playerId: string) => void;
  onUpdateRoute: (
    playerId: string,
    routeId: string,
    patch: Partial<AventurerosTrenRouteEntry>,
  ) => void;
  onRemoveRoute: (playerId: string, routeId: string) => void;
  onAddDestination: (playerId: string) => void;
  onUpdateDestination: (
    playerId: string,
    destId: string,
    patch: Partial<AventurerosTrenDestinationEntry>,
  ) => void;
  onRemoveDestination: (playerId: string, destId: string) => void;
};

export function AventurerosTrenCounterScreen({
  session,
  onBack,
  onFinishMatch,
  onSetPhase,
  onAddRoute,
  onUpdateRoute,
  onRemoveRoute,
  onAddDestination,
  onUpdateDestination,
  onRemoveDestination,
}: Props) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);

  const phase = session.activePhase;
  const isConstruccion = phase === 'construccion';

  const ranking = useMemo(
    () => sortPlayersByAventurerosTrenTotal(session),
    [session],
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

  return (
    <View style={styles.container}>
      <AppHeader title="Aventureros al tren" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.phaseBadge}>
          Fase: {isConstruccion ? 'Construcción' : 'Destinos'}
        </Text>
        <Text style={styles.phaseIntro}>
          {isConstruccion
            ? 'Añade cada tramo de vías. Origen y destino son opcionales. Puntos por longitud o directos.'
            : 'Cartas de destino: completadas suman, no completadas restan. Origen y destino opcionales.'}
        </Text>

        <View style={styles.rankingPanel}>
          <Text style={styles.rankingTitle}>Clasificación</Text>
          {ranking.map(
            ({ player, construccion, destinos, total }, index) => (
              <View key={player.id} style={styles.rankingRow}>
                <Text style={styles.rankingPos}>{index + 1}.</Text>
                <View
                  style={[styles.rankingDot, { backgroundColor: player.color }]}
                />
                <View style={styles.rankingTexts}>
                  <Text style={styles.rankingName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={styles.rankingSub}>
                    Constr. {construccion} · Dest. {destinos > 0 ? '+' : ''}
                    {destinos}
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

        {session.players.map((player) => (
          <AventurerosTrenPlayerPanel
            key={player.id}
            player={player}
            phase={phase}
            routes={session.construccion[player.id] ?? []}
            destinations={session.destinos[player.id] ?? []}
            expanded={expandedPlayers.has(player.id)}
            onToggle={() => togglePlayer(player.id)}
            onAddRoute={() => onAddRoute(player.id)}
            onUpdateRoute={(routeId, patch) =>
              onUpdateRoute(player.id, routeId, patch)
            }
            onRemoveRoute={(routeId) => onRemoveRoute(player.id, routeId)}
            onAddDestination={() => onAddDestination(player.id)}
            onUpdateDestination={(destId, patch) =>
              onUpdateDestination(player.id, destId, patch)
            }
            onRemoveDestination={(destId) =>
              onRemoveDestination(player.id, destId)
            }
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
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
        <FinishMatchButton onPress={() => setFinishModalVisible(true)} />
      </View>

      <FinishMatchModal
        visible={finishModalVisible}
        matchTitle="Aventureros al tren"
        onClose={() => setFinishModalVisible(false)}
        onSaveFinished={() => {
          setFinishModalVisible(false);
          onFinishMatch();
        }}
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

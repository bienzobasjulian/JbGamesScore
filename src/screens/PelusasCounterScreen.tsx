import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { FinishMatchButton } from '../components/FinishMatchButton';
import { FinishMatchModal } from '../components/FinishMatchModal';
import { PelusasPlayerPanel } from '../components/PelusasPlayerPanel';
import { theme } from '../constants';
import { PelusasSession } from '../types';
import {
  emptyPelusasCounts,
  sortPlayersByPelusasScore,
} from '../utils/pelusas';

type Props = {
  session: PelusasSession;
  onBack: () => void;
  onFinishMatch: () => void;
  onSetRevolutionMode: (enabled: boolean) => void;
  onSetCardCount: (
    playerId: string,
    cardValue: number,
    count: number,
  ) => void;
  onResetCounts: () => void;
};

export function PelusasCounterScreen({
  session,
  onBack,
  onFinishMatch,
  onSetRevolutionMode,
  onSetCardCount,
  onResetCounts,
}: Props) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [finishModalVisible, setFinishModalVisible] = useState(false);

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

  return (
    <View style={styles.container}>
      <AppHeader title="Pelusas" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        {leader ? (
          <View style={styles.rankingPanel}>
            <Text style={styles.rankingTitle}>Clasificación</Text>
            {ranking.map(({ player, score }, index) => (
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

        {session.players.map((player) => (
          <PelusasPlayerPanel
            key={player.id}
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
        ))}

        <Button
          label="Reiniciar conteos"
          onPress={onResetCounts}
          variant="ghost"
          style={styles.resetBtn}
        />
      </ScrollView>

      <View style={styles.footer}>
        <FinishMatchButton onPress={() => setFinishModalVisible(true)} />
      </View>

      <FinishMatchModal
        visible={finishModalVisible}
        matchTitle="Pelusas"
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

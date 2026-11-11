import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import {
  CardsIcon,
  GoalIcon,
  PawnsIcon,
} from '../components/MatchSummaryIcons';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import {
  ScoreLayoutPicker,
  ScoreRoundOrderPicker,
  ScoreTileWidthPicker,
} from '../components/ScoreLayoutPicker';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { scoreRuleLabel } from '../utils/game';
import { EditMatchDraft } from '../types/playerSelection';
import {
  GameSettings,
  Match,
  Player,
  PlayerGroup,
  SavedPlayer,
  ScoreLayout,
  ScoreRoundOrder,
  ScoreTileWidth,
  normalizeScoreLayout,
  normalizeScoreRoundOrder,
  normalizeScoreTileWidth,
} from '../types';
import { getMatchTokenColorHint, getMatchTokenColorOptions } from '../utils/games';
import { ensureMatchPlayers } from '../utils/players';
import { preserveRosterIdentity } from '../utils/playerSelection';
import { SelectPlayersScreen } from './SelectPlayersScreen';

type Props = {
  match: Match;
  savedPlayers: SavedPlayer[];
  groups: PlayerGroup[];
  restoredDraft?: EditMatchDraft | null;
  onBack: () => void;
  onCreatePlayer: (name: string, avatar?: string | null) => Player | null;
  onSave: (
    players: Player[],
    settings: GameSettings,
    name: string | null,
    scoreLayout: ScoreLayout,
    scoreTileWidth: ScoreTileWidth,
    scoreRoundOrder: ScoreRoundOrder,
  ) => void;
  selfPlayer?: Player | null;
};

export function EditMatchScreen({
  match,
  savedPlayers,
  groups,
  restoredDraft,
  onBack,
  onCreatePlayer,
  onSave,
  selfPlayer = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [settings, setSettings] = useState<GameSettings>(
    restoredDraft?.settings ?? match.settings,
  );
  const [matchName, setMatchName] = useState(
    restoredDraft?.matchName ?? match.name ?? '',
  );
  const [players, setPlayers] = useState<Player[]>(
    restoredDraft?.players ?? match.players,
  );
  const [scoreLayout, setScoreLayout] = useState<ScoreLayout>(
    normalizeScoreLayout(restoredDraft?.scoreLayout ?? match.scoreLayout),
  );
  const [scoreTileWidth, setScoreTileWidth] = useState<ScoreTileWidth>(
    normalizeScoreTileWidth(
      restoredDraft?.scoreTileWidth ?? match.scoreTileWidth,
    ),
  );
  const [scoreRoundOrder, setScoreRoundOrder] = useState<ScoreRoundOrder>(
    normalizeScoreRoundOrder(
      restoredDraft?.scoreRoundOrder ?? match.scoreRoundOrder,
    ),
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const tokenColors = getMatchTokenColorOptions('standard');
  const tokenColorHint = getMatchTokenColorHint('standard');
  const pristine = useRef({
    settings: JSON.stringify(settings),
    matchName,
    players: players.map((player) => `${player.id}:${player.color}`).join('|'),
    scoreLayout,
    scoreTileWidth,
    scoreRoundOrder,
  });

  const steps =
    players.length <= 1
      ? (['rules', 'players', 'summary'] as const)
      : (['rules', 'players', 'order', 'summary'] as const);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const stepTitle =
    step === 'rules'
      ? 'Reglas'
      : step === 'players'
        ? 'Jugadores'
        : step === 'order'
          ? 'Orden de juego'
          : 'Resumen';

  const hasEnteredData =
    JSON.stringify(settings) !== pristine.current.settings ||
    matchName !== pristine.current.matchName ||
    players.map((player) => `${player.id}:${player.color}`).join('|') !==
      pristine.current.players ||
    scoreLayout !== pristine.current.scoreLayout ||
    scoreTileWidth !== pristine.current.scoreTileWidth ||
    scoreRoundOrder !== pristine.current.scoreRoundOrder;

  const finishSummary = [
    settings.maxRounds != null ? `${settings.maxRounds} rondas` : null,
    settings.maxPointsToWin != null
      ? `${settings.maxPointsToWin} puntos`
      : null,
    scoreRuleLabel(settings),
    scoreLayout === 'table'
      ? 'Vista de tabla'
      : scoreLayout === 'big'
        ? 'Vista de marcador'
        : 'Vista de tarjetas',
  ]
    .filter(Boolean)
    .join(' · ');

  const goToPreviousStep = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const requestLeave = () => {
    if (hasEnteredData) {
      setConfirmLeave(true);
      return;
    }
    onBack();
  };

  const handleShuffle = () => {
    setPlayers((prev) => {
      const next = [...prev];
      for (let index = next.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        const current = next[index];
        next[index] = next[swap];
        next[swap] = current;
      }
      return next;
    });
  };

  const handleSave = () => {
    const roster = ensureMatchPlayers(players, selfPlayer);
    if (roster.length < 1) return;
    onSave(
      roster,
      settings,
      matchName.trim() || null,
      scoreLayout,
      scoreTileWidth,
      scoreRoundOrder,
    );
  };

  const rules = (
    <View style={styles.headerBlock}>
      <Text style={styles.stepHeading}>{stepTitle}</Text>
      <Text style={styles.hint}>
        Los puntos de quienes se queden se conservan. Si quitas a alguien, se
        pierden sus puntuaciones. El juego no se puede cambiar.
      </Text>
      <View style={styles.lockedGame}>
        <Text style={styles.sectionLabel}>Juego</Text>
        <Text style={styles.lockedGameValue}>Partida personalizada</Text>
      </View>
      <View style={styles.nameBlock}>
        <Text style={styles.sectionLabel}>Nombre de la partida (opcional)</Text>
        <TextInput
          style={[styles.nameInput, { outlineWidth: 0 } as object]}
          placeholder="Ej. Domino del viernes"
          placeholderTextColor={theme.textMuted}
          value={matchName}
          onChangeText={setMatchName}
          maxLength={40}
          returnKeyType="done"
        />
      </View>
      <GameSettingsPanel settings={settings} onChange={setSettings} flat />
      <View style={styles.layoutBlock}>
        <Text style={styles.sectionLabel}>Vista de puntos</Text>
        <ScoreLayoutPicker value={scoreLayout} onChange={setScoreLayout} />
        {scoreLayout === 'big' ? (
          <>
            <Text style={styles.sectionLabel}>Ancho del marcador</Text>
            <ScoreTileWidthPicker
              value={scoreTileWidth}
              onChange={setScoreTileWidth}
            />
          </>
        ) : null}
        {scoreLayout === 'table' ? (
          <>
            <Text style={styles.sectionLabel}>Orden de las rondas</Text>
            <ScoreRoundOrderPicker
              value={scoreRoundOrder}
              onChange={setScoreRoundOrder}
            />
          </>
        ) : null}
      </View>
    </View>
  );

  const orderHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.stepHeading}>{stepTitle}</Text>
      <Pressable onPress={handleShuffle} style={styles.orderAction}>
        <Text style={styles.orderActionText}>Mezclar</Text>
      </Pressable>
      <Text style={styles.hint}>Arrastra para cambiar el orden.</Text>
      {tokenColorHint ? <Text style={styles.hint}>{tokenColorHint}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Editar partida" onBack={requestLeave} plain />
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((stepIndex + 1) / steps.length) * 100}%` },
          ]}
        />
      </View>
      {step === 'summary' ? null : (
        <Text style={styles.progressLabel}>{stepTitle}</Text>
      )}

      {step === 'rules' ? (
        <ScrollView
          contentContainerStyle={styles.headerBlock}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {rules}
        </ScrollView>
      ) : null}

      {step === 'players' ? (
        <SelectPlayersScreen
          savedPlayers={savedPlayers}
          groups={groups}
          initialPlayers={players}
          maxPlayers={Number.POSITIVE_INFINITY}
          minPlayers={1}
          allowAnonymous
          embedded
          confirmLabel="Siguiente"
          showStepBack
          onBack={goToPreviousStep}
          onCreatePlayer={onCreatePlayer}
          onConfirm={(roster) => {
            setPlayers((current) => preserveRosterIdentity(current, roster));
            goNext();
          }}
        />
      ) : null}

      {step === 'order' ? (
        <View style={styles.stepBody}>
          <ReorderablePlayersList
            players={players}
            contentContainerStyle={styles.list}
            listHeaderComponent={orderHeader}
            onChange={setPlayers}
            tokenColors={tokenColors ?? undefined}
            onChangeColor={
              tokenColors
                ? (playerId, color) =>
                    setPlayers((prev) =>
                      prev.map((player) =>
                        player.id === playerId ? { ...player, color } : player,
                      ),
                    )
                : undefined
            }
          />
        </View>
      ) : null}

      {step === 'summary' ? (
        <ScrollView
          contentContainerStyle={styles.summary}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.summaryTitle}>Resumen de la partida</Text>
          <Text style={styles.summarySection}>Ajustes</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <CardsIcon color={theme.accent} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.sectionLabel}>Juego</Text>
              <Text style={styles.summaryValue}>Partida personalizada</Text>
            </View>
          </View>
          {matchName.trim() ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryText}>
                <Text style={styles.sectionLabel}>Nombre</Text>
                <Text style={styles.summaryValue}>{matchName.trim()}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <PawnsIcon color={theme.accent} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.sectionLabel}>Jugadores</Text>
              <Text style={styles.summaryValue}>
                {players.map((player) => player.name).join(', ')}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <GoalIcon color={theme.accent} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.sectionLabel}>Configuraciones</Text>
              <Text style={styles.summaryValue}>{finishSummary}</Text>
            </View>
          </View>
        </ScrollView>
      ) : null}

      {step === 'players' ? null : (
        <View style={styles.footer}>
          {stepIndex > 0 ? (
            <View style={styles.footerBack}>
              <Button
                label="Atrás"
                onPress={goToPreviousStep}
                variant="secondary"
              />
            </View>
          ) : null}
          {step === 'summary' ? (
            <View style={styles.footerAction}>
              <Button
                label="Guardar cambios"
                onPress={handleSave}
                disabled={players.length < 1}
                numberOfLines={1}
              />
            </View>
          ) : (
            <View style={styles.footerAction}>
              <Button label="Siguiente" onPress={goNext} />
            </View>
          )}
        </View>
      )}

      <ConfirmModal
        visible={confirmLeave}
        title="Salir sin guardar"
        message="Hay cambios sin guardar. ¿Seguro que quieres salir?"
        confirmLabel="Salir"
        danger
        onConfirm={() => {
          setConfirmLeave(false);
          onBack();
        }}
        onCancel={() => setConfirmLeave(false)}
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
    progressTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      overflow: 'hidden',
      marginTop: -8,
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: theme.accent,
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textMuted,
      marginBottom: 12,
    },
    stepHeading: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },
    stepBody: {
      flex: 1,
    },
    headerBlock: {
      gap: 16,
      paddingBottom: 12,
    },
    hint: {
      fontSize: 14,
      color: theme.textMuted,
      lineHeight: 20,
    },
    lockedGame: {
      gap: 4,
    },
    lockedGameValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    nameBlock: {
      gap: 6,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: theme.textMuted,
    },
    nameInput: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    layoutBlock: {
      gap: 8,
    },
    orderAction: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingVertical: 14,
    },
    orderActionText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    list: {
      gap: 12,
      paddingBottom: 8,
    },
    summary: {
      gap: 12,
      paddingBottom: 16,
    },
    summaryTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    summarySection: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: theme.textMuted,
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent + '22',
    },
    summaryText: {
      flex: 1,
      gap: 2,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    footerBack: {
      flexGrow: 0,
      flexShrink: 0,
    },
    footerAction: {
      flex: 1,
    },
  });

import { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { GameTypePicker } from '../components/GameTypePicker';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { TemplatePicker } from '../components/TemplatePicker';
import { AventurerosTrenSubmodePicker } from '../components/AventurerosTrenSubmodePicker';
import { TourAnchor, useAutoTour, useOnboarding } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { CreateMatchDraft } from '../types/playerSelection';
import {
  AppScreen,
  AventurerosTrenSubmode,
  GameSettings,
  MatchTemplate,
  Player,
  SavedPlayer,
} from '../types';
import {
  CreateMatchGameType,
  getCreateMatchPlayerLimits,
  isDedicatedCreateMatchGame,
} from '../utils/games';
import { AVENTUREROS_TREN_MAX_PLAYERS } from '../utils/aventurerosTren';
import { defaultSettings } from '../utils/game';
import { ensureMatchPlayers, formatSoloPlayerHint } from '../utils/players';
import { applyTemplateDraft } from '../utils/template';

function buildInitialFromTemplate(
  templates: MatchTemplate[],
  savedPlayers: SavedPlayer[],
  templateId?: string,
) {
  if (!templateId) {
    return {
      settings: defaultSettings(),
      matchName: '',
      players: [] as Player[],
      loadedTemplateId: null as string | null,
    };
  }
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return {
      settings: defaultSettings(),
      matchName: '',
      players: [] as Player[],
      loadedTemplateId: null as string | null,
    };
  }
  const draft = applyTemplateDraft(template, savedPlayers);
  return {
    settings: draft.settings,
    matchName: draft.suggestedMatchName,
    players: draft.players,
    loadedTemplateId: template.id,
  };
}

type Props = {
  templates: MatchTemplate[];
  savedPlayers: SavedPlayer[];
  initialTemplateId?: string;
  initialGameType?: CreateMatchGameType;
  sessionId?: string;
  sessionName?: string;
  restoredDraft?: CreateMatchDraft | null;
  onBack: () => void;
  onOpenPlayerSelection: (config: {
    draftKey: 'createMatch';
    parentDraft: CreateMatchDraft;
    players: Player[];
    maxPlayers: number;
    allowAnonymous: boolean;
    returnScreen: AppScreen;
  }) => void;
  onStartStandard: (
    players: Player[],
    settings: GameSettings,
    name?: string | null,
    sessionId?: string | null,
  ) => void;
  onStartPelusas: (players: Player[], sessionId?: string | null) => void;
  onStartSkullKing: (players: Player[], sessionId?: string | null) => void;
  onStartPiliPili: (players: Player[], sessionId?: string | null) => void;
  onStartFlip7: (players: Player[], sessionId?: string | null) => void;
  onStartAventurerosTren: (
    players: Player[],
    submode: AventurerosTrenSubmode,
    sessionId?: string | null,
  ) => void;
  onStartRegicide: (sessionId?: string | null) => void;
  selfPlayer?: Player | null;
};

export function CreateMatchScreen({
  templates,
  savedPlayers,
  initialTemplateId,
  initialGameType = 'standard',
  sessionId,
  sessionName,
  restoredDraft,
  onBack,
  onOpenPlayerSelection,
  onStartStandard,
  onStartPelusas,
  onStartSkullKing,
  onStartPiliPili,
  onStartFlip7,
  onStartAventurerosTren,
  onStartRegicide,
  selfPlayer = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { completedTours } = useOnboarding();
  useAutoTour('createMatch');

  const templateInitial = buildInitialFromTemplate(
    templates,
    savedPlayers,
    initialTemplateId,
  );
  const [gameType, setGameType] = useState<CreateMatchGameType>(
    restoredDraft?.gameType ?? initialGameType,
  );
  const [settings, setSettings] = useState<GameSettings>(
    restoredDraft?.settings ?? templateInitial.settings,
  );
  const [matchName, setMatchName] = useState(
    restoredDraft?.matchName ?? templateInitial.matchName,
  );
  const [players, setPlayers] = useState<Player[]>(
    restoredDraft?.players ?? templateInitial.players,
  );
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(
    restoredDraft?.loadedTemplateId ?? templateInitial.loadedTemplateId,
  );
  const [aventurerosSubmode, setAventurerosSubmode] =
    useState<AventurerosTrenSubmode>(
      restoredDraft?.aventurerosSubmode ?? 'base',
    );
  const [randomStarterName, setRandomStarterName] = useState<string | null>(
    restoredDraft?.randomStarterName ?? null,
  );

  const isPelusas = gameType === 'pelusas';
  const isSkullKing = gameType === 'skull_king';
  const isPiliPili = gameType === 'pili_pili';
  const isFlip7 = gameType === 'flip7';
  const isAventurerosTren = gameType === 'aventureros_tren';
  const isRegicide = gameType === 'regicide';
  useAutoTour('aventurerosSubmode', {
    enabled: isAventurerosTren && completedTours.includes('createMatch'),
  });
  const isSpecialGame = isDedicatedCreateMatchGame(gameType);
  const playerLimits = getCreateMatchPlayerLimits(gameType);

  const canStart = isRegicide
    ? true
    : isPiliPili || isFlip7
      ? players.length >= playerLimits.min && players.length <= playerLimits.max
      : players.length <= playerLimits.max;
  const soloHint = formatSoloPlayerHint(selfPlayer);
  const startLabel = isPelusas
    ? 'Contar puntos'
    : isRegicide
      ? 'Abrir asistente'
      : 'Comenzar partida';

  const buildDraft = useMemo(
    (): CreateMatchDraft => ({
      gameType,
      settings,
      matchName,
      players,
      loadedTemplateId,
      aventurerosSubmode,
      randomStarterName,
    }),
    [
      gameType,
      settings,
      matchName,
      players,
      loadedTemplateId,
      aventurerosSubmode,
      randomStarterName,
    ],
  );

  const returnScreen: AppScreen = sessionId
    ? { type: 'createSessionMatch', sessionId }
    : { type: 'createMatch', templateId: initialTemplateId };

  const handleChoosePlayers = () => {
    onOpenPlayerSelection({
      draftKey: 'createMatch',
      parentDraft: buildDraft,
      players,
      maxPlayers: playerLimits.max,
      allowAnonymous: true,
      returnScreen,
    });
  };

  const handleRemove = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setRandomStarterName(null);
  };

  const handlePickRandomStarter = () => {
    if (players.length < 2) return;
    const randomIndex = Math.floor(Math.random() * players.length);
    const picked = players[randomIndex];
    const rotated = [
      ...players.slice(randomIndex),
      ...players.slice(0, randomIndex),
    ];
    setPlayers(rotated);
    setRandomStarterName(picked.name);
  };

  const handleSelectGame = (next: CreateMatchGameType) => {
    setGameType(next);
    setRandomStarterName(null);
    if (isDedicatedCreateMatchGame(next)) {
      setLoadedTemplateId(null);
      setSettings(defaultSettings());
      setMatchName('');
    }
  };

  const handleSelectTemplate = (template: MatchTemplate | null) => {
    if (!template) {
      setLoadedTemplateId(null);
      setSettings(defaultSettings());
      setPlayers([]);
      setMatchName('');
      setRandomStarterName(null);
      return;
    }
    const draft = applyTemplateDraft(template, savedPlayers);
    setLoadedTemplateId(template.id);
    setSettings(draft.settings);
    setPlayers(draft.players);
    setMatchName(draft.suggestedMatchName);
    setRandomStarterName(null);
  };

  const handleStart = () => {
    if (!canStart) return;
    if (isRegicide) {
      onStartRegicide(sessionId ?? null);
      return;
    }
    const roster = ensureMatchPlayers(players, selfPlayer);
    if (isPelusas) {
      onStartPelusas(roster, sessionId ?? null);
    } else if (isSkullKing) {
      onStartSkullKing(roster, sessionId ?? null);
    } else if (isPiliPili) {
      onStartPiliPili(roster, sessionId ?? null);
    } else if (isFlip7) {
      onStartFlip7(roster, sessionId ?? null);
    } else if (isAventurerosTren) {
      onStartAventurerosTren(roster, aventurerosSubmode, sessionId ?? null);
    } else {
      onStartStandard(
        roster,
        settings,
        matchName.trim() || null,
        sessionId ?? null,
      );
    }
  };

  const header = (
    <View style={styles.headerBlock}>
      {sessionName ? (
        <Text style={styles.sessionHint}>Sesión: {sessionName}</Text>
      ) : null}
      <TourAnchor id="createMatch.game">
        <GameTypePicker selected={gameType} onSelect={handleSelectGame} />
      </TourAnchor>

      {!isSpecialGame ? (
        <>
          <View style={styles.namePanel}>
            <Text style={styles.nameLabel}>Nombre de la partida (opcional)</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Ej. Domino del viernes"
              placeholderTextColor={theme.textMuted}
              value={matchName}
              onChangeText={setMatchName}
              maxLength={40}
              returnKeyType="done"
            />
          </View>

          <TourAnchor id="createMatch.templates">
            <TemplatePicker
              templates={templates}
              savedPlayers={savedPlayers}
              selectedId={loadedTemplateId}
              onSelect={handleSelectTemplate}
            />
          </TourAnchor>

          <TourAnchor id="createMatch.settings">
            <GameSettingsPanel settings={settings} onChange={setSettings} />
          </TourAnchor>
        </>
      ) : isPelusas ? (
        <Text style={styles.specialHint}>
          Solo necesitas elegir quién juega. El conteo de cartas y el modo
          Revolution se configuran en la siguiente pantalla.
        </Text>
      ) : isSkullKing ? (
        <Text style={styles.specialHint}>
          Partida a 10 rondas de bazas. Elige entre {playerLimits.min} y{' '}
          {playerLimits.max} jugadores. Ordena la lista: el primero es el
          repartidor de la ronda 1 y el de su izquierda el jugador inicial de
          esa ronda.
        </Text>
      ) : isPiliPili ? (
        <Text style={styles.specialHint}>
          Apuestas de bazas con Pilis de penalización. La partida termina cuando
          alguien llega a 7 Pilis; gana quien tenga menos. Elige entre{' '}
          {playerLimits.min} y {playerLimits.max} jugadores. Ordena la lista con
          el primer jugador como repartidor de la ronda 1.
        </Text>
      ) : isFlip7 ? (
        <Text style={styles.specialHint}>
          Cartas del 0 al 12 con modificadores y bonus Flip7 (+15). Gana quien
          llegue primero a 200 puntos. Mínimo {playerLimits.min} jugadores.
        </Text>
      ) : isRegicide ? (
        <View style={styles.regicideHintBox}>
          <Text style={styles.specialHint}>
            Asistente cooperativo sin jugadores ni puntuación. Se puede jugar
            con una baraja de póker normal (52 cartas + bufones). La pantalla se
            mostrará en horizontal para gestionar vida y ataque de cada enemigo.
          </Text>
        </View>
      ) : (
        <>
          <TourAnchor id="aventurerosSubmode.picker">
            <AventurerosTrenSubmodePicker
              selected={aventurerosSubmode}
              onSelect={setAventurerosSubmode}
            />
          </TourAnchor>
          <Text style={styles.specialHint}>
            Dos fases: construcción de vías y comprobación de destinos. De 1 a{' '}
            {AVENTUREROS_TREN_MAX_PLAYERS} jugadores.
          </Text>
        </>
      )}

      {!isRegicide ? (
        <TourAnchor id="createMatch.players">
          <MatchPlayerRoster
            playerCount={players.length}
            onChoosePlayers={handleChoosePlayers}
            soloHint={soloHint}
            maxPlayers={
              Number.isFinite(playerLimits.max) ? playerLimits.max : undefined
            }
          />
        </TourAnchor>
      ) : null}
    </View>
  );

  if (isRegicide) {
    return (
      <View style={styles.container}>
        <AppHeader
          title={sessionName ? 'Partida en sesión' : 'Nueva partida'}
          onBack={onBack}
        />
        <View style={styles.regicideBody}>{header}</View>
        <View style={styles.footer}>
          <TourAnchor id="createMatch.start">
            <Button
              label={startLabel}
              onPress={handleStart}
              disabled={!canStart}
            />
          </TourAnchor>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={sessionName ? 'Partida en sesión' : 'Nueva partida'}
        onBack={onBack}
      />

      <ReorderablePlayersList
        players={players}
        contentContainerStyle={styles.list}
        listHeaderComponent={header}
        listEmptyComponent={
          <Text style={styles.empty}>
            Pulsa «Elegir jugadores» para añadir quién juega.
          </Text>
        }
        onChange={setPlayers}
        onRemove={handleRemove}
      />

      <View style={styles.footer}>
        {players.length > 1 ? (
          <>
            <Button
              label="Elegir inicio aleatorio"
              onPress={handlePickRandomStarter}
              variant="secondary"
            />
            {randomStarterName ? (
              <Text style={styles.randomStarterText}>
                Empieza: {randomStarterName}
              </Text>
            ) : null}
          </>
        ) : null}
        <TourAnchor id="createMatch.start">
          <Button
            label={startLabel}
            onPress={handleStart}
            disabled={!canStart}
          />
        </TourAnchor>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 12,
  },
  sessionHint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.accent,
  },
  namePanel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  nameInput: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  specialHint: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  regicideBody: {
    flex: 1,
    paddingTop: 8,
  },
  regicideHintBox: {
    minHeight: 88,
    justifyContent: 'flex-start',
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  empty: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
  },
  footer: {
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  randomStarterText: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
  },
});

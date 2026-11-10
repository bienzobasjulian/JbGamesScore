import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
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
import { TourAnchor, useAutoTour } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { CreateMatchDraft } from '../types/playerSelection';
import {
  AppScreen,
  AventurerosTrenSubmode,
  GameSettings,
  MatchTemplate,
  Player,
  HeroQuestHeroId,
  PreferredCreateMatchGame,
  SavedPlayer,
} from '../types';
import {
  aventurerosSubmodeForGame,
  CreateMatchGameType,
  getCreateMatchPlayerLimits,
  getMatchTokenColorHint,
  getMatchTokenColorOptions,
  getVisibleCreateMatchGames,
  isAventurerosTrenGame,
  isDedicatedCreateMatchGame,
  isPelusasGame,
  resolveCreateMatchGameType,
} from '../utils/games';
import { AVENTUREROS_TREN_MAX_PLAYERS } from '../utils/aventurerosTren';
import { HERO_QUEST_PRESETS } from '../utils/heroQuest';
import { defaultSettings } from '../utils/game';
import {
  assignUniquePlayerColors,
  ensureMatchPlayers,
  formatSoloPlayerHint,
} from '../utils/players';
import { applyTemplateDraft } from '../utils/template';

const SKIP_CREATE_MATCH_GAME_TOUR = ['createMatch.game'];

function applyRosterColors(
  gameType: CreateMatchGameType,
  roster: Player[],
): Player[] {
  const options = getMatchTokenColorOptions(gameType);
  if (!isAventurerosTrenGame(gameType) || !options) return roster;
  return assignUniquePlayerColors(roster, options);
}

function gameTypeFromDraft(
  draft: CreateMatchDraft | null | undefined,
  fallback: CreateMatchGameType,
): CreateMatchGameType {
  if (!draft) return fallback;
  const legacySubmode = (
    draft as CreateMatchDraft & { aventurerosSubmode?: string }
  ).aventurerosSubmode;
  if (draft.gameType === 'aventureros_tren' && legacySubmode === 'europa') {
    return 'aventureros_tren_europa';
  }
  return draft.gameType;
}

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
  preferredCreateMatchGames?: PreferredCreateMatchGame[];
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
  onStartPelusas: (
    players: Player[],
    sessionId?: string | null,
    revolutionMode?: boolean,
  ) => void;
  onStartSkullKing: (players: Player[], sessionId?: string | null) => void;
  onStartPiliPili: (players: Player[], sessionId?: string | null) => void;
  onStartFlip7: (players: Player[], sessionId?: string | null) => void;
  onStartFlip7Vengeance: (
    players: Player[],
    sessionId?: string | null,
    brutal?: boolean,
  ) => void;
  onStartAventurerosTren: (
    players: Player[],
    submode: AventurerosTrenSubmode,
    sessionId?: string | null,
  ) => void;
  onStartRegicide: (
    players: Player[],
    sessionId?: string | null,
  ) => void;
  onStartSushiGo: (players: Player[], sessionId?: string | null) => void;
  onStartHeroQuest: (
    players: Player[],
    sessionId?: string | null,
    matchName?: string | null,
    heroByPlayer?: Record<string, HeroQuestHeroId>,
    nameByPlayer?: Record<string, string>,
  ) => void;
  onStartMenteVacuna: () => void;
  selfPlayer?: Player | null;
};

export function CreateMatchScreen({
  templates,
  savedPlayers,
  preferredCreateMatchGames = [],
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
  onStartFlip7Vengeance,
  onStartAventurerosTren,
  onStartRegicide,
  onStartSushiGo,
  onStartHeroQuest,
  onStartMenteVacuna,
  selfPlayer = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const templateInitial = buildInitialFromTemplate(
    templates,
    savedPlayers,
    initialTemplateId,
  );
  const visibleGames = useMemo(
    () => getVisibleCreateMatchGames(preferredCreateMatchGames),
    [preferredCreateMatchGames],
  );
  const showGamePicker = visibleGames.length > 0;
  useAutoTour('createMatch', {
    skipStepIds: showGamePicker ? undefined : SKIP_CREATE_MATCH_GAME_TOUR,
  });

  const [gameType, setGameType] = useState<CreateMatchGameType>(() =>
    resolveCreateMatchGameType(
      gameTypeFromDraft(restoredDraft, initialGameType),
      preferredCreateMatchGames,
    ),
  );
  const [settings, setSettings] = useState<GameSettings>(
    restoredDraft?.settings ?? templateInitial.settings,
  );
  const [matchName, setMatchName] = useState(
    restoredDraft?.matchName ?? templateInitial.matchName,
  );
  const [players, setPlayers] = useState<Player[]>(
    applyRosterColors(
      resolveCreateMatchGameType(
        gameTypeFromDraft(restoredDraft, initialGameType),
        preferredCreateMatchGames,
      ),
      restoredDraft?.players ?? templateInitial.players,
    ),
  );
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(
    restoredDraft?.loadedTemplateId ?? templateInitial.loadedTemplateId,
  );
  const [randomStarterName, setRandomStarterName] = useState<string | null>(
    restoredDraft?.randomStarterName ?? null,
  );
  const [flip7VengeanceBrutal, setFlip7VengeanceBrutal] = useState(
    restoredDraft?.flip7VengeanceBrutal ?? false,
  );
  const [heroQuestClassByPlayer, setHeroQuestClassByPlayer] = useState<
    Partial<Record<string, HeroQuestHeroId>>
  >(restoredDraft?.heroQuestClassByPlayer ?? {});
  const [heroQuestNameByPlayer, setHeroQuestNameByPlayer] = useState<
    Record<string, string>
  >(restoredDraft?.heroQuestNameByPlayer ?? {});

  const isPelusas = isPelusasGame(gameType);
  const isPelusasRevolution = gameType === 'pelusas_revolution';
  const isSkullKing = gameType === 'skull_king';
  const isPiliPili = gameType === 'pili_pili';
  const isFlip7 = gameType === 'flip7';
  const isFlip7Vengeance = gameType === 'flip7_vengeance';
  const isAventurerosTren = isAventurerosTrenGame(gameType);
  const isAventurerosEuropa = gameType === 'aventureros_tren_europa';
  const isRegicide = gameType === 'regicide';
  const isSushiGo = gameType === 'sushi_go';
  const isHeroQuest = gameType === 'hero_quest';
  const isMenteVacuna = gameType === 'mente_vacuna';
  const isSpecialGame = isDedicatedCreateMatchGame(gameType);
  const playerLimits = getCreateMatchPlayerLimits(gameType);
  const tokenColors = getMatchTokenColorOptions(gameType);
  const tokenColorHint = getMatchTokenColorHint(gameType);

  const withinLimits =
    players.length >= playerLimits.min && players.length <= playerLimits.max;
  const heroQuestReady =
    players.every((player) => heroQuestClassByPlayer[player.id]) &&
    new Set(players.map((player) => heroQuestClassByPlayer[player.id])).size ===
      players.length;
  const canStart = isMenteVacuna
    ? true
    : isRegicide
      ? players.length <= playerLimits.max
      : isHeroQuest
        ? withinLimits && heroQuestReady
        : isPiliPili ||
            isFlip7 ||
            isFlip7Vengeance ||
            isSkullKing ||
            isSushiGo
          ? withinLimits
          : players.length <= playerLimits.max;
  const soloHint = isRegicide
    ? 'Opcional. Si ganáis, la victoria se cuenta a todos en la sesión.'
    : formatSoloPlayerHint(selfPlayer);
  const startLabel = isPelusas
    ? 'Contar puntos'
    : isRegicide
      ? 'Abrir asistente'
      : isHeroQuest
        ? 'Abrir fichas'
        : isMenteVacuna
          ? 'Ver preguntas'
          : 'Comenzar partida';

  const buildDraft = useMemo(
    (): CreateMatchDraft => ({
      gameType,
      settings,
      matchName,
      players,
      loadedTemplateId,
      randomStarterName,
      flip7VengeanceBrutal,
      heroQuestClassByPlayer,
      heroQuestNameByPlayer,
    }),
    [
      gameType,
      settings,
      matchName,
      players,
      loadedTemplateId,
      randomStarterName,
      flip7VengeanceBrutal,
      heroQuestClassByPlayer,
      heroQuestNameByPlayer,
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
    const resolved = resolveCreateMatchGameType(
      next,
      preferredCreateMatchGames,
    );
    setGameType(resolved);
    setFlip7VengeanceBrutal(false);
    setRandomStarterName(null);
    setPlayers((prev) => applyRosterColors(resolved, prev));
    if (isDedicatedCreateMatchGame(resolved)) {
      setLoadedTemplateId(null);
      setSettings(defaultSettings());
      setMatchName('');
    }
  };

  useEffect(() => {
    const resolved = resolveCreateMatchGameType(
      gameType,
      preferredCreateMatchGames,
    );
    if (resolved !== gameType) {
      handleSelectGame(resolved);
    }
  }, [gameType, preferredCreateMatchGames]);

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
    if (isMenteVacuna) {
      onStartMenteVacuna();
      return;
    }
    if (isRegicide) {
      onStartRegicide(players, sessionId ?? null);
      return;
    }
    const roster = applyRosterColors(
      gameType,
      ensureMatchPlayers(players, selfPlayer),
    );
    if (isPelusas) {
      onStartPelusas(roster, sessionId ?? null, isPelusasRevolution);
    } else if (isSkullKing) {
      onStartSkullKing(roster, sessionId ?? null);
    } else if (isPiliPili) {
      onStartPiliPili(roster, sessionId ?? null);
    } else if (isFlip7) {
      onStartFlip7(roster, sessionId ?? null);
    } else if (isFlip7Vengeance) {
      onStartFlip7Vengeance(roster, sessionId ?? null, flip7VengeanceBrutal);
    } else if (isAventurerosTren) {
      onStartAventurerosTren(
        roster,
        aventurerosSubmodeForGame(gameType),
        sessionId ?? null,
      );
    } else if (isSushiGo) {
      onStartSushiGo(roster, sessionId ?? null);
    } else if (isHeroQuest) {
      onStartHeroQuest(
        roster,
        sessionId ?? null,
        matchName.trim() || null,
        Object.fromEntries(
          roster.flatMap((player) => {
            const heroId = heroQuestClassByPlayer[player.id];
            return heroId ? [[player.id, heroId]] : [];
          }),
        ),
        Object.fromEntries(
          roster.map((player) => [
            player.id,
            heroQuestNameByPlayer[player.id]?.trim() ?? '',
          ]),
        ),
      );
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
      {showGamePicker ? (
        <TourAnchor id="createMatch.game">
          <GameTypePicker
            selected={gameType}
            onSelect={handleSelectGame}
            games={visibleGames}
          />
        </TourAnchor>
      ) : null}

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
          {isPelusasRevolution
            ? 'Solo necesitas elegir quién juega. En la siguiente pantalla contarás las cartas del 1 al 10, más las de 20 y −7.'
            : 'Solo necesitas elegir quién juega. En la siguiente pantalla contarás las cartas del 1 al 10.'}
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
      ) : isFlip7Vengeance ? (
        <>
          <Text style={styles.specialHint}>
            Cartas del 1 al 13, especiales (The Zero, Unlucky 7, Lucky 13) y
            modificadores negativos. Gana quien más puntos tenga al llegar
            alguien a 200. Mínimo {playerLimits.min} jugadores.
          </Text>
          <View style={styles.brutalRow}>
            <View style={styles.brutalInfo}>
              <Text style={styles.brutalLabel}>Modo brutal</Text>
              <Text style={styles.specialHint}>
                La ronda puede quedar en negativo y un Flip 7 puede quitarle 15
                puntos a otro jugador.
              </Text>
            </View>
            <Switch
              value={flip7VengeanceBrutal}
              onValueChange={setFlip7VengeanceBrutal}
              trackColor={{ false: theme.border, true: theme.accentDark }}
              thumbColor={flip7VengeanceBrutal ? theme.accent : theme.textMuted}
            />
          </View>
        </>
      ) : isRegicide ? (
        <Text style={styles.specialHint}>
          Asistente cooperativo sin puntuación individual. Se puede jugar con
          una baraja de póker normal (52 cartas + bufones). La pantalla se
          muestra en horizontal. Los jugadores son opcionales: si los añades y
          hay victoria, se cuenta a todos en la sesión.
        </Text>
      ) : isAventurerosTren ? (
        <Text style={styles.specialHint}>
          {isAventurerosEuropa
            ? 'Dos fases: construcción de vías y comprobación de destinos, con estaciones y túneles. De 1 a '
            : 'Dos fases: construcción de vías y comprobación de destinos. De 1 a '}
          {AVENTUREROS_TREN_MAX_PLAYERS} jugadores.
        </Text>
      ) : isSushiGo ? (
        <Text style={styles.specialHint}>
          Tres rondas. Con 2, 3, 4 o 5 jugadores se reparten 10, 9, 8 o 7
          cartas. Ordena la mesa: las cartas se pasan a la izquierda. Al acabar
          cada ronda anotas lo que tiene cada uno delante; el pudin se puntúa
          al final.
        </Text>
      ) : isMenteVacuna ? (
        <Text style={styles.specialHint}>
          Se muestra una pregunta. Todo el mundo intenta decir lo mismo. No se
          anotan jugadores ni puntos. Puedes añadir tus propias preguntas.
        </Text>
      ) : isHeroQuest ? (
        <>
          <View style={styles.namePanel}>
            <Text style={styles.nameLabel}>Nombre de la partida</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Ej. La mazmorra del mago"
              placeholderTextColor={theme.textMuted}
              value={matchName}
              onChangeText={setMatchName}
              maxLength={40}
              returnKeyType="done"
            />
          </View>
          <Text style={styles.specialHint}>
            De {playerLimits.min} a {playerLimits.max} jugadores. Cada uno elige
            una clase y no se puede repetir: Bárbaro, Enano, Elfo o Mago.
          </Text>
        </>
      ) : null}

      {!isMenteVacuna ? (
      <TourAnchor id="createMatch.players">
        <MatchPlayerRoster
          playerCount={players.length}
          onChoosePlayers={handleChoosePlayers}
          soloHint={soloHint}
          maxPlayers={
            Number.isFinite(playerLimits.max) ? playerLimits.max : undefined
          }
        />
        {tokenColorHint ? (
          <Text style={styles.specialHint}>{tokenColorHint}</Text>
        ) : null}
        {isHeroQuest
          ? players.map((player) => (
              <View key={player.id} style={styles.classBlock}>
                <Text style={styles.nameLabel}>{player.name}</Text>
                <View style={styles.classRow}>
                  {HERO_QUEST_PRESETS.map((preset) => {
                    const selected =
                      heroQuestClassByPlayer[player.id] === preset.id;
                    const taken = players.some(
                      (other) =>
                        other.id !== player.id &&
                        heroQuestClassByPlayer[other.id] === preset.id,
                    );
                    return (
                      <Pressable
                        key={preset.id}
                        disabled={taken}
                        onPress={() =>
                          setHeroQuestClassByPlayer((prev) => ({
                            ...prev,
                            [player.id]: preset.id,
                          }))
                        }
                        style={[
                          styles.classChip,
                          selected && styles.classChipOn,
                          taken && styles.classChipOff,
                        ]}
                      >
                        <Text style={styles.classEmoji}>{preset.emoji}</Text>
                        <Text
                          style={[
                            styles.className,
                            selected && styles.classNameOn,
                          ]}
                        >
                          {preset.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Nombre del héroe (opcional)"
                  placeholderTextColor={theme.textMuted}
                  value={heroQuestNameByPlayer[player.id] ?? ''}
                  onChangeText={(text) =>
                    setHeroQuestNameByPlayer((prev) => ({
                      ...prev,
                      [player.id]: text,
                    }))
                  }
                  maxLength={32}
                />
              </View>
            ))
          : null}
      </TourAnchor>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title={sessionName ? 'Partida en sesión' : 'Nueva partida'}
        onBack={onBack}
      />

      <ReorderablePlayersList
        players={isMenteVacuna ? [] : players}
        contentContainerStyle={styles.list}
        listHeaderComponent={header}
        listEmptyComponent={
          isMenteVacuna ? null : (
          <Text style={styles.empty}>
            {isRegicide
              ? 'Sin jugadores: puedes abrir el asistente igual. Añádelos si quieres contar la victoria en la sesión.'
              : 'Pulsa «Elegir jugadores» para añadir quién juega.'}
          </Text>
          )
        }
        onChange={setPlayers}
        onRemove={handleRemove}
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

      <View style={styles.footer}>
        {players.length > 1 && !isRegicide && !isHeroQuest && !isMenteVacuna ? (
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
  brutalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  brutalInfo: {
    flex: 1,
    gap: 4,
  },
  brutalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  classBlock: {
    gap: 12,
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  classRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  classChip: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.bg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  classChipOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  classChipOff: { opacity: 0.35 },
  classEmoji: { fontSize: 18 },
  className: { color: theme.text, fontWeight: '700' },
  classNameOn: { color: theme.onAccent },
  specialHint: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    paddingHorizontal: 4,
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

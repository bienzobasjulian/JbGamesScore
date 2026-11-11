import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import {
  ScoreLayoutPicker,
  ScoreRoundOrderPicker,
  ScoreTileWidthPicker,
} from '../components/ScoreLayoutPicker';
import { GameRulesSheet } from '../components/GameRulesSheet';
import {
  CardsIcon,
  GoalIcon,
  PawnsIcon,
} from '../components/MatchSummaryIcons';
import { GameTypePicker } from '../components/GameTypePicker';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { SelectPlayersScreen } from './SelectPlayersScreen';
import { TemplatePicker } from '../components/TemplatePicker';
import { TourAnchor, useAutoTour } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { CreateMatchDraft } from '../types/playerSelection';
import {
  AventurerosTrenSubmode,
  GameSettings,
  ScoreLayout,
  ScoreRoundOrder,
  ScoreTileWidth,
  normalizeScoreLayout,
  normalizeScoreRoundOrder,
  normalizeScoreTileWidth,
  MatchTemplate,
  Player,
  PlayerGroup,
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
  getDedicatedMatchFacts,
  getVisibleCreateMatchGames,
  isAventurerosTrenGame,
  isDedicatedCreateMatchGame,
  isPelusasGame,
  resolveCreateMatchGameType,
} from '../utils/games';
import { HERO_QUEST_PRESETS } from '../utils/heroQuest';
import { defaultSettings, scoreRuleLabel } from '../utils/game';
import {
  assignUniquePlayerColors,
  ensureMatchPlayers,
  formatSoloPlayerHint,
} from '../utils/players';
import { getCreateMatchHowTo } from '../utils/createMatchHowTo';
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
  groups: PlayerGroup[];
  onCreatePlayer: (name: string, avatar?: string | null) => Player | null;
  preferredCreateMatchGames?: PreferredCreateMatchGame[];
  initialTemplateId?: string;
  initialGameType?: CreateMatchGameType;
  sessionId?: string;
  sessionName?: string;
  restoredDraft?: CreateMatchDraft | null;
  onBack: () => void;
  onStartStandard: (
    players: Player[],
    settings: GameSettings,
    name?: string | null,
    sessionId?: string | null,
    scoreLayout?: ScoreLayout,
    scoreTileWidth?: ScoreTileWidth,
    scoreRoundOrder?: ScoreRoundOrder,
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
  groups,
  onCreatePlayer,
  preferredCreateMatchGames = [],
  initialTemplateId,
  initialGameType = 'standard',
  sessionId,
  sessionName,
  restoredDraft,
  onBack,
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
  const gameAllowList = useMemo(() => {
    if (
      initialGameType !== 'standard' &&
      !preferredCreateMatchGames.includes(
        initialGameType as PreferredCreateMatchGame,
      )
    ) {
      return [
        ...preferredCreateMatchGames,
        initialGameType as PreferredCreateMatchGame,
      ];
    }
    return preferredCreateMatchGames;
  }, [initialGameType, preferredCreateMatchGames]);
  const visibleGames = useMemo(
    () => getVisibleCreateMatchGames(gameAllowList),
    [gameAllowList],
  );
  const showGamePicker = visibleGames.length > 0;
  useAutoTour('createMatch', {
    skipStepIds: showGamePicker ? undefined : SKIP_CREATE_MATCH_GAME_TOUR,
  });

  const [gameType, setGameType] = useState<CreateMatchGameType>(() =>
    resolveCreateMatchGameType(
      gameTypeFromDraft(restoredDraft, initialGameType),
      gameAllowList,
    ),
  );
  const [settings, setSettings] = useState<GameSettings>(
    restoredDraft?.settings ?? templateInitial.settings,
  );
  const [scoreLayout, setScoreLayout] = useState<ScoreLayout>(
    normalizeScoreLayout(restoredDraft?.scoreLayout),
  );
  const [scoreTileWidth, setScoreTileWidth] = useState<ScoreTileWidth>(
    normalizeScoreTileWidth(restoredDraft?.scoreTileWidth),
  );
  const [scoreRoundOrder, setScoreRoundOrder] = useState<ScoreRoundOrder>(
    normalizeScoreRoundOrder(restoredDraft?.scoreRoundOrder),
  );
  const [matchName, setMatchName] = useState(
    restoredDraft?.matchName ?? templateInitial.matchName,
  );
  const [players, setPlayers] = useState<Player[]>(
    applyRosterColors(
      resolveCreateMatchGameType(
        gameTypeFromDraft(restoredDraft, initialGameType),
        gameAllowList,
      ),
      restoredDraft?.players ?? templateInitial.players,
    ),
  );
  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(
    restoredDraft?.loadedTemplateId ?? templateInitial.loadedTemplateId,
  );
  const [, setRandomStarterName] = useState<string | null>(
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
          : 'Empezar';

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
    setRandomStarterName(null);
  };

  const steps = isMenteVacuna
    ? (['rules', 'summary'] as const)
    : isRegicide || (players.length === 1 && !isHeroQuest)
      ? (['rules', 'players', 'summary'] as const)
      : (['rules', 'players', 'order', 'summary'] as const);
  const [stepIndex, setStepIndex] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const pristine = useRef({
    gameType,
    settings: JSON.stringify(settings),
    matchName,
    players: players.map((player) => player.id).join('|'),
    loadedTemplateId,
    flip7VengeanceBrutal,
  });
  const hasEnteredData =
    gameType !== pristine.current.gameType ||
    JSON.stringify(settings) !== pristine.current.settings ||
    matchName !== pristine.current.matchName ||
    players.map((player) => player.id).join('|') !== pristine.current.players ||
    loadedTemplateId !== pristine.current.loadedTemplateId ||
    flip7VengeanceBrutal !== pristine.current.flip7VengeanceBrutal;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const stepTitle =
    step === 'rules'
      ? 'Juego y reglas'
      : step === 'players'
        ? 'Jugadores'
        : step === 'order'
          ? isHeroQuest && players.length === 1
            ? 'Ficha del héroe'
            : 'Orden de juego'
          : 'Resumen';

  const goToPreviousStep = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const requestLeave = () => {
    if (hasEnteredData) {
      setConfirmLeave(true);
      return;
    }
    onBack();
  };

  const goNext = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const selectedGameName = isSpecialGame
    ? (visibleGames.find((game) => game.id === gameType)?.name ?? 'Partida')
    : 'Partida personalizada';
  const selectedTemplateName = templates.find(
    (template) => template.id === loadedTemplateId,
  )?.name;
  const matchFacts = getDedicatedMatchFacts(gameType);
  const howTo = getCreateMatchHowTo(gameType);
  const finishSummary = matchFacts.length > 0
    ? matchFacts.map((fact) => `${fact.label}: ${fact.value}`).join('\n')
    : isSpecialGame
    ? 'Reglas del juego'
    : [
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
        .join(' · ') || 'Manual';

  const handleSelectGame = (next: CreateMatchGameType) => {
    const resolved = resolveCreateMatchGameType(
      next,
      gameAllowList,
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
      gameAllowList,
    );
    if (resolved !== gameType) {
      handleSelectGame(resolved);
    }
  }, [gameType, gameAllowList]);

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
        scoreLayout,
        scoreTileWidth,
        scoreRoundOrder,
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
          <View style={styles.nameBlock}>
            <Text style={styles.sectionLabel}>
              Nombre de la partida (opcional)
            </Text>
            <View style={styles.nameField}>
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
            <GameSettingsPanel
              settings={settings}
              onChange={setSettings}
              flat
            />
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
          </TourAnchor>
        </>
      ) : matchFacts.length > 0 ? (
        <>
          <View style={styles.facts}>
            {matchFacts.map((fact) => (
              <View key={fact.label} style={styles.factRow}>
                <Text style={styles.sectionLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            ))}
            {howTo ? (
              <Pressable
                onPress={() => setRulesOpen(true)}
                hitSlop={8}
                style={styles.howToButton}
              >
                <Text style={styles.howToLink}>¿Cómo jugar?</Text>
              </Pressable>
            ) : null}
          </View>
          {isFlip7Vengeance ? (
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
          ) : null}
        </>
      ) : isRegicide ? (
        <Text style={styles.specialHint}>
          Asistente cooperativo sin puntuación individual. Se puede jugar con
          una baraja de póker normal (52 cartas + bufones). La pantalla se
          muestra en horizontal. Los jugadores son opcionales: si los añades y
          hay victoria, se cuenta a todos en la sesión.
        </Text>
      ) : isMenteVacuna ? (
        <Text style={styles.specialHint}>
          Se muestra una pregunta. Todo el mundo intenta decir lo mismo. No se
          anotan jugadores ni puntos. Puedes añadir tus propias preguntas.
        </Text>
      ) : isHeroQuest ? (
        <>
          <View style={styles.nameBlock}>
            <Text style={styles.sectionLabel}>Nombre de la partida</Text>
            <View style={styles.nameField}>
              <TextInput
                style={[styles.nameInput, { outlineWidth: 0 } as object]}
                placeholder="Ej. La mazmorra del mago"
                placeholderTextColor={theme.textMuted}
                value={matchName}
                onChangeText={setMatchName}
                maxLength={40}
                returnKeyType="done"
              />
            </View>
          </View>
          <Text style={styles.specialHint}>
            De {playerLimits.min} a {playerLimits.max} jugadores. Cada uno elige
            una clase y no se puede repetir: Bárbaro, Enano, Elfo o Mago.
          </Text>
        </>
      ) : null}
    </View>
  );

  const orderHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.stepHeading}>{stepTitle}</Text>
      {players.length > 1 ? (
        <View style={styles.orderActions}>
          <Pressable onPress={handleShuffle} style={styles.orderAction}>
            <Text style={styles.orderActionText}>Mezclar</Text>
          </Pressable>
        </View>
      ) : null}
      {players.length > 1 ? (
        <Text style={styles.specialHint}>Arrastra para cambiar el orden.</Text>
      ) : null}
      {tokenColorHint ? (
        <Text style={styles.specialHint}>{tokenColorHint}</Text>
      ) : null}
    </View>
  );

  const heroClassEditor =
    isHeroQuest && players.length > 0 ? (
      <View style={styles.headerBlock}>
        {players.map((player) => (
          <View key={player.id} style={styles.classBlock}>
            <Text style={styles.sectionLabel}>{player.name}</Text>
            <View style={styles.classRow}>
              {HERO_QUEST_PRESETS.map((preset) => {
                const selected = heroQuestClassByPlayer[player.id] === preset.id;
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
                      style={[styles.className, selected && styles.classNameOn]}
                    >
                      {preset.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={styles.heroNameInput}
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
        ))}
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <AppHeader
        title={sessionName ? 'Partida en sesión' : 'Nueva partida'}
        onBack={requestLeave}
        plain
      />
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
          {header}
        </ScrollView>
      ) : null}

      {step === 'players' ? (
        <SelectPlayersScreen
          savedPlayers={savedPlayers}
          groups={groups}
          initialPlayers={players}
          maxPlayers={playerLimits.max}
          minPlayers={playerLimits.min}
          allowAnonymous
          embedded
          confirmLabel="Siguiente"
          showStepBack
          onBack={goToPreviousStep}
          onCreatePlayer={onCreatePlayer}
          onConfirm={(roster) => {
            setPlayers(applyRosterColors(gameType, roster));
            setRandomStarterName(null);
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
            listFooterComponent={heroClassEditor}
            listEmptyComponent={
              <Text style={styles.empty}>
                {isRegicide
                  ? soloHint
                  : 'No hay jugadores en la partida.'}
              </Text>
            }
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
              <Text style={styles.summaryValue}>{selectedGameName}</Text>
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
          {selectedTemplateName ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryText}>
                <Text style={styles.sectionLabel}>Plantilla</Text>
                <Text style={styles.summaryValue}>{selectedTemplateName}</Text>
              </View>
            </View>
          ) : null}
          {!isMenteVacuna ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <PawnsIcon color={theme.accent} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.sectionLabel}>Jugadores</Text>
                <Text style={styles.summaryValue}>
                  {players.length === 0
                    ? 'Sin jugadores'
                    : players.map((player) => player.name).join(', ')}
                </Text>
              </View>
            </View>
          ) : null}
          {matchFacts.length > 0 ? (
            matchFacts.map((fact) => (
              <View key={fact.label} style={styles.summaryCard}>
                {fact.label.startsWith('Condición') ? (
                  <View style={styles.summaryIcon}>
                    <GoalIcon color={theme.accent} />
                  </View>
                ) : null}
                <View style={styles.summaryText}>
                  <Text style={styles.sectionLabel}>{fact.label}</Text>
                  <Text style={styles.summaryValue}>{fact.value}</Text>
                </View>
              </View>
            ))
          ) : !isHeroQuest && !isRegicide && !isMenteVacuna ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <GoalIcon color={theme.accent} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.sectionLabel}>Configuraciones</Text>
                <Text style={styles.summaryValue}>{finishSummary}</Text>
              </View>
            </View>
          ) : null}
          <Text style={styles.specialHint}>
            Pulsa comenzar para abrir la partida.
          </Text>
        </ScrollView>
      ) : null}

      {step === 'players' ? null : (
        <View style={styles.footer}>
          {stepIndex > 0 ? (
            <View style={styles.footerAction}>
              <Button
                label="Atrás"
                onPress={goToPreviousStep}
                variant="secondary"
              />
            </View>
          ) : null}
          {step === 'summary' || isMenteVacuna ? (
            <View style={styles.footerAction}>
              <TourAnchor id="createMatch.start">
                <Button
                  label={isMenteVacuna ? 'Comenzar' : startLabel}
                  onPress={handleStart}
                  disabled={!canStart}
                />
              </TourAnchor>
            </View>
          ) : (
            <View style={styles.footerAction}>
              <Button
                label="Siguiente"
                onPress={goNext}
                disabled={step === 'order' && isHeroQuest && !heroQuestReady}
              />
            </View>
          )}
        </View>
      )}
      <GameRulesSheet
        rules={rulesOpen ? howTo : null}
        onClose={() => setRulesOpen(false)}
      />
      <ConfirmModal
        visible={confirmLeave}
        title="Salir de la partida"
        message="Hay datos sin guardar. ¿Seguro que quieres salir?"
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  orderAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  orderActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
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
  headerBlock: {
    gap: 16,
    marginBottom: 12,
  },
  sessionHint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.accent,
  },
  layoutBlock: {
    gap: 8,
    marginTop: 8,
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
  nameField: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: theme.bg,
    overflow: 'hidden',
  },
  nameInput: {
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },
  heroNameInput: {
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  brutalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
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
  facts: {
    gap: 10,
  },
  factRow: {
    gap: 4,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  factValue: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text,
  },
  howToButton: {
    alignItems: 'center',
    marginTop: 4,
  },
  howToLink: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.accent,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    gap: 10,
  },
  footerAction: {
    flex: 1,
  },
  randomStarterText: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
  },
});

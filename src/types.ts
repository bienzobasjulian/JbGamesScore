export type Player = {
  id: string;
  name: string;
  color: string;
};

export type SavedPlayer = Player & {
  lastUsedAt: number;
};

export type PlayerGroup = {
  id: string;
  name: string;
  playerIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type RoundScores = Record<string, number>;

export type RoundBreakdown = Record<string, number[]>;

export type ScoringMode = 'direct' | 'breakdown';

export type GameSettings = {
  maxRounds: number | null;
  maxPointsToWin: number | null;
  /** Si es true, gana quien tenga menos puntos (por defecto gana quien tenga más). */
  lowestScoreWins?: boolean;
};

export type MatchStatus = 'in_progress' | 'finished';

export type MatchGameMode =
  | 'standard'
  | 'pelusas'
  | 'skull_king'
  | 'pili_pili'
  | 'flip7'
  | 'aventureros_tren'
  | 'regicide';

export type PlaySessionStatus = 'active' | 'closed';

export type PlaySession = {
  id: string;
  name: string;
  status: PlaySessionStatus;
  createdAt: number;
  updatedAt: number;
};

export type Match = {
  id: string;
  name: string | null;
  /** Sesión de juego a la que pertenece esta partida. */
  sessionId?: string | null;
  /** Partida sin puntuación: solo se registra quién ganó. */
  winnerOnly?: boolean;
  /** IDs de ganadores (partidas winnerOnly o empates). */
  winnerIds?: string[];
  gameMode?: MatchGameMode;
  pelusasRevolution?: boolean;
  aventurerosTrenSubmode?: AventurerosTrenSubmode;
  aventurerosTrenTiebreak?: Record<string, AventurerosTrenTiebreakSnapshot>;
  settings: GameSettings;
  players: Player[];
  rounds: RoundScores[];
  roundBreakdowns: RoundBreakdown[];
  activeRoundIndex: number;
  /** @deprecated Migrado a `rounds` */
  completedRounds?: RoundScores[];
  completedRoundBreakdowns?: RoundBreakdown[];
  currentRound?: RoundScores;
  currentRoundBreakdown?: RoundBreakdown;
  roundScoringMode: Record<string, ScoringMode>;
  status: MatchStatus;
  /** Partida retomada tras finalizar: permite editar sin bloquear la UI. */
  editingAfterFinish?: boolean;
  /** Estado persistido del asistente Regicide. */
  regicideSession?: import('./utils/regicide').RegicideSession;
  /** Partida en curso guardada desde el contador. */
  pelusasSession?: PelusasSession;
  skullKingSession?: SkullKingSession;
  piliPiliSession?: PiliPiliSession;
  flip7Session?: Flip7Session;
  aventurerosTrenSession?: AventurerosTrenSession;
  createdAt: number;
  updatedAt: number;
};

export type GameState = {
  players: Player[];
  rounds: RoundScores[];
  roundBreakdowns: RoundBreakdown[];
  activeRoundIndex: number;
  roundScoringMode: Record<string, ScoringMode>;
  isPlaying: boolean;
  settings: GameSettings;
};

export type MatchTemplate = {
  id: string;
  name: string;
  settings: GameSettings;
  playerIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type PelusasPlayerCounts = Record<string, number>;

export type PelusasSession = {
  players: Player[];
  revolutionMode: boolean;
  countsByPlayer: Record<string, PelusasPlayerCounts>;
};

export type SkullKingRoundEntry = {
  bid: number;
  tricksWon: number;
  /** Ronda registrada por el usuario (si no, no suma puntos) */
  entered: boolean;
  /** Total de puntos por cartas de oro (solo si cumple la apuesta) */
  goldBonusPoints: number;
  /** Piratas en baza con Skull King (30 pts c/u, Scary Mary cuenta) */
  pirateCount: number;
  mermaidCapturesKing: boolean;
};

export type SkullKingSession = {
  players: Player[];
  activeRoundIndex: number;
  rounds: Record<string, SkullKingRoundEntry>[];
};

export type PiliPiliMissionType =
  | 'exact_bet_discard'
  | 'first_last_trick'
  | 'mission_card_numbers'
  | 'linked_player'
  | 'forbidden_bet'
  | 'no_copy_bid';

export type PiliPiliRoundConfig = {
  /** Como máximo una misión activa por ronda. */
  mission: PiliPiliMissionType | null;
  /** Cartas repartidas a cada jugador (informado manualmente por ronda). */
  cardsDealt: number;
  /** Misión «Prohibido apostar»: 0 o 1 según la carta de misión. */
  forbiddenBidValue: 0 | 1 | null;
};

export type PiliPiliRoundEntry = {
  bid: number;
  tricksWon: number;
  entered: boolean;
  wonFirstTrick: boolean;
  wonLastTrick: boolean;
  missionCardTricksWon: number;
  linkedPlayerId: string | null;
};

export type PiliPiliSession = {
  players: Player[];
  activeRoundIndex: number;
  rounds: Record<string, PiliPiliRoundEntry>[];
  roundConfigs: PiliPiliRoundConfig[];
};

export type Flip7Modifier = '+2' | '+4' | '+6' | '+8' | '+10' | 'x2';

export type Flip7PlayerRoundStatus = 'active' | 'stood' | 'frozen' | 'eliminated';

export type Flip7RoundEntry = {
  status: Flip7PlayerRoundStatus;
  numbers: number[];
  modifiers: Flip7Modifier[];
  /** Puntos fijados al cerrar la ronda. */
  closedScore?: number;
};

export type Flip7Session = {
  players: Player[];
  activeRoundIndex: number;
  rounds: Record<string, Flip7RoundEntry>[];
};

export type AventurerosTrenPhase = 'construccion' | 'destinos';

export type AventurerosTrenSubmode = 'base' | 'europa';

export type AventurerosTrenPlayerScoring = {
  /** Bonificación manual de ruta más larga (+10) */
  hasLongestRouteBonus: boolean;
  /** Longitud de la ruta continua más larga (desempate) */
  longestRouteLength: number;
  /** Estaciones sin usar en Europa (0–3, +4 pts c/u) */
  unusedStations: number;
};

export type AventurerosTrenTiebreakSnapshot = {
  completedTickets: number;
  longestRouteLength: number;
  unusedStations: number;
};

export type AventurerosTrenRouteEntry = {
  id: string;
  origin: string;
  destination: string;
  useCustomPoints: boolean;
  length: number;
  customPoints: number;
  /** Vista compacta en fase de construcción */
  collapsed?: boolean;
};

export type AventurerosTrenDestinationEntry = {
  id: string;
  origin: string;
  destination: string;
  points: number;
  completed: boolean;
  collapsed?: boolean;
};

export type AventurerosTrenSession = {
  players: Player[];
  submode: AventurerosTrenSubmode;
  activePhase: AventurerosTrenPhase;
  construccion: Record<string, AventurerosTrenRouteEntry[]>;
  destinos: Record<string, AventurerosTrenDestinationEntry[]>;
  scoring: Record<string, AventurerosTrenPlayerScoring>;
};

export type AppData = {
  players: SavedPlayer[];
  groups: PlayerGroup[];
  matches: Match[];
  templates: MatchTemplate[];
  sessions: PlaySession[];
};

export type AppScreen =
  | { type: 'home' }
  | { type: 'createMatch'; templateId?: string }
  | { type: 'game'; matchId: string }
  | { type: 'editMatch'; matchId: string }
  | { type: 'matchesList' }
  | { type: 'playersList' }
  | { type: 'templatesList' }
  | { type: 'editTemplate'; templateId?: string }
  | { type: 'pelusasSetup' }
  | { type: 'pelusasCount' }
  | { type: 'skullKingCount' }
  | { type: 'piliPiliCount' }
  | { type: 'flip7Count' }
  | { type: 'aventurerosTrenCount' }
  | { type: 'regicideCount' }
  | { type: 'sessionsList' }
  | { type: 'createSession'; returnTo?: 'home' | 'sessionsList' }
  | { type: 'sessionDetail'; sessionId: string }
  | { type: 'createSessionMatch'; sessionId: string }
  | { type: 'createWinnerMatch'; sessionId: string }
  | { type: 'selectPlayers' }
  | { type: 'settings' };

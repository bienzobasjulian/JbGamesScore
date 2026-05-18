export type Player = {
  id: string;
  name: string;
  color: string;
};

export type SavedPlayer = Player & {
  lastUsedAt: number;
};

export type RoundScores = Record<string, number>;

export type RoundBreakdown = Record<string, number[]>;

export type ScoringMode = 'direct' | 'breakdown';

export type GameSettings = {
  maxRounds: number | null;
  maxPointsToWin: number | null;
};

export type MatchStatus = 'in_progress' | 'finished';

export type MatchGameMode =
  | 'standard'
  | 'pelusas'
  | 'skull_king'
  | 'aventureros_tren';

export type Match = {
  id: string;
  name: string | null;
  gameMode?: MatchGameMode;
  pelusasRevolution?: boolean;
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

export type AventurerosTrenPhase = 'construccion' | 'destinos';

export type AventurerosTrenRouteEntry = {
  id: string;
  origin: string;
  destination: string;
  useCustomPoints: boolean;
  length: number;
  customPoints: number;
};

export type AventurerosTrenDestinationEntry = {
  id: string;
  origin: string;
  destination: string;
  points: number;
  completed: boolean;
};

export type AventurerosTrenSession = {
  players: Player[];
  activePhase: AventurerosTrenPhase;
  construccion: Record<string, AventurerosTrenRouteEntry[]>;
  destinos: Record<string, AventurerosTrenDestinationEntry[]>;
};

export type AppData = {
  players: SavedPlayer[];
  matches: Match[];
  templates: MatchTemplate[];
};

export type AppScreen =
  | { type: 'home' }
  | { type: 'createMatch'; templateId?: string }
  | { type: 'game'; matchId: string }
  | { type: 'matchesList' }
  | { type: 'playersList' }
  | { type: 'createPlayer' }
  | { type: 'templatesList' }
  | { type: 'editTemplate'; templateId?: string }
  | { type: 'pelusasSetup' }
  | { type: 'pelusasCount' }
  | { type: 'skullKingCount' }
  | { type: 'aventurerosTrenCount' };

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

export type Match = {
  id: string;
  name: string | null;
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

export type AppData = {
  players: SavedPlayer[];
  matches: Match[];
};

export type AppScreen =
  | { type: 'home' }
  | { type: 'createMatch' }
  | { type: 'game'; matchId: string }
  | { type: 'matchesList' }
  | { type: 'playersList' }
  | { type: 'createPlayer' };

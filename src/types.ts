export type Player = {
  id: string;
  name: string;
  color: string;
};

export type RoundScores = Record<string, number>;

export type GameSettings = {
  maxRounds: number | null;
  maxPointsToWin: number | null;
};

export type GameState = {
  players: Player[];
  completedRounds: RoundScores[];
  currentRound: RoundScores;
  isPlaying: boolean;
  settings: GameSettings;
};

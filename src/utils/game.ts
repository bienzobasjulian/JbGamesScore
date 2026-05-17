import { GameState, Player, RoundScores } from '../types';

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getPlayerTotal(playerId: string, state: GameState): number {
  let total = 0;
  for (const round of state.rounds) {
    total += round[playerId] ?? 0;
  }
  return total;
}

export function getRoundScore(
  round: RoundScores,
  playerId: string,
): number {
  return round[playerId] ?? 0;
}

export function getActiveRoundScores(state: GameState): RoundScores {
  return state.rounds[state.activeRoundIndex] ?? {};
}

export function sortPlayersByScore(players: Player[], state: GameState): Player[] {
  return [...players].sort(
    (a, b) => getPlayerTotal(b.id, state) - getPlayerTotal(a.id, state),
  );
}

export const defaultSettings = (): GameState['settings'] => ({
  maxRounds: null,
  maxPointsToWin: null,
});

export function normalizeSettings(
  settings?: Partial<GameState['settings']>,
): GameState['settings'] {
  const maxRounds =
    settings?.maxRounds != null && settings.maxRounds > 0
      ? settings.maxRounds
      : null;
  const maxPointsToWin =
    settings?.maxPointsToWin != null && settings.maxPointsToWin > 0
      ? settings.maxPointsToWin
      : null;
  return { maxRounds, maxPointsToWin };
}

export function initialGameState(): GameState {
  return {
    players: [],
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: 0,
    roundScoringMode: {},
    isPlaying: false,
    settings: normalizeSettings(),
  };
}

export type GameOverResult = {
  isOver: boolean;
  reason?: 'rounds' | 'points';
  winners: Player[];
};

export function checkGameOver(state: GameState): GameOverResult {
  const sorted = sortPlayersByScore(state.players, state);
  const noWinners: Player[] = [];

  if (state.settings.maxPointsToWin != null) {
    const threshold = state.settings.maxPointsToWin;
    const qualified = sorted.filter(
      (p) => getPlayerTotal(p.id, state) >= threshold,
    );
    if (qualified.length > 0) {
      const topScore = getPlayerTotal(qualified[0].id, state);
      const winners = qualified.filter(
        (p) => getPlayerTotal(p.id, state) === topScore,
      );
      return { isOver: true, reason: 'points', winners };
    }
  }

  if (state.settings.maxRounds != null) {
    const onLastRound =
      state.activeRoundIndex >= state.settings.maxRounds - 1;
    if (onLastRound && state.rounds.length >= state.settings.maxRounds) {
      const topScore =
        sorted.length > 0 ? getPlayerTotal(sorted[0].id, state) : 0;
      const winners =
        sorted.length > 0
          ? sorted.filter((p) => getPlayerTotal(p.id, state) === topScore)
          : noWinners;
      return { isOver: true, reason: 'rounds', winners };
    }
  }

  return { isOver: false, winners: noWinners };
}

export function getCurrentRoundNumber(state: GameState): number {
  return state.activeRoundIndex + 1;
}

export function formatRoundProgress(state: GameState): string {
  const current = getCurrentRoundNumber(state);
  if (state.settings.maxRounds != null) {
    return `Ronda ${current}/${state.settings.maxRounds}`;
  }
  return `Ronda ${current}`;
}

export function formatPointsGoal(state: GameState): string | null {
  if (state.settings.maxPointsToWin == null) return null;
  return `Objetivo: ${state.settings.maxPointsToWin} pts`;
}

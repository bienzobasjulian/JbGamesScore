import { GameState, Player, RoundScores } from '../types';

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getPlayerTotalThroughRound(
  playerId: string,
  state: GameState,
  throughRoundIndex: number,
): number {
  let total = 0;
  const last = Math.min(throughRoundIndex, state.rounds.length - 1);
  for (let i = 0; i <= last; i++) {
    total += state.rounds[i]?.[playerId] ?? 0;
  }
  return total;
}

/** Suma todas las rondas, incluida la activa (para mostrar en pantalla). */
export function getPlayerTotal(playerId: string, state: GameState): number {
  if (state.rounds.length === 0) return 0;
  return getPlayerTotalThroughRound(
    playerId,
    state,
    state.rounds.length - 1,
  );
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

/** Índice de la última ronda ya cerrada (-1 si ninguna). */
export function getLastClosedRoundIndex(state: GameState): number {
  return state.activeRoundIndex - 1;
}

export function sortPlayersByScore(
  players: Player[],
  state: GameState,
  throughRoundIndex?: number,
): Player[] {
  const lowestWins = state.settings.lowestScoreWins === true;
  const totalOf = (id: string) =>
    throughRoundIndex != null
      ? getPlayerTotalThroughRound(id, state, throughRoundIndex)
      : getPlayerTotal(id, state);

  return [...players].sort((a, b) => {
    const diff = totalOf(b.id) - totalOf(a.id);
    return lowestWins ? -diff : diff;
  });
}

export const defaultSettings = (): GameState['settings'] => ({
  maxRounds: null,
  maxPointsToWin: null,
  lowestScoreWins: false,
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
  return {
    maxRounds,
    maxPointsToWin,
    lowestScoreWins: settings?.lowestScoreWins === true,
  };
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

export type CheckGameOverOptions = {
  /**
   * Hasta qué ronda (inclusive) se suman puntos para el objetivo.
   * Por defecto: solo rondas cerradas (anterior a la activa).
   */
  pointsThroughRoundIndex?: number;
};

function resolvePointsThroughRoundIndex(
  state: GameState,
  options?: CheckGameOverOptions,
): number {
  if (options?.pointsThroughRoundIndex != null) {
    return options.pointsThroughRoundIndex;
  }
  return getLastClosedRoundIndex(state);
}

export function checkGameOver(
  state: GameState,
  options?: CheckGameOverOptions,
): GameOverResult {
  const noWinners: Player[] = [];
  const pointsThrough = resolvePointsThroughRoundIndex(state, options);

  if (state.settings.maxPointsToWin != null && pointsThrough >= 0) {
    const threshold = state.settings.maxPointsToWin;
    const lowestWins = state.settings.lowestScoreWins === true;
    const totalOf = (id: string) =>
      getPlayerTotalThroughRound(id, state, pointsThrough);

    const someoneReachedLimit = state.players.some(
      (p) => totalOf(p.id) >= threshold,
    );

    if (someoneReachedLimit) {
      if (lowestWins) {
        const ranked = sortPlayersByScore(
          state.players,
          state,
          pointsThrough,
        );
        const bestScore = totalOf(ranked[0].id);
        const winners = ranked.filter((p) => totalOf(p.id) === bestScore);
        return { isOver: true, reason: 'points', winners };
      }

      const qualified = state.players.filter((p) => totalOf(p.id) >= threshold);
      const ranked = sortPlayersByScore(qualified, state, pointsThrough);
      const bestScore = totalOf(ranked[0].id);
      const winners = ranked.filter((p) => totalOf(p.id) === bestScore);
      return { isOver: true, reason: 'points', winners };
    }
  }

  if (state.settings.maxRounds != null) {
    if (state.activeRoundIndex >= state.settings.maxRounds) {
      const through = state.settings.maxRounds - 1;
      const ranked = sortPlayersByScore(state.players, state, through);
      const totalOf = (id: string) =>
        getPlayerTotalThroughRound(id, state, through);
      const bestScore = ranked.length > 0 ? totalOf(ranked[0].id) : 0;
      const winners =
        ranked.length > 0
          ? ranked.filter((p) => totalOf(p.id) === bestScore)
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
  if (state.settings.lowestScoreWins) {
    return `Al cerrar ronda: si alguien llega a ${state.settings.maxPointsToWin} pts, gana el menor total`;
  }
  return `Al cerrar ronda: ${state.settings.maxPointsToWin} pts para ganar`;
}

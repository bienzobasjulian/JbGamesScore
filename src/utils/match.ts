import { PLAYER_COLORS } from '../constants';
import {
  AppData,
  GameState,
  Match,
  Player,
  RoundScores,
  SavedPlayer,
} from '../types';
import {
  checkGameOver,
  createId,
  getPlayerTotal,
  normalizeSettings,
  sortPlayersByScore,
} from './game';
import {
  getAventurerosTrenMatchRanking,
  getAventurerosTrenMatchWinners,
} from './aventurerosTren';
import {
  createInitialRounds,
  normalizeMatchRounds,
} from './rounds';

export type RankedPlayer = {
  player: Player;
  total: number;
  rank: number;
};

export function matchToGameState(match: Match): GameState {
  const m = normalizeMatchRounds(match);
  return {
    players: m.players,
    rounds: m.rounds,
    roundBreakdowns: m.roundBreakdowns,
    activeRoundIndex: m.activeRoundIndex,
    roundScoringMode: m.roundScoringMode ?? {},
    isPlaying: m.status === 'in_progress',
    settings: m.settings,
  };
}

export function formatMatchTitle(match: Match): string {
  const custom = match.name?.trim();
  if (custom) return custom;
  if (match.gameMode === 'pelusas') return 'Pelusas';
  if (match.gameMode === 'skull_king') return 'Skull King';
  if (match.gameMode === 'aventureros_tren') {
    return match.name?.trim() || 'Aventureros al tren';
  }
  if (match.players.length === 0) return 'Partida vacía';
  const names = match.players.map((p) => p.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} vs ${names[1]}`;
  return `${names[0]}, ${names[1]} y ${names.length - 2} más`;
}

export function formatMatchDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function formatPlayerCount(count: number): string {
  return count === 1 ? '1 jugador' : `${count} jugadores`;
}

export function getMatchRanking(match: Match): RankedPlayer[] {
  const state = matchToGameState(match);
  const sorted = sortPlayersByScore(match.players, state);
  let rank = 0;
  let prevScore: number | null = null;

  return sorted.map((player, index) => {
    const total = getPlayerTotal(player.id, state);
    if (prevScore === null || total !== prevScore) {
      rank = index + 1;
      prevScore = total;
    }
    return { player, total, rank };
  });
}

export function getMatchRankingFromState(state: GameState): RankedPlayer[] {
  const sorted = sortPlayersByScore(state.players, state);
  let rank = 0;
  let prevScore: number | null = null;

  return sorted.map((player, index) => {
    const total = getPlayerTotal(player.id, state);
    if (prevScore === null || total !== prevScore) {
      rank = index + 1;
      prevScore = total;
    }
    return { player, total, rank };
  });
}

export function getMatchRankingFromMatch(match: Match): RankedPlayer[] {
  if (match.gameMode === 'aventureros_tren' && match.status === 'finished') {
    return getAventurerosTrenMatchRanking(match);
  }
  return getMatchRankingFromState(matchToGameState(match));
}

export function getMatchWinners(match: Match): Player[] {
  if (match.gameMode === 'aventureros_tren' && match.status === 'finished') {
    return getAventurerosTrenMatchWinners(match);
  }

  const state = matchToGameState(match);
  const over = checkGameOver(state);
  if (over.winners.length > 0) return over.winners;

  const m = normalizeMatchRounds(match);
  if (match.status === 'finished' || m.rounds.length > 0) {
    const ranked = sortPlayersByScore(match.players, state);
    if (ranked.length === 0) return [];
    const topScore = getPlayerTotal(ranked[0].id, state);
    return ranked.filter((p) => getPlayerTotal(p.id, state) === topScore);
  }

  return [];
}

export function formatWinnerLabel(match: Match): string | null {
  const winners = getMatchWinners(match);
  if (winners.length === 0) return null;
  const names = winners.map((w) => w.name).join(', ');
  if (winners.length > 1) return `Empate: ${names}`;
  return `Ganador: ${names}`;
}

export function formatMatchSubtitle(match: Match): string {
  const m = normalizeMatchRounds(match);
  if (match.status === 'finished') return 'Finalizada';
  return `Ronda ${m.activeRoundIndex + 1}`;
}

export function formatMatchListMeta(match: Match): string {
  const parts = [
    formatMatchDate(match.updatedAt),
    formatPlayerCount(match.players.length),
  ];
  if (match.gameMode === 'pelusas') {
    parts.push(
      match.pelusasRevolution ? 'Pelusas · Revolution' : 'Pelusas',
    );
  }
  if (match.gameMode === 'skull_king') {
    parts.push('Skull King · 10 rondas');
  }
  if (match.gameMode === 'aventureros_tren') {
    parts.push(formatMatchTitle(match));
  }
  if (match.status === 'in_progress') {
    parts.push(formatMatchSubtitle(match));
  }
  return parts.join(' · ');
}

export function formatMatchListSubtitle(match: Match): string {
  const meta = formatMatchListMeta(match);
  if (match.status === 'finished') {
    const winner = formatWinnerLabel(match);
    return winner ? `${meta}\n${winner}` : `${meta}\nFinalizada`;
  }
  return meta;
}

export function getRecentPlayers(
  players: SavedPlayer[],
  limit: number,
): SavedPlayer[] {
  return [...players]
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, limit);
}

export function getInProgressMatches(matches: Match[]): Match[] {
  return [...matches]
    .filter((m) => m.status === 'in_progress')
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getRecentFinishedMatches(
  matches: Match[],
  limit: number,
): Match[] {
  return [...matches]
    .filter((m) => m.status === 'finished')
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

export function getAllMatchesSorted(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createMatch(
  players: Player[],
  settings: GameState['settings'],
  name?: string | null,
): Match {
  const now = Date.now();
  const trimmedName = name?.trim();
  const normalizedSettings = normalizeSettings(settings);
  const initialRoundCount = normalizedSettings.maxRounds ?? 1;
  const { rounds, roundBreakdowns } = createInitialRounds(
    players,
    initialRoundCount,
  );
  return {
    id: createId(),
    name: trimmedName ? trimmedName : null,
    settings: normalizedSettings,
    players,
    rounds,
    roundBreakdowns,
    activeRoundIndex: 0,
    roundScoringMode: {},
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
  };
}

export function pickPlayerColor(existing: Player[]): string {
  return PLAYER_COLORS[existing.length % PLAYER_COLORS.length];
}

export function initialAppData(): AppData {
  return { players: [], matches: [], templates: [] };
}

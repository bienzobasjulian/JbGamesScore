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

export type RankedPlayer = {
  player: Player;
  total: number;
  rank: number;
};

export function matchToGameState(match: Match): GameState {
  return {
    players: match.players,
    completedRounds: match.completedRounds,
    currentRound: match.currentRound,
    isPlaying: match.status === 'in_progress',
    settings: match.settings,
  };
}

export function formatMatchTitle(match: Match): string {
  const custom = match.name?.trim();
  if (custom) return custom;
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

export function getMatchWinners(match: Match): Player[] {
  const state = matchToGameState(match);
  const over = checkGameOver(state);
  if (over.winners.length > 0) return over.winners;

  if (match.status === 'finished' || match.completedRounds.length > 0) {
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
  const round =
    match.completedRounds.length +
    (match.status === 'in_progress' ? 1 : 0);
  if (match.status === 'finished') return 'Finalizada';
  return `Ronda ${round}`;
}

export function formatMatchListMeta(match: Match): string {
  const parts = [
    formatMatchDate(match.updatedAt),
    formatPlayerCount(match.players.length),
  ];
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
  const currentRound: RoundScores = {};
  players.forEach((p) => {
    currentRound[p.id] = 0;
  });
  const trimmedName = name?.trim();
  return {
    id: createId(),
    name: trimmedName ? trimmedName : null,
    settings: normalizeSettings(settings),
    players,
    completedRounds: [],
    currentRound,
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
  };
}

export function pickPlayerColor(existing: Player[]): string {
  return PLAYER_COLORS[existing.length % PLAYER_COLORS.length];
}

export function initialAppData(): AppData {
  return { players: [], matches: [] };
}

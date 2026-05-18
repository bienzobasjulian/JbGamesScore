import {
  AventurerosTrenDestinationEntry,
  AventurerosTrenPhase,
  AventurerosTrenRouteEntry,
  AventurerosTrenSession,
  Match,
  Player,
} from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const AVENTUREROS_TREN_MIN_PLAYERS = 2;
export const AVENTUREROS_TREN_MAX_PLAYERS = 5;

export const ROUTE_LENGTH_OPTIONS = [1, 2, 3, 4, 5, 6, 8] as const;

export const ROUTE_POINTS_BY_LENGTH: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
  6: 15,
  8: 21,
};

export function createAventurerosTrenRouteEntry(): AventurerosTrenRouteEntry {
  return {
    id: createId(),
    origin: '',
    destination: '',
    useCustomPoints: false,
    length: 1,
    customPoints: 0,
  };
}

export function createAventurerosTrenDestinationEntry(): AventurerosTrenDestinationEntry {
  return {
    id: createId(),
    origin: '',
    destination: '',
    points: 0,
    completed: true,
  };
}

export function createAventurerosTrenSession(
  players: Player[],
): AventurerosTrenSession {
  const construccion: AventurerosTrenSession['construccion'] = {};
  const destinos: AventurerosTrenSession['destinos'] = {};
  for (const player of players) {
    construccion[player.id] = [];
    destinos[player.id] = [];
  }
  return {
    players,
    activePhase: 'construccion',
    construccion,
    destinos,
  };
}

export function getRouteEntryPoints(entry: AventurerosTrenRouteEntry): number {
  if (entry.useCustomPoints) {
    return Math.floor(entry.customPoints);
  }
  return ROUTE_POINTS_BY_LENGTH[entry.length] ?? 0;
}

export function getDestinationEntryPoints(
  entry: AventurerosTrenDestinationEntry,
): number {
  const pts = Math.max(0, Math.floor(entry.points));
  return entry.completed ? pts : -pts;
}

export function getConstruccionTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  const routes = session.construccion[playerId] ?? [];
  return routes.reduce((sum, r) => sum + getRouteEntryPoints(r), 0);
}

export function getDestinosTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  const cards = session.destinos[playerId] ?? [];
  return cards.reduce((sum, d) => sum + getDestinationEntryPoints(d), 0);
}

export function getAventurerosTrenGrandTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  return getConstruccionTotal(session, playerId) + getDestinosTotal(session, playerId);
}

export function sortPlayersByAventurerosTrenTotal(
  session: AventurerosTrenSession,
): {
  player: Player;
  construccion: number;
  destinos: number;
  total: number;
}[] {
  return session.players
    .map((player) => ({
      player,
      construccion: getConstruccionTotal(session, player.id),
      destinos: getDestinosTotal(session, player.id),
      total: getAventurerosTrenGrandTotal(session, player.id),
    }))
    .sort((a, b) => b.total - a.total);
}

export function createFinishedAventurerosTrenMatch(
  session: AventurerosTrenSession,
): Match {
  const now = Date.now();
  const construccionScores: Record<string, number> = {};
  const destinosScores: Record<string, number> = {};

  for (const player of session.players) {
    construccionScores[player.id] = getConstruccionTotal(session, player.id);
    destinosScores[player.id] = getDestinosTotal(session, player.id);
  }

  return {
    id: createId(),
    name: 'Aventureros al tren',
    gameMode: 'aventureros_tren',
    settings: { maxRounds: null, maxPointsToWin: null },
    players: session.players,
    rounds: [construccionScores, destinosScores],
    roundBreakdowns: [emptyRoundBreakdown(), emptyRoundBreakdown()],
    activeRoundIndex: 1,
    roundScoringMode: {},
    status: 'finished',
    createdAt: now,
    updatedAt: now,
  };
}

export function getPhaseLabel(phase: AventurerosTrenPhase): string {
  return phase === 'construccion' ? 'Construcción' : 'Destinos';
}

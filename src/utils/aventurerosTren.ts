import {
  AventurerosTrenDestinationEntry,
  AventurerosTrenPhase,
  AventurerosTrenPlayerScoring,
  AventurerosTrenRouteEntry,
  AventurerosTrenSession,
  AventurerosTrenSubmode,
  AventurerosTrenTiebreakSnapshot,
  Match,
  Player,
} from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const AVENTUREROS_TREN_MIN_PLAYERS = 1;
export const AVENTUREROS_TREN_MAX_PLAYERS = 5;

export const LONGEST_ROUTE_BONUS_POINTS = 10;
export const EUROPA_STATION_BONUS_PER_UNUSED = 4;
export const EUROPA_MAX_STATIONS = 3;

const ROUTE_CONFIG: Record<
  AventurerosTrenSubmode,
  { lengths: readonly number[]; points: Record<number, number> }
> = {
  base: {
    lengths: [1, 2, 3, 5, 6],
    points: { 1: 1, 2: 2, 3: 4, 5: 10, 6: 15 },
  },
  europa: {
    lengths: [1, 2, 3, 4, 6, 8],
    points: { 1: 1, 2: 2, 3: 4, 4: 7, 6: 15, 8: 21 },
  },
};

export const AVENTUREROS_TREN_SUBMODES: {
  id: AventurerosTrenSubmode;
  name: string;
  description: string;
}[] = [
  {
    id: 'base',
    name: 'Aventureros al tren',
    description:
      'Vías 1–3, 5 y 6. Bonificación +10 por ruta más larga. Desempate: billetes, luego ruta.',
  },
  {
    id: 'europa',
    name: 'Aventureros al tren Europa',
    description:
      'Vías 1–4, 6 y 8. Estaciones sin usar (+4 c/u). Misma bonificación y desempates.',
  },
];

export function getRouteLengthOptions(
  submode: AventurerosTrenSubmode,
): readonly number[] {
  return ROUTE_CONFIG[submode].lengths;
}

export function getRoutePointsByLength(
  submode: AventurerosTrenSubmode,
): Record<number, number> {
  return ROUTE_CONFIG[submode].points;
}

export function getSubmodeLabel(submode: AventurerosTrenSubmode): string {
  return submode === 'europa'
    ? 'Aventureros al tren Europa'
    : 'Aventureros al tren';
}

export function createDefaultPlayerScoring(): AventurerosTrenPlayerScoring {
  return {
    hasLongestRouteBonus: false,
    longestRouteLength: 0,
    unusedStations: 0,
  };
}

export function createAventurerosTrenRouteEntry(
  submode: AventurerosTrenSubmode = 'base',
): AventurerosTrenRouteEntry {
  const lengths = getRouteLengthOptions(submode);
  return {
    id: createId(),
    origin: '',
    destination: '',
    useCustomPoints: false,
    length: lengths[0] ?? 1,
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
  submode: AventurerosTrenSubmode = 'base',
): AventurerosTrenSession {
  const construccion: AventurerosTrenSession['construccion'] = {};
  const destinos: AventurerosTrenSession['destinos'] = {};
  const scoring: AventurerosTrenSession['scoring'] = {};
  for (const player of players) {
    construccion[player.id] = [];
    destinos[player.id] = [];
    scoring[player.id] = createDefaultPlayerScoring();
  }
  return {
    players,
    submode,
    activePhase: 'construccion',
    construccion,
    destinos,
    scoring,
  };
}

export function getRouteEntryPoints(
  entry: AventurerosTrenRouteEntry,
  submode: AventurerosTrenSubmode,
): number {
  if (entry.useCustomPoints) {
    return Math.floor(entry.customPoints);
  }
  return getRoutePointsByLength(submode)[entry.length] ?? 0;
}

export function getDestinationEntryPoints(
  entry: AventurerosTrenDestinationEntry,
): number {
  const pts = Math.max(0, Math.floor(entry.points));
  return entry.completed ? pts : -pts;
}

export function countCompletedTickets(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  return (session.destinos[playerId] ?? []).filter((d) => d.completed).length;
}

export function getPlayerScoring(
  session: AventurerosTrenSession,
  playerId: string,
): AventurerosTrenPlayerScoring {
  return session.scoring[playerId] ?? createDefaultPlayerScoring();
}

export function getEndgameBonusPoints(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  const scoring = getPlayerScoring(session, playerId);
  let bonus = 0;
  if (scoring.hasLongestRouteBonus) {
    bonus += LONGEST_ROUTE_BONUS_POINTS;
  }
  if (session.submode === 'europa') {
    const unused = Math.min(
      EUROPA_MAX_STATIONS,
      Math.max(0, Math.floor(scoring.unusedStations)),
    );
    bonus += unused * EUROPA_STATION_BONUS_PER_UNUSED;
  }
  return bonus;
}

export function getConstruccionTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  const routes = session.construccion[playerId] ?? [];
  return routes.reduce(
    (sum, r) => sum + getRouteEntryPoints(r, session.submode),
    0,
  );
}

export function getDestinosCardsTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  const cards = session.destinos[playerId] ?? [];
  return cards.reduce((sum, d) => sum + getDestinationEntryPoints(d), 0);
}

export function getDestinosTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  return (
    getDestinosCardsTotal(session, playerId) +
    getEndgameBonusPoints(session, playerId)
  );
}

export function getAventurerosTrenGrandTotal(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  return (
    getConstruccionTotal(session, playerId) +
    getDestinosTotal(session, playerId)
  );
}

export function getStationsUsed(
  session: AventurerosTrenSession,
  playerId: string,
): number {
  const unused = Math.min(
    EUROPA_MAX_STATIONS,
    Math.max(0, Math.floor(getPlayerScoring(session, playerId).unusedStations)),
  );
  return EUROPA_MAX_STATIONS - unused;
}

export type AventurerosTrenRankingRow = {
  player: Player;
  construccion: number;
  destinosCards: number;
  bonuses: number;
  destinos: number;
  total: number;
  completedTickets: number;
  longestRouteLength: number;
  stationsUsed: number;
};

function buildRankingRow(
  session: AventurerosTrenSession,
  player: Player,
): AventurerosTrenRankingRow {
  const construccion = getConstruccionTotal(session, player.id);
  const destinosCards = getDestinosCardsTotal(session, player.id);
  const bonuses = getEndgameBonusPoints(session, player.id);
  const scoring = getPlayerScoring(session, player.id);
  return {
    player,
    construccion,
    destinosCards,
    bonuses,
    destinos: destinosCards + bonuses,
    total: construccion + destinosCards + bonuses,
    completedTickets: countCompletedTickets(session, player.id),
    longestRouteLength: Math.max(0, Math.floor(scoring.longestRouteLength)),
    stationsUsed: getStationsUsed(session, player.id),
  };
}

export function compareAventurerosTrenRanking(
  a: AventurerosTrenRankingRow,
  b: AventurerosTrenRankingRow,
  submode: AventurerosTrenSubmode,
): number {
  if (a.total !== b.total) return b.total - a.total;
  if (a.completedTickets !== b.completedTickets) {
    return b.completedTickets - a.completedTickets;
  }
  if (submode === 'europa' && a.stationsUsed !== b.stationsUsed) {
    return a.stationsUsed - b.stationsUsed;
  }
  if (a.longestRouteLength !== b.longestRouteLength) {
    return b.longestRouteLength - a.longestRouteLength;
  }
  return a.player.name.localeCompare(b.player.name, 'es');
}

export function sortPlayersByAventurerosTrenTotal(
  session: AventurerosTrenSession,
): AventurerosTrenRankingRow[] {
  return session.players
    .map((player) => buildRankingRow(session, player))
    .sort((a, b) => compareAventurerosTrenRanking(a, b, session.submode));
}

export function buildTiebreakSnapshot(
  session: AventurerosTrenSession,
  playerId: string,
): AventurerosTrenTiebreakSnapshot {
  const scoring = getPlayerScoring(session, playerId);
  return {
    completedTickets: countCompletedTickets(session, playerId),
    longestRouteLength: Math.max(0, Math.floor(scoring.longestRouteLength)),
    unusedStations: Math.min(
      EUROPA_MAX_STATIONS,
      Math.max(0, Math.floor(scoring.unusedStations)),
    ),
  };
}

export function createFinishedAventurerosTrenMatch(
  session: AventurerosTrenSession,
): Match {
  const now = Date.now();
  const construccionScores: Record<string, number> = {};
  const destinosScores: Record<string, number> = {};
  const tiebreak: Record<string, AventurerosTrenTiebreakSnapshot> = {};

  for (const player of session.players) {
    construccionScores[player.id] = getConstruccionTotal(session, player.id);
    destinosScores[player.id] = getDestinosTotal(session, player.id);
    tiebreak[player.id] = buildTiebreakSnapshot(session, player.id);
  }

  return {
    id: createId(),
    name: getSubmodeLabel(session.submode),
    gameMode: 'aventureros_tren',
    aventurerosTrenSubmode: session.submode,
    aventurerosTrenTiebreak: tiebreak,
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

type TiebreakPlayer = {
  player: Player;
  total: number;
  snapshot: AventurerosTrenTiebreakSnapshot;
  stationsUsed: number;
};

function buildTiebreakPlayer(
  match: Match,
  player: Player,
): TiebreakPlayer {
  const state = match.rounds;
  const constr = state[0]?.[player.id] ?? 0;
  const dest = state[1]?.[player.id] ?? 0;
  const snapshot = match.aventurerosTrenTiebreak?.[player.id] ?? {
    completedTickets: 0,
    longestRouteLength: 0,
    unusedStations: 0,
  };
  return {
    player,
    total: constr + dest,
    snapshot,
    stationsUsed: EUROPA_MAX_STATIONS - snapshot.unusedStations,
  };
}

export function compareAventurerosTrenMatchPlayers(
  a: TiebreakPlayer,
  b: TiebreakPlayer,
  submode: AventurerosTrenSubmode,
): number {
  if (a.total !== b.total) return b.total - a.total;
  if (a.snapshot.completedTickets !== b.snapshot.completedTickets) {
    return b.snapshot.completedTickets - a.snapshot.completedTickets;
  }
  if (submode === 'europa' && a.stationsUsed !== b.stationsUsed) {
    return a.stationsUsed - b.stationsUsed;
  }
  if (a.snapshot.longestRouteLength !== b.snapshot.longestRouteLength) {
    return b.snapshot.longestRouteLength - a.snapshot.longestRouteLength;
  }
  return a.player.name.localeCompare(b.player.name, 'es');
}

export function sortAventurerosTrenMatchPlayers(match: Match): Player[] {
  const submode = match.aventurerosTrenSubmode ?? 'base';
  return [...match.players].sort((a, b) =>
    compareAventurerosTrenMatchPlayers(
      buildTiebreakPlayer(match, a),
      buildTiebreakPlayer(match, b),
      submode,
    ),
  );
}

export function getAventurerosTrenMatchRanking(
  match: Match,
): { player: Player; total: number; rank: number }[] {
  const sorted = sortAventurerosTrenMatchPlayers(match);
  let rank = 0;
  let prev: TiebreakPlayer | null = null;

  return sorted.map((player, index) => {
    const row = buildTiebreakPlayer(match, player);
    if (
      !prev ||
      compareAventurerosTrenMatchPlayers(row, prev, match.aventurerosTrenSubmode ?? 'base') !== 0
    ) {
      rank = index + 1;
      prev = row;
    }
    return { player, total: row.total, rank };
  });
}

export function getAventurerosTrenMatchWinners(match: Match): Player[] {
  const sorted = sortAventurerosTrenMatchPlayers(match);
  if (sorted.length === 0) return [];
  const top = buildTiebreakPlayer(match, sorted[0]);
  return sorted.filter((p) => {
    const row = buildTiebreakPlayer(match, p);
    return (
      row.total === top.total &&
      row.snapshot.completedTickets === top.snapshot.completedTickets &&
      (match.aventurerosTrenSubmode !== 'europa' ||
        row.stationsUsed === top.stationsUsed) &&
      row.snapshot.longestRouteLength === top.snapshot.longestRouteLength
    );
  });
}

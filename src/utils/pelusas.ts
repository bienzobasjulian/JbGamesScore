import {
  Match,
  PelusasPlayerCounts,
  PelusasSession,
  Player,
} from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const PELUSAS_HOW_TO_PLAY = [
  'En tu turno, roba cartas del mazo y colócalas boca arriba. Tras cada una, decide si sigues o te plantas.',
  'Si tienes 3 o más cartas boca arriba en total y te sale una repetida, pierdes esas cartas y el turno.',
  'Si te sale un valor que otro tiene delante, puedes robarle todas las de ese número. Si varios lo tienen, puedes robárselas a todos.',
  'Cuando te vuelva a tocar, recoge las cartas que tengas delante: pasan a tu montón de puntos. Cada carta vale su número.',
  'Gana quien más puntos sume. Si hay empate, gana quien tenga más cartas de 1; si sigue, de 2, y así.',
].join('\n\n');

export const PELUSAS_STANDARD_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const PELUSAS_REVOLUTION_CARDS = [20, -7] as const;

export type PelusasCard = (typeof PELUSAS_STANDARD_CARDS)[number];

export function pelusasCardKey(value: number): string {
  return String(value);
}

export function getPelusasCardValues(revolutionMode: boolean): number[] {
  if (!revolutionMode) {
    return [...PELUSAS_STANDARD_CARDS];
  }
  return [...PELUSAS_STANDARD_CARDS, ...PELUSAS_REVOLUTION_CARDS];
}

export function formatPelusasCardLabel(value: number): string {
  if (value === -7) return '−7';
  return String(value);
}

export function emptyPelusasCounts(revolutionMode: boolean): PelusasPlayerCounts {
  const counts: PelusasPlayerCounts = {};
  for (const value of getPelusasCardValues(revolutionMode)) {
    counts[pelusasCardKey(value)] = 0;
  }
  return counts;
}

export function createPelusasCountsByPlayer(
  players: Player[],
  revolutionMode: boolean,
): Record<string, PelusasPlayerCounts> {
  const byPlayer: Record<string, PelusasPlayerCounts> = {};
  for (const player of players) {
    byPlayer[player.id] = emptyPelusasCounts(revolutionMode);
  }
  return byPlayer;
}

export function calculatePelusasScore(
  counts: PelusasPlayerCounts,
  revolutionMode: boolean,
): number {
  let total = 0;
  for (const value of getPelusasCardValues(revolutionMode)) {
    const key = pelusasCardKey(value);
    const qty = counts[key] ?? 0;
    if (qty > 0) {
      total += qty * value;
    }
  }
  return total;
}

function pelusasCardCount(
  countsByPlayer: Record<string, PelusasPlayerCounts>,
  playerId: string,
  value: number,
): number {
  return countsByPlayer[playerId]?.[pelusasCardKey(value)] ?? 0;
}

export function comparePelusasRanking(
  a: { player: Player; score: number },
  b: { player: Player; score: number },
  countsByPlayer: Record<string, PelusasPlayerCounts>,
  revolutionMode: boolean,
): number {
  if (b.score !== a.score) return b.score - a.score;
  for (const value of getPelusasCardValues(revolutionMode)) {
    const diff =
      pelusasCardCount(countsByPlayer, b.player.id, value) -
      pelusasCardCount(countsByPlayer, a.player.id, value);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function sortPlayersByPelusasScore(
  players: Player[],
  countsByPlayer: Record<string, PelusasPlayerCounts>,
  revolutionMode: boolean,
): { player: Player; score: number }[] {
  return players
    .map((player) => ({
      player,
      score: calculatePelusasScore(
        countsByPlayer[player.id] ?? {},
        revolutionMode,
      ),
    }))
    .sort((a, b) =>
      comparePelusasRanking(a, b, countsByPlayer, revolutionMode),
    );
}

export function getPelusasMatchRanking(match: Match): {
  player: Player;
  score: number;
}[] {
  const session = match.pelusasSession;
  if (session) {
    return sortPlayersByPelusasScore(
      session.players,
      session.countsByPlayer,
      session.revolutionMode,
    );
  }
  return sortPlayersByPelusasScore(
    match.players,
    {},
    Boolean(match.pelusasRevolution),
  );
}

export function getPelusasMatchWinners(match: Match): Player[] {
  const ranked = getPelusasMatchRanking(match);
  if (ranked.length === 0) return [];
  const session = match.pelusasSession;
  const counts = session?.countsByPlayer ?? {};
  const revolution = session?.revolutionMode ?? Boolean(match.pelusasRevolution);
  const leader = ranked[0];
  return ranked
    .filter(
      (entry) =>
        comparePelusasRanking(entry, leader, counts, revolution) === 0,
    )
    .map((entry) => entry.player);
}

export function createInProgressPelusasMatch(
  session: PelusasSession,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: 'Pelusas',
    gameMode: 'pelusas',
    sessionId: sessionId ?? null,
    pelusasRevolution: session.revolutionMode,
    settings: { maxRounds: null, maxPointsToWin: null },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: 0,
    roundScoringMode: {},
    status: 'in_progress',
    pelusasSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

export function createFinishedPelusasMatch(session: PelusasSession): Match {
  const now = Date.now();
  const scores: Record<string, number> = {};
  for (const player of session.players) {
    scores[player.id] = calculatePelusasScore(
      session.countsByPlayer[player.id] ?? {},
      session.revolutionMode,
    );
  }

  return {
    id: createId(),
    name: 'Pelusas',
    gameMode: 'pelusas',
    pelusasRevolution: session.revolutionMode,
    settings: { maxRounds: null, maxPointsToWin: null },
    players: session.players,
    rounds: [scores],
    roundBreakdowns: [emptyRoundBreakdown()],
    activeRoundIndex: 0,
    roundScoringMode: {},
    status: 'finished',
    pelusasSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

import {
  Match,
  PelusasPlayerCounts,
  PelusasSession,
  Player,
} from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

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
    .sort((a, b) => b.score - a.score);
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
    createdAt: now,
    updatedAt: now,
  };
}

import { Match, Player, SkullKingRoundEntry, SkullKingSession } from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const SKULL_KING_TOTAL_ROUNDS = 10;
export const SKULL_KING_MIN_PLAYERS = 1;
export const SKULL_KING_MAX_PLAYERS = 6;

export function emptySkullKingRoundEntry(): SkullKingRoundEntry {
  return {
    bid: 0,
    tricksWon: 0,
    entered: false,
    goldBonusPoints: 0,
    pirateCount: 0,
    mermaidCapturesKing: false,
  };
}

export function createSkullKingSession(players: Player[]): SkullKingSession {
  const rounds = Array.from({ length: SKULL_KING_TOTAL_ROUNDS }, () => {
    const byPlayer: Record<string, SkullKingRoundEntry> = {};
    for (const player of players) {
      byPlayer[player.id] = emptySkullKingRoundEntry();
    }
    return byPlayer;
  });

  return {
    players,
    activeRoundIndex: 0,
    rounds,
  };
}

export function getSkullKingRoundNumber(roundIndex: number): number {
  return roundIndex + 1;
}

export function getSkullKingCardsDealt(roundIndex: number): number {
  return getSkullKingRoundNumber(roundIndex);
}

export function calculateSkullKingRoundScore(
  roundNumber: number,
  entry: SkullKingRoundEntry,
): number {
  if (!entry.entered) {
    return 0;
  }

  const { bid, tricksWon, goldBonusPoints, pirateCount, mermaidCapturesKing } =
    entry;

  if (bid === tricksWon) {
    let score = bid === 0 ? roundNumber * 10 : tricksWon * 20;
    score += Math.max(0, goldBonusPoints);
    score += Math.max(0, pirateCount) * 30;
    if (mermaidCapturesKing) {
      score += 50;
    }
    return score;
  }

  return -10 * Math.abs(tricksWon - bid);
}

/** Suma rondas anteriores a `upToRoundExclusive` (índice de la ronda activa). */
export function getSkullKingPlayerTotal(
  session: SkullKingSession,
  playerId: string,
  upToRoundExclusive: number = session.rounds.length,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(upToRoundExclusive, session.rounds.length));
  for (let i = 0; i < limit; i++) {
    const entry = session.rounds[i][playerId] ?? emptySkullKingRoundEntry();
    total += calculateSkullKingRoundScore(getSkullKingRoundNumber(i), entry);
  }
  return total;
}

export function sortPlayersBySkullKingTotal(
  session: SkullKingSession,
  upToRoundExclusive: number = session.rounds.length,
): { player: Player; total: number }[] {
  return session.players
    .map((player) => ({
      player,
      total: getSkullKingPlayerTotal(session, player.id, upToRoundExclusive),
    }))
    .sort((a, b) => b.total - a.total);
}

export function createFinishedSkullKingMatch(session: SkullKingSession): Match {
  const now = Date.now();
  const rounds = session.rounds.map((roundByPlayer, index) => {
    const roundNumber = getSkullKingRoundNumber(index);
    const scores: Record<string, number> = {};
    for (const player of session.players) {
      const entry = roundByPlayer[player.id] ?? emptySkullKingRoundEntry();
      scores[player.id] = calculateSkullKingRoundScore(roundNumber, entry);
    }
    return scores;
  });

  return {
    id: createId(),
    name: 'Skull King',
    gameMode: 'skull_king',
    settings: { maxRounds: SKULL_KING_TOTAL_ROUNDS, maxPointsToWin: null },
    players: session.players,
    rounds,
    roundBreakdowns: rounds.map(() => emptyRoundBreakdown()),
    activeRoundIndex: SKULL_KING_TOTAL_ROUNDS - 1,
    roundScoringMode: {},
    status: 'finished',
    createdAt: now,
    updatedAt: now,
  };
}

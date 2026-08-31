import {
  Flip7Modifier,
  Flip7PlayerRoundStatus,
  Flip7RoundEntry,
  Flip7Session,
  Match,
  Player,
} from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const FLIP7_MIN_PLAYERS = 3;
export const FLIP7_WIN_AT = 200;

export const FLIP7_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const FLIP7_MODIFIERS: Flip7Modifier[] = [
  '+2',
  '+4',
  '+6',
  '+8',
  '+10',
  'x2',
];

export const FLIP7_FLIP7_BONUS = 15;
export const FLIP7_MAX_NUMBERS = 7;

/** Copias de cada número en el mazo (12× del 12, 11× del 11, …, 1× del 0 y del 1). */
export function getFlip7NumberDeckSize(number: number): number {
  if (number === 0 || number === 1) return 1;
  return number;
}

export function emptyFlip7RoundEntry(): Flip7RoundEntry {
  return {
    status: 'active',
    numbers: [],
    modifiers: [],
  };
}

function emptyRoundByPlayer(players: Player[]): Record<string, Flip7RoundEntry> {
  const byPlayer: Record<string, Flip7RoundEntry> = {};
  for (const player of players) {
    byPlayer[player.id] = emptyFlip7RoundEntry();
  }
  return byPlayer;
}

export function createFlip7Session(players: Player[]): Flip7Session {
  return {
    players,
    activeRoundIndex: 0,
    rounds: [emptyRoundByPlayer(players)],
  };
}

export function getFlip7RoundNumber(roundIndex: number): number {
  return roundIndex + 1;
}

export function getFlip7RoundDeckUsage(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  excludePlayerId?: string,
): { numbers: Record<number, number>; modifiers: Record<Flip7Modifier, number> } {
  const numbers: Record<number, number> = {};
  const modifiers = Object.fromEntries(
    FLIP7_MODIFIERS.map((m) => [m, 0]),
  ) as Record<Flip7Modifier, number>;

  for (const [playerId, entry] of Object.entries(roundByPlayer)) {
    if (playerId === excludePlayerId) continue;
    for (const n of entry.numbers) {
      numbers[n] = (numbers[n] ?? 0) + 1;
    }
    for (const mod of entry.modifiers) {
      modifiers[mod] = (modifiers[mod] ?? 0) + 1;
    }
  }

  return { numbers, modifiers };
}

export function getFlip7NumberRemaining(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  number: number,
  excludePlayerId?: string,
): number {
  const used = getFlip7RoundDeckUsage(roundByPlayer, excludePlayerId).numbers[
    number
  ] ?? 0;
  return Math.max(0, getFlip7NumberDeckSize(number) - used);
}

export function canFlip7TakeNumber(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  number: number,
): boolean {
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();
  if (entry.status !== 'active') return false;
  if (entry.numbers.includes(number)) return true;
  if (entry.numbers.length >= FLIP7_MAX_NUMBERS) return false;
  return getFlip7NumberRemaining(roundByPlayer, number, playerId) > 0;
}

export function canFlip7TakeModifier(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  modifier: Flip7Modifier,
): boolean {
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();
  if (entry.status !== 'active') return false;
  if (entry.modifiers.includes(modifier)) return true;
  const used =
    getFlip7RoundDeckUsage(roundByPlayer, playerId).modifiers[modifier] ?? 0;
  return used < 1;
}

export function hasFlip7Bonus(entry: Flip7RoundEntry): boolean {
  return new Set(entry.numbers).size >= 7;
}

/** Puntos de las cartas registradas (sin tener en cuenta plantado/eliminado). */
export function calculateFlip7EntryPoints(entry: Flip7RoundEntry): number {
  const numberSum = entry.numbers.reduce((sum, n) => sum + n, 0);
  const hasX2 = entry.modifiers.includes('x2');
  const additiveSum = entry.modifiers
    .filter((m): m is Exclude<Flip7Modifier, 'x2'> => m !== 'x2')
    .reduce((sum, m) => sum + Number(m.slice(1)), 0);
  const flip7Bonus = hasFlip7Bonus(entry) ? FLIP7_FLIP7_BONUS : 0;

  return numberSum * (hasX2 ? 2 : 1) + additiveSum + flip7Bonus;
}

export function calculateFlip7RoundScore(entry: Flip7RoundEntry): number {
  if (entry.status === 'eliminated') return 0;
  if (entry.status !== 'stood') return 0;
  return calculateFlip7EntryPoints(entry);
}

export function getFlip7DisplayScore(entry: Flip7RoundEntry): number {
  if (entry.closedScore !== undefined) return entry.closedScore;
  if (entry.status === 'eliminated') return 0;
  return calculateFlip7EntryPoints(entry);
}

export function isFlip7Eliminated(entry: Flip7RoundEntry): boolean {
  return entry.status === 'eliminated';
}

export function isFlip7RoundFinalized(entry: Flip7RoundEntry): boolean {
  return entry.status !== 'active';
}

export function isFlip7RoundComplete(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  players: Player[],
): boolean {
  return players.every((player) =>
    isFlip7RoundFinalized(roundByPlayer[player.id] ?? emptyFlip7RoundEntry()),
  );
}

export function formatFlip7RoundScoreBreakdown(entry: Flip7RoundEntry): string {
  if (entry.status === 'active') {
    const preview = calculateFlip7EntryPoints(entry);
    return preview > 0 ? `En juego · ${preview} pts posibles` : 'En juego';
  }
  if (entry.status === 'eliminated') return 'Eliminado · 0 pts';

  const numberSum = entry.numbers.reduce((sum, n) => sum + n, 0);
  const hasX2 = entry.modifiers.includes('x2');
  const additiveSum = entry.modifiers
    .filter((m): m is Exclude<Flip7Modifier, 'x2'> => m !== 'x2')
    .reduce((sum, m) => sum + Number(m.slice(1)), 0);
  const flip7Bonus = hasFlip7Bonus(entry) ? FLIP7_FLIP7_BONUS : 0;

  const parts: string[] = [];
  if (entry.numbers.length > 0) {
    parts.push(hasX2 ? `${numberSum}×2` : String(numberSum));
  } else if (hasX2) {
    parts.push('0×2');
  }
  if (additiveSum > 0) {
    parts.push(`+${additiveSum}`);
  }
  if (flip7Bonus > 0) {
    parts.push('Flip7 +15');
  }
  if (parts.length === 0) return '0 pts';
  return `${parts.join(' ')} = ${calculateFlip7EntryPoints(entry)} pts`;
}

export function hasFlip7InRound(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  players: Player[],
): boolean {
  return players.some((player) =>
    hasFlip7Bonus(roundByPlayer[player.id] ?? emptyFlip7RoundEntry()),
  );
}

export function getFlip7PlayerTotal(
  session: Flip7Session,
  playerId: string,
  upToRoundExclusive: number = session.rounds.length,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(upToRoundExclusive, session.rounds.length));
  for (let i = 0; i < limit; i++) {
    const entry = session.rounds[i][playerId] ?? emptyFlip7RoundEntry();
    total += getFlip7RoundEntryScore(entry);
  }
  return total;
}

export function getFlip7PlayerTotalFromRounds(
  rounds: Record<string, number>[],
  playerId: string,
): number {
  return rounds.reduce((sum, round) => sum + (round[playerId] ?? 0), 0);
}

export function sortPlayersByFlip7Total(
  session: Flip7Session,
  upToRoundExclusive: number = session.rounds.length,
): { player: Player; total: number }[] {
  return session.players
    .map((player) => ({
      player,
      total: getFlip7PlayerTotal(session, player.id, upToRoundExclusive),
    }))
    .sort((a, b) => b.total - a.total);
}

export function hasFlip7GameOver(
  session: Flip7Session,
  upToRoundExclusive: number = session.rounds.length,
): boolean {
  return session.players.some(
    (player) =>
      getFlip7PlayerTotal(session, player.id, upToRoundExclusive) >=
      FLIP7_WIN_AT,
  );
}

export function getFlip7GameOverWinners(
  session: Flip7Session,
  upToRoundExclusive: number = session.rounds.length,
): Player[] {
  const ranked = sortPlayersByFlip7Total(session, upToRoundExclusive);
  if (ranked.length === 0) return [];
  const topScore = ranked[0].total;
  if (topScore < FLIP7_WIN_AT) return [];
  return ranked.filter((entry) => entry.total === topScore).map((e) => e.player);
}

export function toggleFlip7PlayerNumber(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  number: number,
): Record<string, Flip7RoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();
  if (entry.status !== 'active') return roundByPlayer;

  if (entry.numbers.includes(number)) {
    return {
      ...roundByPlayer,
      [playerId]: {
        ...entry,
        numbers: entry.numbers.filter((n) => n !== number),
      },
    };
  }

  if (!canFlip7TakeNumber(roundByPlayer, playerId, number)) {
    return roundByPlayer;
  }

  const numbers = [...entry.numbers, number].sort((a, b) => a - b);
  const achievedFlip7 = numbers.length >= FLIP7_MAX_NUMBERS;

  return {
    ...roundByPlayer,
    [playerId]: {
      ...entry,
      numbers,
      status: achievedFlip7 ? 'stood' : entry.status,
    },
  };
}

export function toggleFlip7PlayerModifier(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  modifier: Flip7Modifier,
): Record<string, Flip7RoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();
  if (entry.status !== 'active') return roundByPlayer;

  if (entry.modifiers.includes(modifier)) {
    return {
      ...roundByPlayer,
      [playerId]: {
        ...entry,
        modifiers: entry.modifiers.filter((m) => m !== modifier),
      },
    };
  }

  if (!canFlip7TakeModifier(roundByPlayer, playerId, modifier)) {
    return roundByPlayer;
  }

  return {
    ...roundByPlayer,
    [playerId]: {
      ...entry,
      modifiers: [...entry.modifiers, modifier],
    },
  };
}

export function getFlip7RoundEntryScore(entry: Flip7RoundEntry): number {
  if (entry.closedScore !== undefined) return entry.closedScore;
  return calculateFlip7RoundScore(entry);
}

export function closeFlip7RoundByPlayer(
  roundByPlayer: Record<string, Flip7RoundEntry>,
): Record<string, Flip7RoundEntry> {
  const closed: Record<string, Flip7RoundEntry> = {};
  for (const [playerId, entry] of Object.entries(roundByPlayer)) {
    closed[playerId] = {
      ...entry,
      closedScore: calculateFlip7RoundScore(entry),
    };
  }
  return closed;
}

export function setFlip7PlayerStatus(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  status: Flip7PlayerRoundStatus,
): Record<string, Flip7RoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();
  return {
    ...roundByPlayer,
    [playerId]: {
      ...entry,
      status,
      ...(status === 'active' ? { closedScore: undefined } : {}),
    },
  };
}

export function appendFlip7Round(session: Flip7Session): Flip7Session {
  const rounds = [...session.rounds];
  const closingIndex = session.activeRoundIndex;
  rounds[closingIndex] = closeFlip7RoundByPlayer(rounds[closingIndex] ?? {});
  rounds.push(emptyRoundByPlayer(session.players));

  return {
    ...session,
    rounds,
    activeRoundIndex: rounds.length - 1,
  };
}

export function createInProgressFlip7Match(
  session: Flip7Session,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: 'Flip 7',
    gameMode: 'flip7',
    sessionId: sessionId ?? null,
    settings: {
      maxRounds: null,
      maxPointsToWin: FLIP7_WIN_AT,
    },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: session.activeRoundIndex,
    roundScoringMode: {},
    status: 'in_progress',
    flip7Session: session,
    createdAt: now,
    updatedAt: now,
  };
}

export function createFinishedFlip7Match(session: Flip7Session): Match {
  const now = Date.now();
  const roundsData = [...session.rounds];
  roundsData[session.activeRoundIndex] = closeFlip7RoundByPlayer(
    roundsData[session.activeRoundIndex] ?? {},
  );

  const rounds = roundsData.map((roundByPlayer) => {
    const scores: Record<string, number> = {};
    for (const player of session.players) {
      const entry = roundByPlayer[player.id] ?? emptyFlip7RoundEntry();
      scores[player.id] = getFlip7RoundEntryScore(entry);
    }
    return scores;
  });

  return {
    id: createId(),
    name: 'Flip 7',
    gameMode: 'flip7',
    settings: {
      maxRounds: null,
      maxPointsToWin: FLIP7_WIN_AT,
    },
    players: session.players,
    rounds,
    roundBreakdowns: rounds.map(() => emptyRoundBreakdown()),
    activeRoundIndex: Math.max(0, session.rounds.length - 1),
    roundScoringMode: {},
    status: 'finished',
    createdAt: now,
    updatedAt: now,
  };
}

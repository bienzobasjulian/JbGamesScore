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

/** Limpia campos legacy de sesiones guardadas con el modo por turnos. */
export function normalizeFlip7Session(session: Flip7Session): Flip7Session {
  return {
    players: session.players,
    activeRoundIndex: session.activeRoundIndex,
    rounds: session.rounds,
  };
}

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
  if (entry.numbers.includes(number)) return true;
  return entry.numbers.length < FLIP7_MAX_NUMBERS;
}

export function canFlip7TakeModifier(
  _roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  modifier: Flip7Modifier,
): boolean {
  const entry = _roundByPlayer[playerId] ?? emptyFlip7RoundEntry();
  if (entry.modifiers.includes(modifier)) return true;
  return true;
}

export function getFlip7RoundNumberErrors(
  roundByPlayer: Record<string, Flip7RoundEntry>,
): string[] {
  const usage: Record<number, number> = {};

  for (const entry of Object.values(roundByPlayer)) {
    for (const number of entry.numbers) {
      usage[number] = (usage[number] ?? 0) + 1;
    }
  }

  const errors: string[] = [];
  for (const number of FLIP7_NUMBERS) {
    const used = usage[number] ?? 0;
    const max = getFlip7NumberDeckSize(number);
    if (used > max) {
      const maxLabel = max === 1 ? '1 carta' : `${max} cartas`;
      errors.push(
        `El ${number} está marcado ${used} veces entre todos (solo hay ${maxLabel})`,
      );
    }
  }

  return errors;
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
  return calculateFlip7EntryPoints(entry);
}

/** Puntos en vivo para clasificación (incluye ronda abierta). */
export function getFlip7LiveEntryScore(entry: Flip7RoundEntry): number {
  if (entry.closedScore !== undefined) return entry.closedScore;
  return calculateFlip7EntryPoints(entry);
}

export function getFlip7DisplayScore(entry: Flip7RoundEntry): number {
  if (entry.closedScore !== undefined) return entry.closedScore;
  return calculateFlip7EntryPoints(entry);
}

/** Una línea: suma → (×2) → modificadores → +15 Flip 7. */
export function formatFlip7Calculation(entry: Flip7RoundEntry): string {
  const numbers = [...entry.numbers].sort((a, b) => a - b);
  const hasX2 = entry.modifiers.includes('x2');
  const additiveMods = entry.modifiers.filter(
    (m): m is Exclude<Flip7Modifier, 'x2'> => m !== 'x2',
  );
  const flip7Bonus = hasFlip7Bonus(entry);
  const total = calculateFlip7EntryPoints(entry);

  if (
    numbers.length === 0 &&
    !hasX2 &&
    additiveMods.length === 0 &&
    !flip7Bonus
  ) {
    return '0 pts';
  }

  const parts: string[] = [];

  if (hasX2) {
    if (numbers.length > 1) {
      parts.push(`(${numbers.join(' + ')}) × 2`);
    } else if (numbers.length === 1) {
      parts.push(`${numbers[0]} × 2`);
    } else {
      parts.push('0 × 2');
    }
  } else if (numbers.length > 0) {
    parts.push(numbers.join(' + '));
  }

  for (const mod of additiveMods) {
    parts.push(mod);
  }

  if (flip7Bonus) {
    parts.push('+ 15');
  }

  const expr = parts.length > 0 ? parts.join(' ') : '0';
  return `${expr} = ${total} pts`;
}

export function isFlip7Eliminated(entry: Flip7RoundEntry): boolean {
  return entry.status === 'eliminated';
}

export function isFlip7Frozen(entry: Flip7RoundEntry): boolean {
  return entry.status === 'frozen';
}

export function getFlip7StatusLabel(status: Flip7PlayerRoundStatus): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'stood':
      return 'Plantado';
    case 'frozen':
      return 'Congelado';
    case 'eliminated':
      return 'Eliminado';
    default:
      return 'Activo';
  }
}

export function getFlip7EntryStripStatus(
  entry: Flip7RoundEntry,
  isTurn: boolean,
): string {
  if (entry.status === 'active' && isTurn) return 'Turno';
  if (isFlip7Frozen(entry)) return 'Congelado';
  if (entry.status === 'stood') return 'Plantado';
  if (isFlip7Eliminated(entry)) return 'Eliminado';
  return 'Activo';
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
  return formatFlip7Calculation(entry);
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
  live = false,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(upToRoundExclusive, session.rounds.length));
  for (let i = 0; i < limit; i++) {
    const entry = session.rounds[i][playerId] ?? emptyFlip7RoundEntry();
    total += live
      ? getFlip7LiveEntryScore(entry)
      : getFlip7RoundEntryScore(entry);
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
  live = false,
): { player: Player; total: number }[] {
  return session.players
    .map((player) => ({
      player,
      total: getFlip7PlayerTotal(session, player.id, upToRoundExclusive, live),
    }))
    .sort((a, b) => b.total - a.total);
}

export function hasFlip7GameOver(
  session: Flip7Session,
  upToRoundExclusive: number = session.rounds.length,
  live = false,
): boolean {
  return session.players.some(
    (player) =>
      getFlip7PlayerTotal(session, player.id, upToRoundExclusive, live) >=
      FLIP7_WIN_AT,
  );
}

export function getFlip7GameOverWinners(
  session: Flip7Session,
  upToRoundExclusive: number = session.rounds.length,
  live = false,
): Player[] {
  const ranked = sortPlayersByFlip7Total(session, upToRoundExclusive, live);
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

  if (entry.numbers.includes(number)) {
    return {
      ...roundByPlayer,
      [playerId]: {
        ...entry,
        numbers: entry.numbers.filter((n) => n !== number),
        closedScore: undefined,
      },
    };
  }

  if (!canFlip7TakeNumber(roundByPlayer, playerId, number)) {
    return roundByPlayer;
  }

  const numbers = [...entry.numbers, number].sort((a, b) => a - b);

  return {
    ...roundByPlayer,
    [playerId]: {
      ...entry,
      numbers,
      closedScore: undefined,
    },
  };
}

export function toggleFlip7PlayerModifier(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
  modifier: Flip7Modifier,
): Record<string, Flip7RoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7RoundEntry();

  if (entry.modifiers.includes(modifier)) {
    return {
      ...roundByPlayer,
      [playerId]: {
        ...entry,
        modifiers: entry.modifiers.filter((m) => m !== modifier),
        closedScore: undefined,
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
      closedScore: undefined,
    },
  };
}

export function clearFlip7PlayerRound(
  roundByPlayer: Record<string, Flip7RoundEntry>,
  playerId: string,
): Record<string, Flip7RoundEntry> {
  return {
    ...roundByPlayer,
    [playerId]: emptyFlip7RoundEntry(),
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
      closedScore: calculateFlip7EntryPoints(entry),
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
  const normalized = normalizeFlip7Session(session);
  const rounds = [...normalized.rounds];
  const closingIndex = normalized.activeRoundIndex;
  rounds[closingIndex] = closeFlip7RoundByPlayer(rounds[closingIndex] ?? {});
  rounds.push(emptyRoundByPlayer(normalized.players));

  return {
    ...normalized,
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

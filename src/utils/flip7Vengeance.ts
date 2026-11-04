import {
  Flip7VengeanceModifier,
  Flip7VengeanceRoundEntry,
  Flip7VengeanceSession,
  Flip7VengeanceSpecial,
  Match,
  Player,
} from '../types';
import type { HowToPlayItem } from '../types/howToPlay';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const FLIP7_VENGEANCE_MIN_PLAYERS = 3;
export const FLIP7_VENGEANCE_WIN_AT = 200;
export const FLIP7_VENGEANCE_BONUS = 15;
export const FLIP7_VENGEANCE_MAX_NUMBERS = 7;

export const FLIP7_VENGEANCE_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
] as const;

export const FLIP7_VENGEANCE_MODIFIERS: Flip7VengeanceModifier[] = [
  '-2',
  '-4',
  '-6',
  '-8',
  '-10',
  '÷2',
];

export const FLIP7_VENGEANCE_SPECIALS: {
  id: Flip7VengeanceSpecial;
  label: string;
}[] = [
  { id: 'zero', label: 'The Zero' },
  { id: 'unlucky7', label: 'Unlucky 7' },
  { id: 'lucky13', label: 'Lucky 13' },
];

export const FLIP7_VENGEANCE_HOW_TO_PLAY = [
  `Gana quien tenga más puntos cuando alguien llega a ${FLIP7_VENGEANCE_WIN_AT} al cerrar una ronda.`,
  'El mazo tiene trece 13, doce 12… hasta un solo 1. Si repites un número, te pasas y no puntúas. Lucky 13 permite dos 13 sin pasarte.',
  'Siete números distintos son Flip 7: la ronda se corta y sumas 15. Lucky 13 vale 13 por sí sola y permite otro 13. The Zero deja la ronda a 0 salvo que hagas Flip 7. Unlucky 7 descarta el resto y la ronda vale 0.',
  'Primero se suman los números, luego ÷2 parte esa suma, después se restan −2, −4, −6, −8 y −10, y al final el +15 del Flip 7.',
  'Las cartas de acción se resuelven en la mesa. Aquí solo se anota lo que queda delante de cada jugador.',
].join('\n\n');

export const FLIP7_VENGEANCE_HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  {
    type: 'heading',
    title: 'Cartas especiales',
    body: 'No cuentan como número para el Flip 7.',
  },
  {
    type: 'term',
    term: 'The Zero',
    definition: 'La ronda vale 0, salvo que consigas Flip 7.',
  },
  {
    type: 'term',
    term: 'Unlucky 7',
    definition: 'Descartas el resto de cartas. La ronda vale 0.',
  },
  {
    type: 'term',
    term: 'Lucky 13',
    definition: 'Vale 13 puntos y puedes tener otro 13 sin pasarte.',
  },
  {
    type: 'heading',
    title: 'Cartas de acción',
    body: 'Se juegan sobre otro jugador. No se anotan: al cerrar la ronda marcas el resultado.',
  },
  {
    type: 'term',
    term: 'Just One More!',
    definition: 'Obliga a un jugador a recibir otra carta.',
  },
  {
    type: 'term',
    term: 'Swap',
    definition: 'Intercambia cartas visibles entre jugadores.',
  },
  {
    type: 'term',
    term: 'Steal',
    definition: 'Roba una carta visible de otro jugador.',
  },
  {
    type: 'term',
    term: 'Discard',
    definition: 'Obliga a un jugador a descartar una carta.',
  },
  {
    type: 'term',
    term: 'Flip Four!',
    definition: 'Un jugador recibe cuatro cartas seguidas.',
  },
  {
    type: 'heading',
    title: 'Modo brutal',
    body: 'Se elige al crear la partida. El total de la ronda puede quedar en negativo. Si haces Flip 7 puedes quitarle 15 puntos a otro jugador, además de tu +15.',
  },
];

export function emptyFlip7VengeanceRoundEntry(): Flip7VengeanceRoundEntry {
  return {
    numbers: [],
    modifiers: [],
    specials: [],
    flip7StealFromPlayerId: null,
  };
}

function emptyRoundByPlayer(
  players: Player[],
): Record<string, Flip7VengeanceRoundEntry> {
  const byPlayer: Record<string, Flip7VengeanceRoundEntry> = {};
  for (const player of players) {
    byPlayer[player.id] = emptyFlip7VengeanceRoundEntry();
  }
  return byPlayer;
}

export function createFlip7VengeanceSession(
  players: Player[],
  brutal = false,
): Flip7VengeanceSession {
  return {
    players,
    activeRoundIndex: 0,
    brutal,
    rounds: [emptyRoundByPlayer(players)],
  };
}

export function getFlip7VengeanceNumberDeckSize(number: number): number {
  return number;
}

export function countFlip7VengeanceNumber(
  entry: Flip7VengeanceRoundEntry,
  number: number,
): number {
  return entry.numbers.filter((n) => n === number).length;
}

export function hasFlip7VengeanceBonus(entry: Flip7VengeanceRoundEntry): boolean {
  if (entry.specials.includes('unlucky7')) return false;
  return new Set(entry.numbers).size >= FLIP7_VENGEANCE_MAX_NUMBERS;
}

/** Lucky 13 vale 13 por sí sola, además del otro 13 que permite. */
function scoredNumbers(entry: Flip7VengeanceRoundEntry): number[] {
  const numbers = [...entry.numbers];
  if (entry.specials.includes('lucky13')) numbers.push(13);
  return numbers.sort((a, b) => a - b);
}

function modifierPenalty(entry: Flip7VengeanceRoundEntry): number {
  return entry.modifiers
    .filter((m) => m !== '÷2')
    .reduce((sum, m) => sum + Number(m.slice(1)), 0);
}

/** Puntos propios de la ronda, sin el robo de 15 del modo brutal. */
export function calculateFlip7VengeanceEntryPoints(
  entry: Flip7VengeanceRoundEntry,
  brutal: boolean,
): number {
  if (entry.specials.includes('unlucky7')) return 0;

  const flip7 = hasFlip7VengeanceBonus(entry);
  if (entry.specials.includes('zero') && !flip7) return 0;

  const numberSum = scoredNumbers(entry).reduce((sum, n) => sum + n, 0);
  const halved = entry.modifiers.includes('÷2')
    ? Math.floor(numberSum / 2)
    : numberSum;
  const total = halved - modifierPenalty(entry) + (flip7 ? FLIP7_VENGEANCE_BONUS : 0);
  return brutal ? total : Math.max(0, total);
}

export function getFlip7VengeanceRoundScore(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  playerId: string,
  brutal: boolean,
): number {
  const entry = roundByPlayer[playerId] ?? emptyFlip7VengeanceRoundEntry();
  if (entry.closedScore !== undefined) return entry.closedScore;

  let total = calculateFlip7VengeanceEntryPoints(entry, brutal);
  if (brutal) {
    for (const [otherId, other] of Object.entries(roundByPlayer)) {
      if (otherId === playerId) continue;
      if (!hasFlip7VengeanceBonus(other)) continue;
      if (other.flip7StealFromPlayerId === playerId) {
        total -= FLIP7_VENGEANCE_BONUS;
      }
    }
  }
  return brutal ? total : Math.max(0, total);
}

export function formatFlip7VengeanceCalculation(
  entry: Flip7VengeanceRoundEntry,
  brutal: boolean,
): string {
  if (entry.specials.includes('unlucky7')) return 'Unlucky 7 = 0 pts';
  const flip7 = hasFlip7VengeanceBonus(entry);
  if (entry.specials.includes('zero') && !flip7) return 'The Zero = 0 pts';

  const numbers = scoredNumbers(entry);
  const penalties = entry.modifiers.filter((m) => m !== '÷2');
  const total = calculateFlip7VengeanceEntryPoints(entry, brutal);

  if (numbers.length === 0 && penalties.length === 0 && !flip7) {
    return '0 pts';
  }

  const parts: string[] = [];
  if (entry.modifiers.includes('÷2')) {
    parts.push(
      numbers.length > 1
        ? `(${numbers.join(' + ')}) ÷ 2`
        : `${numbers[0] ?? 0} ÷ 2`,
    );
  } else if (numbers.length > 0) {
    parts.push(numbers.join(' + '));
  }

  for (const mod of penalties) {
    parts.push(mod);
  }
  if (flip7) parts.push('+ 15');

  const expr = parts.length > 0 ? parts.join(' ') : '0';
  return `${expr} = ${total} pts`;
}

export function getFlip7VengeanceRoundNumberErrors(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
): string[] {
  const usage: Record<number, number> = {};
  for (const entry of Object.values(roundByPlayer)) {
    for (const number of entry.numbers) {
      usage[number] = (usage[number] ?? 0) + 1;
    }
  }

  const errors: string[] = [];
  for (const number of FLIP7_VENGEANCE_NUMBERS) {
    const used = usage[number] ?? 0;
    const max = getFlip7VengeanceNumberDeckSize(number);
    if (used > max) {
      errors.push(
        `El ${number} está marcado ${used} veces entre todos (solo hay ${max} cartas)`,
      );
    }
  }
  return errors;
}

export function getFlip7VengeancePlayerTotal(
  session: Flip7VengeanceSession,
  playerId: string,
  upToRoundExclusive: number = session.rounds.length,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(upToRoundExclusive, session.rounds.length));
  for (let i = 0; i < limit; i++) {
    total += getFlip7VengeanceRoundScore(
      session.rounds[i] ?? {},
      playerId,
      session.brutal,
    );
  }
  return total;
}

export function sortPlayersByFlip7VengeanceTotal(
  session: Flip7VengeanceSession,
  upToRoundExclusive: number = session.rounds.length,
): { player: Player; total: number }[] {
  return session.players
    .map((player) => ({
      player,
      total: getFlip7VengeancePlayerTotal(session, player.id, upToRoundExclusive),
    }))
    .sort((a, b) => b.total - a.total);
}

export function hasFlip7VengeanceGameOver(
  session: Flip7VengeanceSession,
  upToRoundExclusive: number = session.rounds.length,
): boolean {
  return session.players.some(
    (player) =>
      getFlip7VengeancePlayerTotal(session, player.id, upToRoundExclusive) >=
      FLIP7_VENGEANCE_WIN_AT,
  );
}

export function getFlip7VengeanceGameOverWinners(
  session: Flip7VengeanceSession,
  upToRoundExclusive: number = session.rounds.length,
): Player[] {
  const ranked = sortPlayersByFlip7VengeanceTotal(session, upToRoundExclusive);
  if (ranked.length === 0) return [];
  const topScore = ranked[0].total;
  if (topScore < FLIP7_VENGEANCE_WIN_AT) return [];
  return ranked.filter((entry) => entry.total === topScore).map((e) => e.player);
}

function maxCopies(entry: Flip7VengeanceRoundEntry, number: number): number {
  if (number === 13 && entry.specials.includes('lucky13')) return 2;
  return 1;
}

export function cycleFlip7VengeancePlayerNumber(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  playerId: string,
  number: number,
): Record<string, Flip7VengeanceRoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7VengeanceRoundEntry();
  const count = countFlip7VengeanceNumber(entry, number);
  const cap = maxCopies(entry, number);
  const nextCount = count >= cap ? 0 : count + 1;
  const others = entry.numbers.filter((n) => n !== number);
  const numbers = [...others, ...Array.from({ length: nextCount }, () => number)].sort(
    (a, b) => a - b,
  );

  if (nextCount > count) {
    const distinct = new Set(numbers).size;
    if (distinct > FLIP7_VENGEANCE_MAX_NUMBERS) return roundByPlayer;
  }

  return {
    ...roundByPlayer,
    [playerId]: {
      ...entry,
      numbers,
      closedScore: undefined,
      flip7StealFromPlayerId: hasFlip7VengeanceBonus({
        ...entry,
        numbers,
      })
        ? entry.flip7StealFromPlayerId
        : null,
    },
  };
}

export function toggleFlip7VengeancePlayerModifier(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  playerId: string,
  modifier: Flip7VengeanceModifier,
): Record<string, Flip7VengeanceRoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7VengeanceRoundEntry();
  const modifiers = entry.modifiers.includes(modifier)
    ? entry.modifiers.filter((m) => m !== modifier)
    : [...entry.modifiers, modifier];
  return {
    ...roundByPlayer,
    [playerId]: { ...entry, modifiers, closedScore: undefined },
  };
}

export function toggleFlip7VengeancePlayerSpecial(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  playerId: string,
  special: Flip7VengeanceSpecial,
): Record<string, Flip7VengeanceRoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7VengeanceRoundEntry();
  const has = entry.specials.includes(special);
  let specials = has
    ? entry.specials.filter((s) => s !== special)
    : [...entry.specials, special];
  let numbers = entry.numbers;

  if (special === 'lucky13' && has) {
    const thirteens = numbers.filter((n) => n === 13).slice(0, 1);
    numbers = [...numbers.filter((n) => n !== 13), ...thirteens].sort(
      (a, b) => a - b,
    );
  }

  const next: Flip7VengeanceRoundEntry = {
    ...entry,
    specials,
    numbers,
    closedScore: undefined,
  };
  if (!hasFlip7VengeanceBonus(next)) {
    next.flip7StealFromPlayerId = null;
  }
  return { ...roundByPlayer, [playerId]: next };
}

export function setFlip7VengeanceStealTarget(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  playerId: string,
  targetId: string | null,
): Record<string, Flip7VengeanceRoundEntry> {
  const entry = roundByPlayer[playerId] ?? emptyFlip7VengeanceRoundEntry();
  if (!hasFlip7VengeanceBonus(entry)) return roundByPlayer;
  return {
    ...roundByPlayer,
    [playerId]: {
      ...entry,
      flip7StealFromPlayerId:
        entry.flip7StealFromPlayerId === targetId ? null : targetId,
      closedScore: undefined,
    },
  };
}

export function clearFlip7VengeancePlayerRound(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  playerId: string,
): Record<string, Flip7VengeanceRoundEntry> {
  return {
    ...roundByPlayer,
    [playerId]: emptyFlip7VengeanceRoundEntry(),
  };
}

function closeRound(
  roundByPlayer: Record<string, Flip7VengeanceRoundEntry>,
  brutal: boolean,
): Record<string, Flip7VengeanceRoundEntry> {
  const closed: Record<string, Flip7VengeanceRoundEntry> = {};
  for (const playerId of Object.keys(roundByPlayer)) {
    const entry = roundByPlayer[playerId] ?? emptyFlip7VengeanceRoundEntry();
    closed[playerId] = {
      ...entry,
      closedScore: getFlip7VengeanceRoundScore(roundByPlayer, playerId, brutal),
    };
  }
  return closed;
}

export function appendFlip7VengeanceRound(
  session: Flip7VengeanceSession,
): Flip7VengeanceSession {
  const rounds = [...session.rounds];
  rounds[session.activeRoundIndex] = closeRound(
    rounds[session.activeRoundIndex] ?? {},
    session.brutal,
  );
  rounds.push(emptyRoundByPlayer(session.players));
  return { ...session, rounds, activeRoundIndex: rounds.length - 1 };
}

export function createInProgressFlip7VengeanceMatch(
  session: Flip7VengeanceSession,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: 'Flip7 Venganza',
    gameMode: 'flip7_vengeance',
    sessionId: sessionId ?? null,
    settings: {
      maxRounds: null,
      maxPointsToWin: FLIP7_VENGEANCE_WIN_AT,
    },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: session.activeRoundIndex,
    roundScoringMode: {},
    status: 'in_progress',
    flip7VengeanceSession: session,
    flip7VengeanceBrutal: session.brutal,
    createdAt: now,
    updatedAt: now,
  };
}

export function createFinishedFlip7VengeanceMatch(
  session: Flip7VengeanceSession,
): Match {
  const now = Date.now();
  const roundsData = [...session.rounds];
  roundsData[session.activeRoundIndex] = closeRound(
    roundsData[session.activeRoundIndex] ?? {},
    session.brutal,
  );

  const rounds = roundsData.map((roundByPlayer) => {
    const scores: Record<string, number> = {};
    for (const player of session.players) {
      scores[player.id] = getFlip7VengeanceRoundScore(
        roundByPlayer,
        player.id,
        session.brutal,
      );
    }
    return scores;
  });

  return {
    id: createId(),
    name: 'Flip7 Venganza',
    gameMode: 'flip7_vengeance',
    settings: {
      maxRounds: null,
      maxPointsToWin: FLIP7_VENGEANCE_WIN_AT,
    },
    players: session.players,
    rounds,
    roundBreakdowns: rounds.map(() => emptyRoundBreakdown()),
    activeRoundIndex: Math.max(0, session.rounds.length - 1),
    roundScoringMode: {},
    status: 'finished',
    flip7VengeanceBrutal: session.brutal,
    createdAt: now,
    updatedAt: now,
  };
}

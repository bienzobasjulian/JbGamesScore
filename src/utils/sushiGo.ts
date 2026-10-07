import {
  Match,
  Player,
  RoundScores,
  SushiGoRoundEntry,
  SushiGoSession,
} from '../types';
import type { HowToPlaySection } from '../types/howToPlay';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const SUSHI_GO_TOTAL_ROUNDS = 3;
export const SUSHI_GO_MIN_PLAYERS = 2;
export const SUSHI_GO_MAX_PLAYERS = 5;
export const SUSHI_GO_RESULT_ROUND_LABELS = ['1', '2', '3', 'Postre'];

const GYOZA_POINTS = [0, 1, 3, 6, 10, 15];

export const SUSHI_GO_HOW_TO_PLAY_SECTIONS: HowToPlaySection[] = [
  {
    title: 'Preparación',
    body: 'Baraja las cartas y reparte una mano. El resto queda boca abajo en el centro. Las manos se ocultan.',
    items: [
      {
        type: 'table',
        headers: ['Jugadores', 'Cartas a repartir'],
        align: 'score',
        rows: [
          ['2', '10'],
          ['3', '9'],
          ['4', '8'],
          ['5', '7'],
        ],
      },
    ],
  },
  {
    title: 'La ronda',
    terms: [
      {
        term: 'Tres rondas',
        definition:
          'La partida dura tres rondas. En cada una se elige una carta a la vez, se revela y se pasa la mano.',
      },
      {
        term: 'Elegir',
        definition:
          'Todos eligen a la vez una carta de su mano y la ponen boca abajo delante de sí. Luego se revelan a la vez.',
      },
      {
        term: 'Pasar',
        definition:
          'Después de revelar, cada uno pasa el resto de su mano, boca abajo, al jugador de la izquierda. La siguiente jugada empieza con esa mano nueva y una carta menos.',
      },
      {
        term: 'Agrupar',
        definition:
          'Las cartas reveladas se quedan delante hasta el final de la ronda, cuando se puntúan. Conviene juntar las del mismo tipo.',
      },
      {
        term: 'Última carta',
        definition:
          'Cuando solo queda una carta en la mano, se pone boca arriba con las demás. A veces es poca cosa; a veces es justo la que le faltaba al rival.',
      },
    ],
  },
  {
    title: 'Cartas y Puntuación',
    items: [
      {
        type: 'heading',
        title: 'Wasabi',
        body: 'No puntúa solo. Si juegas un nigiri de calamar, de salmón o de tortilla y ya tienes un wasabi delante, ese nigiri se pone encima y su valor se triplica. Puedes tener varios wasabi, pero solo un nigiri encima de cada uno.',
      },
      {
        type: 'heading',
        title: 'Palillos',
        body: 'No dan puntos. Si los tienes delante, en un turno posterior eliges la primera carta con normalidad. Antes de que los demás revelen, di «¡Sushi Go!» y pon una segunda carta boca abajo. Después reveláis todos. Antes de pasar las manos, los palillos vuelven a tu mano. Puedes tener varios, pero solo usar unos por turno.',
      },
      {
        type: 'heading',
        title: 'Maki',
        body: 'Se suman los símbolos de rollo de las cartas, no el número de cartas. Quien más rollos tenga gana 6 puntos. El segundo, 3. Si hay empate, se reparten esos puntos a partes iguales y se ignora el resto. Si empatan el primer puesto, no se dan puntos de segundo.',
      },
      {
        type: 'note',
        text: 'Ejemplo: Carla 5 rollos, Pablo 3, Ana 3 y Luisa 2. Carla gana 6. Pablo y Ana se reparten los 3 del segundo puesto (1 cada uno). Luisa no puntúa.',
      },
      {
        type: 'heading',
        title: 'Tempura',
        body: 'Cada pareja vale 5 puntos. Una carta suelta no puntúa. Se pueden anotar varias parejas en la misma ronda.',
      },
      {
        type: 'heading',
        title: 'Sashimi',
        body: 'Cada trío vale 10 puntos. Una carta o una pareja no puntúan. Se pueden anotar varios tríos en la misma ronda.',
      },
      {
        type: 'heading',
        title: 'Gyoza',
        body: 'Cuantas más cartas, más puntos. A partir de 5 ya no sube.',
      },
      {
        type: 'table',
        headers: ['Gyoza', 'Puntos'],
        align: 'score',
        rows: [
          ['1', '1'],
          ['2', '3'],
          ['3', '6'],
          ['4', '10'],
          ['5 o más', '15'],
        ],
      },
      {
        type: 'heading',
        title: 'Nigiri',
        body: 'Cada nigiri puntúa por separado. Encima de un wasabi vale el triple.',
      },
      {
        type: 'table',
        headers: ['Nigiri', 'Normal', 'Con wasabi'],
        align: 'score',
        rows: [
          ['Calamar', '3', '9'],
          ['Salmón', '2', '6'],
          ['Tortilla', '1', '3'],
        ],
      },
      {
        type: 'heading',
        title: 'Pudin',
        body: 'Se queda delante hasta el final de la partida. Tras la tercera ronda se ignoran las cartas que queden en el mazo y se puntúan los pudines de todas las rondas. Quien más tenga gana 6 puntos. Quien menos tenga, aunque sean cero, pierde 6. Si hay empate, se reparten a partes iguales y se ignora el resto. Si todo el mundo tiene los mismos, nadie gana ni pierde. Con 2 jugadores no se pierden puntos por tener menos: solo se dan 6 a quien tenga más.',
      },
      {
        type: 'note',
        text: 'Ejemplo: Carla 4, Pablo 3, Luisa 0 y Ana 0. Carla gana 6. Luisa y Ana se reparten los −6 y cada una pierde 3. Pablo no suma ni resta por el postre.',
      },
    ],
  },
  {
    title: 'Nueva ronda',
    terms: [
      {
        term: 'Anotar',
        definition: 'Se apuntan los puntos de la ronda que acaba de jugarse.',
      },
      {
        term: 'Descarte',
        definition:
          'Las cartas jugadas van al descarte, salvo los pudines: se quedan delante hasta el final de la partida.',
      },
      {
        term: 'Nueva mano',
        definition:
          'Del mazo se reparte otra mano, con el mismo número de cartas que al principio.',
      },
    ],
  },
  {
    title: 'Ganador',
    body: 'Gana quien más puntos lleve tras tres rondas y el postre. Si hay empate a puntos, gana quien tenga más cartas de pudin.',
  },
  {
    title: 'Variantes',
    items: [
      {
        type: 'heading',
        title: 'Pasar a ambos lados',
        body: 'En las rondas 1 y 3 las cartas van a la izquierda. En la ronda 2, a la derecha. Puedes activarla en la partida; no cambia la puntuación.',
      },
      {
        type: 'heading',
        title: 'Dos jugadores con comensal ficticio',
        body: 'Se reparte como si hubiera 3 jugadores: tres manos de 9 cartas. La mano del comensal ficticio se deja boca abajo entre los dos. Se sortea quién lo controla primero.',
      },
      {
        type: 'note',
        text: 'Quien controla al ficticio roba la carta superior de su pila y la añade a su mano. Luego elige una carta para sí y otra para el ficticio. El rival elige una, como siempre.',
      },
      {
        type: 'note',
        text: 'Se revelan las cartas y se intercambian las manos, dejando la pila del ficticio en medio. El otro jugador pasa a controlarlo: roba la carta superior y elige una para él y otra para el ficticio.',
      },
      {
        type: 'note',
        text: 'Se alterna el control hasta jugar todas las cartas. Se juegan tres rondas y se puntúa con las reglas normales, incluida la de pudin a dos jugadores.',
      },
    ],
  },
];

export function sushiGoHandSize(playerCount: number): number {
  switch (playerCount) {
    case 2:
      return 10;
    case 3:
      return 9;
    case 4:
      return 8;
    case 5:
      return 7;
    default:
      return playerCount < 2 ? 10 : 7;
  }
}

export function sushiGoPassDirection(
  roundIndex: number,
  alternatePassDirection: boolean,
): 'izquierda' | 'derecha' {
  if (alternatePassDirection && roundIndex === 1) return 'derecha';
  return 'izquierda';
}

export function emptySushiGoRoundEntry(): SushiGoRoundEntry {
  return {
    makiRolls: 0,
    tempura: 0,
    sashimi: 0,
    gyoza: 0,
    nigiriSquid: 0,
    nigiriSquidWasabi: 0,
    nigiriSalmon: 0,
    nigiriSalmonWasabi: 0,
    nigiriEgg: 0,
    nigiriEggWasabi: 0,
    pudding: 0,
  };
}

function clampInt(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.floor(value)));
}

export function clampSushiGoRoundEntry(
  entry: Partial<SushiGoRoundEntry> | null | undefined,
  handSize: number,
): SushiGoRoundEntry {
  const maxCards = Math.max(0, handSize);
  const source = entry ?? {};
  const nigiriSquid = clampInt(source.nigiriSquid ?? 0, maxCards);
  const nigiriSalmon = clampInt(source.nigiriSalmon ?? 0, maxCards);
  const nigiriEgg = clampInt(source.nigiriEgg ?? 0, maxCards);
  return {
    makiRolls: clampInt(source.makiRolls ?? 0, maxCards * 3),
    tempura: clampInt(source.tempura ?? 0, maxCards),
    sashimi: clampInt(source.sashimi ?? 0, maxCards),
    gyoza: clampInt(source.gyoza ?? 0, maxCards),
    nigiriSquid,
    nigiriSquidWasabi: clampInt(source.nigiriSquidWasabi ?? 0, nigiriSquid),
    nigiriSalmon,
    nigiriSalmonWasabi: clampInt(source.nigiriSalmonWasabi ?? 0, nigiriSalmon),
    nigiriEgg,
    nigiriEggWasabi: clampInt(source.nigiriEggWasabi ?? 0, nigiriEgg),
    pudding: clampInt(source.pudding ?? 0, maxCards),
  };
}

export function isSushiGoEntryEmpty(entry: SushiGoRoundEntry): boolean {
  return (
    entry.makiRolls === 0 &&
    entry.tempura === 0 &&
    entry.sashimi === 0 &&
    entry.gyoza === 0 &&
    entry.nigiriSquid === 0 &&
    entry.nigiriSalmon === 0 &&
    entry.nigiriEgg === 0 &&
    entry.pudding === 0
  );
}

export function scoreTempura(count: number): number {
  return Math.floor(Math.max(0, count) / 2) * 5;
}

export function scoreSashimi(count: number): number {
  return Math.floor(Math.max(0, count) / 3) * 10;
}

export function scoreGyoza(count: number): number {
  const n = Math.max(0, Math.floor(count));
  return GYOZA_POINTS[Math.min(n, GYOZA_POINTS.length - 1)];
}

export function scoreNigiri(
  count: number,
  onWasabi: number,
  base: number,
): number {
  const total = Math.max(0, Math.floor(count));
  const dipped = Math.min(Math.max(0, Math.floor(onWasabi)), total);
  const plain = total - dipped;
  return plain * base + dipped * base * 3;
}

export function scoreSushiGoNigiri(entry: SushiGoRoundEntry): number {
  return (
    scoreNigiri(entry.nigiriSquid, entry.nigiriSquidWasabi, 3) +
    scoreNigiri(entry.nigiriSalmon, entry.nigiriSalmonWasabi, 2) +
    scoreNigiri(entry.nigiriEgg, entry.nigiriEggWasabi, 1)
  );
}

/** Reparte puntos enteros e ignora el resto (también con cifras negativas). */
function sharePoints(points: number, groupSize: number): number {
  if (groupSize <= 0) return 0;
  return Math.trunc(points / groupSize);
}

export function scoreMakiRolls(rolls: number[]): number[] {
  const scores = rolls.map(() => 0);
  if (rolls.length === 0) return scores;

  const max = Math.max(...rolls);
  const first = rolls
    .map((value, index) => (value === max ? index : -1))
    .filter((index) => index >= 0);
  const firstShare = sharePoints(6, first.length);
  for (const index of first) scores[index] = firstShare;
  if (first.length > 1) return scores;

  const rest = rolls.filter((value) => value !== max);
  if (rest.length === 0) return scores;
  const secondValue = Math.max(...rest);
  const second = rolls
    .map((value, index) => (value === secondValue ? index : -1))
    .filter((index) => index >= 0);
  const secondShare = sharePoints(3, second.length);
  for (const index of second) scores[index] = secondShare;
  return scores;
}

export function scorePuddingCards(
  counts: number[],
  playerCount: number,
): number[] {
  const scores = counts.map(() => 0);
  if (counts.length === 0) return scores;
  if (new Set(counts).size <= 1) return scores;

  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const first = counts
    .map((value, index) => (value === max ? index : -1))
    .filter((index) => index >= 0);
  const firstShare = sharePoints(6, first.length);
  for (const index of first) scores[index] = firstShare;
  if (playerCount <= 2) return scores;

  const last = counts
    .map((value, index) => (value === min ? index : -1))
    .filter((index) => index >= 0);
  const penalty = sharePoints(-6, last.length);
  for (const index of last) scores[index] = penalty;
  return scores;
}

export type SushiGoPersonalBreakdown = {
  tempura: number;
  sashimi: number;
  gyoza: number;
  nigiri: number;
  personal: number;
};

export function getSushiGoPersonalBreakdown(
  entry: SushiGoRoundEntry,
): SushiGoPersonalBreakdown {
  const tempura = scoreTempura(entry.tempura);
  const sashimi = scoreSashimi(entry.sashimi);
  const gyoza = scoreGyoza(entry.gyoza);
  const nigiri = scoreSushiGoNigiri(entry);
  return {
    tempura,
    sashimi,
    gyoza,
    nigiri,
    personal: tempura + sashimi + gyoza + nigiri,
  };
}

export type SushiGoRoundScoreRow = {
  playerId: string;
  rolls: number;
  personal: SushiGoPersonalBreakdown;
  maki: number;
  total: number;
};

export function getSushiGoRoundScoreList(
  players: Player[],
  round: Record<string, SushiGoRoundEntry> | undefined,
): SushiGoRoundScoreRow[] {
  const entries = players.map(
    (player) => round?.[player.id] ?? emptySushiGoRoundEntry(),
  );
  const anyCard = entries.some((entry) => !isSushiGoEntryEmpty(entry));
  const maki = anyCard
    ? scoreMakiRolls(entries.map((entry) => entry.makiRolls))
    : entries.map(() => 0);

  return players.map((player, index) => {
    const personal = getSushiGoPersonalBreakdown(entries[index]);
    return {
      playerId: player.id,
      rolls: entries[index].makiRolls,
      personal,
      maki: maki[index],
      total: personal.personal + maki[index],
    };
  });
}

export type SushiGoPuddingRow = {
  playerId: string;
  count: number;
  points: number;
};

/** Pudines ya jugados antes de esta ronda. Se conservan delante del jugador. */
export function getSushiGoPuddingBeforeRound(
  session: SushiGoSession,
  playerId: string,
  roundIndex: number,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(roundIndex, session.rounds.length));
  for (let index = 0; index < limit; index++) {
    total += session.rounds[index]?.[playerId]?.pudding ?? 0;
  }
  return total;
}

export function getSushiGoPuddingScoreList(
  session: SushiGoSession,
): SushiGoPuddingRow[] {
  const counts = session.players.map((player) =>
    session.rounds.reduce(
      (sum, round) => sum + (round[player.id]?.pudding ?? 0),
      0,
    ),
  );
  const points = scorePuddingCards(counts, session.players.length);
  return session.players.map((player, index) => ({
    playerId: player.id,
    count: counts[index],
    points: points[index],
  }));
}

export function getSushiGoCardTotals(
  session: SushiGoSession,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const player of session.players) totals[player.id] = 0;
  for (const round of session.rounds) {
    for (const row of getSushiGoRoundScoreList(session.players, round)) {
      totals[row.playerId] += row.total;
    }
  }
  return totals;
}

export type SushiGoStanding = {
  player: Player;
  cards: number;
  puddingCount: number;
  puddingPoints: number;
  total: number;
};

export function getSushiGoStandings(session: SushiGoSession): SushiGoStanding[] {
  const cards = getSushiGoCardTotals(session);
  const pudding = getSushiGoPuddingScoreList(session);
  const rows = session.players.map((player, index) => ({
    player,
    cards: cards[player.id] ?? 0,
    puddingCount: pudding[index].count,
    puddingPoints: pudding[index].points,
    total: (cards[player.id] ?? 0) + pudding[index].points,
  }));
  rows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return b.puddingCount - a.puddingCount;
  });
  return rows;
}

export function rankSushiGoStandings(
  rows: SushiGoStanding[],
): { standing: SushiGoStanding; rank: number }[] {
  let rank = 0;
  return rows.map((standing, index) => {
    const prev = rows[index - 1];
    const tied =
      prev != null &&
      prev.total === standing.total &&
      prev.puddingCount === standing.puddingCount;
    if (!tied) rank = index + 1;
    return { standing, rank };
  });
}

export function createSushiGoSession(players: Player[]): SushiGoSession {
  const rounds = Array.from({ length: SUSHI_GO_TOTAL_ROUNDS }, () => {
    const byPlayer: Record<string, SushiGoRoundEntry> = {};
    for (const player of players) {
      byPlayer[player.id] = emptySushiGoRoundEntry();
    }
    return byPlayer;
  });

  return {
    players,
    activeRoundIndex: 0,
    alternatePassDirection: false,
    rounds,
  };
}

export function normalizeSushiGoSession(raw: SushiGoSession): SushiGoSession {
  const players = Array.isArray(raw?.players) ? raw.players : [];
  const handSize = sushiGoHandSize(players.length);
  const rounds = Array.from({ length: SUSHI_GO_TOTAL_ROUNDS }, (_, index) => {
    const source = raw?.rounds?.[index] ?? {};
    const byPlayer: Record<string, SushiGoRoundEntry> = {};
    for (const player of players) {
      byPlayer[player.id] = clampSushiGoRoundEntry(source[player.id], handSize);
    }
    return byPlayer;
  });
  const active = Number.isFinite(raw?.activeRoundIndex)
    ? Math.floor(raw.activeRoundIndex)
    : 0;

  return {
    players,
    activeRoundIndex: Math.min(
      SUSHI_GO_TOTAL_ROUNDS - 1,
      Math.max(0, active),
    ),
    alternatePassDirection: Boolean(raw?.alternatePassDirection),
    rounds,
  };
}

export function buildSushiGoScoreRounds(session: SushiGoSession): RoundScores[] {
  const playRounds = session.rounds.map((round) => {
    const scores: RoundScores = {};
    for (const row of getSushiGoRoundScoreList(session.players, round)) {
      scores[row.playerId] = row.total;
    }
    return scores;
  });
  const dessert: RoundScores = {};
  for (const row of getSushiGoPuddingScoreList(session)) {
    dessert[row.playerId] = row.points;
  }
  return [...playRounds, dessert];
}

export function createInProgressSushiGoMatch(
  session: SushiGoSession,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: 'Sushi Go',
    gameMode: 'sushi_go',
    sessionId: sessionId ?? null,
    settings: { maxRounds: SUSHI_GO_TOTAL_ROUNDS, maxPointsToWin: null },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: session.activeRoundIndex,
    roundScoringMode: {},
    status: 'in_progress',
    sushiGoSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

export function createFinishedSushiGoMatch(session: SushiGoSession): Match {
  const now = Date.now();
  const rounds = buildSushiGoScoreRounds(session);
  return {
    id: createId(),
    name: 'Sushi Go',
    gameMode: 'sushi_go',
    settings: { maxRounds: SUSHI_GO_TOTAL_ROUNDS, maxPointsToWin: null },
    players: session.players,
    rounds,
    roundBreakdowns: rounds.map(() => emptyRoundBreakdown()),
    activeRoundIndex: SUSHI_GO_TOTAL_ROUNDS - 1,
    roundScoringMode: {},
    status: 'finished',
    sushiGoSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

export function formatSushiGoSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

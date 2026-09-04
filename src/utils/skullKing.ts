import { Match, Player, SkullKingRoundEntry, SkullKingSession } from '../types';
import type { HowToPlaySection } from '../types/howToPlay';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const SKULL_KING_TOTAL_ROUNDS = 10;
export const SKULL_KING_HOW_TO_PLAY_SECTIONS: HowToPlaySection[] = [
  {
    title: 'Palabras clave',
    terms: [
      {
        term: 'Ronda',
        definition:
          'Se reparte el mismo número de cartas que la ronda actual, con un máximo de 10.',
      },
      {
        term: 'Baza',
        definition:
          'En cada ronda, cada jugador echa una carta en sentido horario. Quien juegue la más alta gana: eso es una baza. Se sigue hasta acabar las cartas de la ronda.',
      },
      {
        term: 'Carta principal',
        definition:
          'La primera carta de la baza marca el palo. Si lo tienes, debes seguirlo. Las cartas sin número no están obligadas.',
      },
      {
        term: 'Palos',
        definition: 'Cartas básicas.',
      },
      {
        term: 'Triunfo',
        definition: 'Cartas con más valor que los palos.',
      },
    ],
  },
  {
    title: 'Cartas',
    items: [
      {
        type: 'term',
        term: 'Palos',
        definition: 'Loros, cofres y mapas.',
      },
      {
        type: 'heading',
        title: 'Especiales',
        body: 'Se pueden jugar en cualquier baza, aunque debas seguir palo.',
      },
      {
        type: 'term',
        term: 'Huida',
        definition:
          'Valen 0 y pierden siempre. Sirven para no ganar bazas de más.',
      },
      {
        type: 'term',
        term: 'Piratas',
        definition:
          'Ganan a todas las numeradas. Si hay varios, gana el primero que se jugó.',
      },
      {
        type: 'term',
        term: 'Tigresa',
        definition: 'Al jugarla, eliges si cuenta como Pirata o como Huida.',
      },
      {
        type: 'term',
        term: 'Skull King',
        definition:
          'Gana a numeradas y piratas (también a la Tigresa-pirata). Solo le ganan las Sirenas.',
      },
      {
        type: 'term',
        term: 'Sirenas',
        definition:
          'Ganan a las numeradas y pierden con los piratas, excepto que ganan al Skull King. Si hay dos, gana la primera. Si en la misma baza hay pirata, Skull King y sirena, gana siempre la sirena (y el bonus de capturar al Skull King).',
      },
      {
        type: 'note',
        text: 'Si la primera carta es Huida o Tigresa-huida, marca el palo el siguiente que no juegue una de esas. Si es Sirena, Pirata, Skull King o Tigresa-pirata, no hay palo que seguir: cada uno juega lo que quiera.',
      },
    ],
  },
  {
    title: 'Quién gana',
    items: [
      {
        type: 'heading',
        title: 'Personajes',
        body: 'No hay uno más fuerte: cada uno gana a otro.',
      },
      {
        type: 'matchups',
        rows: [
          { from: 'Sirenas', to: 'Skull King', bonus: '+50' },
          { from: 'Skull King', to: 'Piratas', bonus: '+30 por pirata' },
          { from: 'Piratas', to: 'Sirenas' },
        ],
      },
      {
        type: 'note',
        text: 'Si en la misma baza hay pirata, Skull King y sirena, gana siempre la sirena.',
      },
      {
        type: 'heading',
        title: 'El resto',
        body: 'Cualquier personaje gana a las cartas numeradas.',
      },
      {
        type: 'hierarchy',
        levels: [
          { label: 'Personajes' },
          { label: 'Triunfo' },
          { label: 'Palos' },
          { label: 'Huida' },
        ],
      },
    ],
  },
  {
    title: 'Cómo jugar',
    terms: [
      {
        term: 'Repartir',
        definition:
          '10 rondas. En la 1 se da 1 carta a cada uno; en la 2, dos… hasta 10. Al empezar cada ronda se baraja todo el mazo, también las cartas de la ronda anterior.',
      },
      {
        term: 'Apostar',
        definition:
          'Tras ver la mano se realizan las apuestas de bazas y se anotan en la aplicación.',
      },
      {
        term: 'Jugar',
        definition:
          'Si tienes el palo de la carta principal, estás obligado a seguirlo, a no ser que no lo tengas o juegues una carta sin número. Un palo distinto que no sea triunfo pierde, aunque sea el número más alto. El triunfo negro gana a cualquier carta numerada.',
      },
      {
        term: 'Quién empieza',
        definition:
          'Tras apostar, el jugador inicial de la ronda (a la izquierda del repartidor) abre la primera baza. En sentido horario se echa una carta. Quien juegue la más alta gana, junta las cartas y lidera la siguiente baza. Se sigue hasta acabar las cartas de la ronda.',
      },
      {
        term: 'Siguiente ronda',
        definition:
          'Se anotan los puntos y bonus. Reparte el de la izquierda, con una carta más. El nuevo jugador inicial es quien queda a su izquierda. Tras la 10, gana quien más puntos tenga.',
      },
    ],
  },
  {
    title: 'Puntuación',
    terms: [
      {
        term: 'Apuesta exacta',
        definition: '20 puntos por cada baza ganada.',
      },
      {
        term: 'Apuesta fallida',
        definition:
          '−10 puntos por cada baza de más o de menos. Esa ronda no sumas puntos por capturas.',
      },
      {
        term: 'Apuesta a 0',
        definition:
          'Si no ganas ninguna baza, 10 puntos por cada carta repartida. Si ganas una o más, pierdes 10 por cada carta repartida.',
      },
    ],
  },
];

export const SKULL_KING_MIN_PLAYERS = 2;
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

/** El primer jugador de la lista reparte la ronda 1; luego rota a la izquierda. */
export function getSkullKingRoundRoles(
  players: Player[],
  roundIndex: number,
): { dealerId: string | null; starterId: string | null } {
  if (players.length === 0) {
    return { dealerId: null, starterId: null };
  }
  const dealerIndex = ((roundIndex % players.length) + players.length) % players.length;
  const starterIndex = (dealerIndex + 1) % players.length;
  return {
    dealerId: players[dealerIndex].id,
    starterId: players[starterIndex].id,
  };
}

export function calculateSkullKingRoundScore(
  roundNumber: number,
  entry: SkullKingRoundEntry,
): number {
  const { bid, tricksWon, pirateCount, mermaidCapturesKing } = entry;

  if (bid === tricksWon) {
    let score = bid === 0 ? roundNumber * 10 : tricksWon * 20;
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

export function createInProgressSkullKingMatch(
  session: SkullKingSession,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: 'Skull King',
    gameMode: 'skull_king',
    sessionId: sessionId ?? null,
    settings: { maxRounds: SKULL_KING_TOTAL_ROUNDS, maxPointsToWin: null },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: session.activeRoundIndex,
    roundScoringMode: {},
    status: 'in_progress',
    skullKingSession: session,
    createdAt: now,
    updatedAt: now,
  };
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

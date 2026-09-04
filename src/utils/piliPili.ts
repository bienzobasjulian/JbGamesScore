import {
  Match,
  Player,
  PiliPiliMissionType,
  PiliPiliRoundConfig,
  PiliPiliRoundEntry,
  PiliPiliSession,
  RoundScores,
} from '../types';
import { createId } from './game';
import { emptyRoundBreakdown } from './rounds';

export const PILI_PILI_MIN_PLAYERS = 2;
export const PILI_PILI_MAX_PLAYERS = 8;
export const PILI_PILI_LOSE_AT = 7;

export const PILI_PILI_HOW_TO_PLAY = [
  'El objetivo es adivinar cuántas bazas vas a ganar. Una baza son las cartas de un turno: gana el número más alto.',
  'Hay cartas del 1 al 55 (solo cuenta el número) y un comodín, que eliges si es la más alta o la más baja.',
  'Sin misión, lo habitual son 5 cartas por jugador. Con misión, reparte las que indique la carta.',
  'Tras ver la mano, empieza a apostar el repartidor. La suma total de apuestas no puede ser igual a las cartas repartidas: el último ajusta la suya.',
  'Se juega empezando por el repartidor. Puedes echar cualquiera. Quien gane la baza lidera la siguiente, hasta acabar las cartas.',
  'Recibes 1 Pili por cada baza de más o de menos respecto a tu apuesta. Algunas misiones suman o quitan más Pilis.',
  `Cuando alguien llega a ${PILI_PILI_LOSE_AT} Pilis, termina. Gana quien menos tenga.`,
].join('\n\n');

export const PILI_PILI_MISSION_LABELS: Record<PiliPiliMissionType, string> = {
  exact_bet_discard:
    'Apuesta acertada: descarta Pilis igual al valor de la apuesta',
  first_last_trick:
    'Primera y/o última baza: +1 Pili si ganas alguna (máx. 1 por jugador)',
  mission_card_numbers:
    'Bazas con carta de misión: +1 Pili por baza (máx. suma = cartas repartidas)',
  linked_player:
    'Tras las apuestas: Pilis propios + los del jugador elegido',
  forbidden_bet: 'Prohibido apostar 0 o 1 (según la carta de misión)',
  no_copy_bid: 'Prohibido copiar la apuesta del jugador anterior',
};

export function formatPiliPiliMissionLabel(config: PiliPiliRoundConfig): string {
  if (config.mission == null) {
    return 'Sin misión esta ronda';
  }
  if (
    config.mission === 'forbidden_bet' &&
    (config.forbiddenBidValue === 0 || config.forbiddenBidValue === 1)
  ) {
    return `Prohibido apostar ${config.forbiddenBidValue}`;
  }
  return PILI_PILI_MISSION_LABELS[config.mission];
}

export function emptyPiliPiliRoundConfig(): PiliPiliRoundConfig {
  return {
    mission: null,
    cardsDealt: 0,
    forbiddenBidValue: null,
  };
}

export function emptyPiliPiliRoundEntry(): PiliPiliRoundEntry {
  return {
    bid: 0,
    tricksWon: 0,
    entered: false,
    wonFirstTrick: false,
    wonLastTrick: false,
    missionCardTricksWon: 0,
    linkedPlayerId: null,
  };
}

function emptyRoundByPlayer(players: Player[]): Record<string, PiliPiliRoundEntry> {
  const byPlayer: Record<string, PiliPiliRoundEntry> = {};
  for (const player of players) {
    byPlayer[player.id] = emptyPiliPiliRoundEntry();
  }
  return byPlayer;
}

export function createPiliPiliSession(players: Player[]): PiliPiliSession {
  return {
    players,
    activeRoundIndex: 0,
    rounds: [emptyRoundByPlayer(players)],
    roundConfigs: [emptyPiliPiliRoundConfig()],
  };
}

export function getPiliPiliRoundNumber(roundIndex: number): number {
  return roundIndex + 1;
}

export function getPiliPiliMaxBid(config: PiliPiliRoundConfig): number {
  return Math.max(0, config.cardsDealt);
}

export function clampPiliPiliRoundEntry(
  entry: PiliPiliRoundEntry,
  _maxBid: number,
): PiliPiliRoundEntry {
  return {
    ...entry,
    bid: Math.max(0, Math.floor(entry.bid)),
    tricksWon: Math.max(0, Math.floor(entry.tricksWon)),
    missionCardTricksWon: Math.max(0, Math.floor(entry.missionCardTricksWon)),
  };
}

export function getPiliPiliDealerIndex(roundIndex: number, playerCount: number): number {
  if (playerCount <= 0) return 0;
  return roundIndex % playerCount;
}

/** Orden de jugadores con el repartidor primero. */
export function getPiliPiliPlayersForRound(
  players: Player[],
  roundIndex: number,
): Player[] {
  if (players.length === 0) return [];
  const dealerIndex = getPiliPiliDealerIndex(roundIndex, players.length);
  return [...players.slice(dealerIndex), ...players.slice(0, dealerIndex)];
}

/** Orden de apuestas: empieza el repartidor; el último en apostar cierra. */
export function getPiliPiliLastBidderId(
  players: Player[],
  roundIndex: number,
): string | null {
  const ordered = getPiliPiliPlayersForRound(players, roundIndex);
  if (ordered.length === 0) return null;
  return ordered[ordered.length - 1].id;
}

export function getPiliPiliPreviousBidder(
  players: Player[],
  roundIndex: number,
  playerId: string,
): Player | null {
  const ordered = getPiliPiliPlayersForRound(players, roundIndex);
  const index = ordered.findIndex((player) => player.id === playerId);
  if (index <= 0) return null;
  return ordered[index - 1] ?? null;
}

export function isPiliPiliLastBidder(
  players: Player[],
  roundIndex: number,
  playerId: string,
): boolean {
  return getPiliPiliLastBidderId(players, roundIndex) === playerId;
}

export function getPiliPiliTrickWinnerId(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  trick: 'first' | 'last',
): string | null {
  const key = trick === 'first' ? 'wonFirstTrick' : 'wonLastTrick';
  for (const player of players) {
    if (roundByPlayer[player.id]?.[key]) return player.id;
  }
  return null;
}

export function applyPiliPiliFirstLastTrickExclusivity(
  round: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  playerId: string,
  patch: Partial<PiliPiliRoundEntry>,
): Record<string, PiliPiliRoundEntry> {
  const next = { ...round };
  if (patch.wonFirstTrick === true) {
    for (const player of players) {
      if (player.id === playerId) continue;
      next[player.id] = {
        ...(next[player.id] ?? emptyPiliPiliRoundEntry()),
        wonFirstTrick: false,
      };
    }
  }
  if (patch.wonLastTrick === true) {
    for (const player of players) {
      if (player.id === playerId) continue;
      next[player.id] = {
        ...(next[player.id] ?? emptyPiliPiliRoundEntry()),
        wonLastTrick: false,
      };
    }
  }
  return next;
}

function calculateIndividualRoundPilis(
  entry: PiliPiliRoundEntry,
  config: PiliPiliRoundConfig,
): number {
  const diff = Math.abs(entry.tricksWon - entry.bid);
  let pilis = diff;

  if (
    config.mission === 'exact_bet_discard' &&
    entry.bid === entry.tricksWon &&
    entry.bid > 0
  ) {
    pilis = -entry.bid;
  }

  if (config.mission === 'first_last_trick') {
    if (entry.wonFirstTrick || entry.wonLastTrick) pilis += 1;
  }

  if (config.mission === 'mission_card_numbers') {
    pilis += Math.max(0, entry.missionCardTricksWon);
  }

  return pilis;
}

/** Suma Pilis acumulados; el total nunca baja de 0. */
export function accumulatePiliPiliTotal(
  currentTotal: number,
  roundPilis: number,
): number {
  return Math.max(0, currentTotal + roundPilis);
}

/** Cambio real de Pilis en la ronda tras aplicar el suelo en 0. */
export function getPiliPiliEffectiveRoundDelta(
  totalBeforeRound: number,
  rawRoundScore: number,
): number {
  return (
    accumulatePiliPiliTotal(totalBeforeRound, rawRoundScore) - totalBeforeRound
  );
}

export function getPiliPiliEffectiveRoundDeltaFromRounds(
  rounds: RoundScores[],
  roundIndex: number,
  playerId: string,
): number {
  const totalBefore = getPiliPiliPlayerTotalFromRounds(
    rounds,
    playerId,
    roundIndex,
  );
  const totalAfter = getPiliPiliPlayerTotalFromRounds(
    rounds,
    playerId,
    roundIndex + 1,
  );
  return totalAfter - totalBefore;
}

export function getPiliPiliPlayerTotalFromRounds(
  rounds: RoundScores[],
  playerId: string,
  upToRoundExclusive: number = rounds.length,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(upToRoundExclusive, rounds.length));
  for (let i = 0; i < limit; i++) {
    total = accumulatePiliPiliTotal(
      total,
      rounds[i]?.[playerId] ?? 0,
    );
  }
  return total;
}

export function calculatePiliPiliRoundScore(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  config: PiliPiliRoundConfig,
  playerId: string,
): number {
  const entry = roundByPlayer[playerId] ?? emptyPiliPiliRoundEntry();
  let pilis = calculateIndividualRoundPilis(entry, config);

  if (config.mission === 'linked_player' && entry.linkedPlayerId) {
    const linkedEntry =
      roundByPlayer[entry.linkedPlayerId] ?? emptyPiliPiliRoundEntry();
    pilis += calculateIndividualRoundPilis(linkedEntry, {
      ...config,
      mission: null,
    });
  }

  return pilis;
}

export function getPiliPiliBidSum(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
): number {
  return players.reduce(
    (sum, player) =>
      sum + (roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry()).bid,
    0,
  );
}

export function getPiliPiliMissionCardTricksSum(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
): number {
  return players.reduce(
    (sum, player) =>
      sum +
      (roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry())
        .missionCardTricksWon,
    0,
  );
}

export function getPiliPiliTricksWonSum(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
): number {
  return players.reduce(
    (sum, player) =>
      sum + (roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry()).tricksWon,
    0,
  );
}

export function getPiliPiliOtherBidsSum(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  excludePlayerId: string,
): number {
  return players
    .filter((player) => player.id !== excludePlayerId)
    .reduce(
      (sum, player) =>
        sum + (roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry()).bid,
      0,
    );
}

/** Apuesta prohibida para el último jugador en apostar (igualaría el total). */
export function getPiliPiliForbiddenBid(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  playerId: string,
  cardsDealt: number,
  roundIndex: number,
): number | null {
  if (cardsDealt <= 0) return null;
  if (!isPiliPiliLastBidder(players, roundIndex, playerId)) return null;
  const forbidden =
    cardsDealt - getPiliPiliOtherBidsSum(roundByPlayer, players, playerId);
  const maxBid = Math.max(0, cardsDealt);
  if (forbidden < 0 || forbidden > maxBid) return null;
  return forbidden;
}

export function isPiliPiliBidAllowed(
  bid: number,
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  playerId: string,
  cardsDealt: number,
  roundIndex: number,
): boolean {
  const forbidden = getPiliPiliForbiddenBid(
    roundByPlayer,
    players,
    playerId,
    cardsDealt,
    roundIndex,
  );
  return forbidden === null || bid !== forbidden;
}

export function sanitizePiliPiliRoundBids(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  config: PiliPiliRoundConfig,
): Record<string, PiliPiliRoundEntry> {
  const maxBid = getPiliPiliMaxBid(config);
  const next: Record<string, PiliPiliRoundEntry> = { ...roundByPlayer };

  for (const player of players) {
    next[player.id] = clampPiliPiliRoundEntry(
      next[player.id] ?? emptyPiliPiliRoundEntry(),
      maxBid,
    );
  }

  return next;
}

export function getPiliPiliRoundErrors(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  config: PiliPiliRoundConfig,
  roundIndex: number,
): string[] {
  const errors: string[] = [];
  const cardsDealt = config.cardsDealt;

  if (cardsDealt <= 0) {
    errors.push('Indica cuántas cartas se reparten en esta ronda.');
    return errors;
  }

  for (const player of players) {
    const entry = roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry();
    if (entry.bid > cardsDealt) {
      errors.push(
        `${player.name}: la apuesta (${entry.bid}) supera las ${cardsDealt} cartas repartidas.`,
      );
    }
    if (entry.tricksWon > cardsDealt) {
      errors.push(
        `${player.name}: las bazas ganadas (${entry.tricksWon}) superan las ${cardsDealt} cartas repartidas.`,
      );
    }
  }

  const tricksSum = getPiliPiliTricksWonSum(roundByPlayer, players);
  if (tricksSum !== cardsDealt) {
    errors.push(
      `La suma de bazas ganadas (${tricksSum}) debe ser igual a las ${cardsDealt} cartas repartidas en la ronda.`,
    );
  }

  const lastBidderId = getPiliPiliLastBidderId(players, roundIndex);
  if (lastBidderId) {
    const lastEntry = roundByPlayer[lastBidderId] ?? emptyPiliPiliRoundEntry();
    if (
      !isPiliPiliBidAllowed(
        lastEntry.bid,
        roundByPlayer,
        players,
        lastBidderId,
        cardsDealt,
        roundIndex,
      )
    ) {
      const lastPlayer = players.find((p) => p.id === lastBidderId);
      errors.push(
        `${lastPlayer?.name ?? 'El último en apostar'} debe ajustar su apuesta: la suma no puede ser igual a ${cardsDealt} cartas.`,
      );
    }
  }

  if (config.mission === 'linked_player') {
    for (const player of players) {
      const entry = roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry();
      if (!entry.linkedPlayerId) {
        errors.push(`${player.name} debe elegir un jugador para la misión.`);
      }
    }
  }

  if (config.mission === 'mission_card_numbers') {
    const missionTricksSum = getPiliPiliMissionCardTricksSum(
      roundByPlayer,
      players,
    );
    if (missionTricksSum > cardsDealt) {
      errors.push(
        `La suma de bazas con carta de misión (${missionTricksSum}) supera las ${cardsDealt} cartas repartidas en la ronda.`,
      );
    }
  }

  if (config.mission === 'forbidden_bet') {
    if (config.forbiddenBidValue !== 0 && config.forbiddenBidValue !== 1) {
      errors.push('Indica si está prohibido apostar 0 o 1 en la misión.');
    } else {
      for (const player of players) {
        const entry = roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry();
        if (entry.bid === config.forbiddenBidValue) {
          errors.push(
            `${player.name}: está prohibido apostar ${config.forbiddenBidValue} esta ronda.`,
          );
        }
      }
    }
  }

  if (config.mission === 'no_copy_bid') {
    const ordered = getPiliPiliPlayersForRound(players, roundIndex);
    for (let i = 1; i < ordered.length; i++) {
      const player = ordered[i];
      const previous = ordered[i - 1];
      const entry = roundByPlayer[player.id] ?? emptyPiliPiliRoundEntry();
      const previousEntry =
        roundByPlayer[previous.id] ?? emptyPiliPiliRoundEntry();
      if (entry.bid === previousEntry.bid) {
        errors.push(
          `${player.name}: no puede copiar la apuesta de ${previous.name} (${previousEntry.bid}).`,
        );
      }
    }
  }

  return errors;
}

export function hasPiliPiliRoundErrors(
  roundByPlayer: Record<string, PiliPiliRoundEntry>,
  players: Player[],
  config: PiliPiliRoundConfig,
  roundIndex: number,
): boolean {
  return getPiliPiliRoundErrors(roundByPlayer, players, config, roundIndex)
    .length > 0;
}

export function getPiliPiliPlayerTotal(
  session: PiliPiliSession,
  playerId: string,
  upToRoundExclusive: number = session.rounds.length,
): number {
  let total = 0;
  const limit = Math.max(0, Math.min(upToRoundExclusive, session.rounds.length));
  for (let i = 0; i < limit; i++) {
    const roundByPlayer = session.rounds[i] ?? {};
    const config = session.roundConfigs[i] ?? emptyPiliPiliRoundConfig();
    total = accumulatePiliPiliTotal(
      total,
      calculatePiliPiliRoundScore(roundByPlayer, config, playerId),
    );
  }
  return total;
}

export function sortPlayersByPiliPiliTotal(
  session: PiliPiliSession,
  upToRoundExclusive: number = session.rounds.length,
): { player: Player; total: number }[] {
  return session.players
    .map((player) => ({
      player,
      total: getPiliPiliPlayerTotal(session, player.id, upToRoundExclusive),
    }))
    .sort((a, b) => a.total - b.total);
}

export function hasPiliPiliGameOver(
  session: PiliPiliSession,
  upToRoundExclusive: number = session.rounds.length,
): boolean {
  return session.players.some(
    (player) =>
      getPiliPiliPlayerTotal(session, player.id, upToRoundExclusive) >=
      PILI_PILI_LOSE_AT,
  );
}

export function createInProgressPiliPiliMatch(
  session: PiliPiliSession,
  sessionId?: string | null,
): Match {
  const now = Date.now();
  return {
    id: createId(),
    name: 'Pili pili',
    gameMode: 'pili_pili',
    sessionId: sessionId ?? null,
    settings: {
      maxRounds: null,
      maxPointsToWin: PILI_PILI_LOSE_AT,
      lowestScoreWins: true,
    },
    players: session.players,
    rounds: [],
    roundBreakdowns: [],
    activeRoundIndex: session.activeRoundIndex,
    roundScoringMode: {},
    status: 'in_progress',
    piliPiliSession: session,
    createdAt: now,
    updatedAt: now,
  };
}

export function createFinishedPiliPiliMatch(session: PiliPiliSession): Match {
  const now = Date.now();
  const rounds = session.rounds.map((roundByPlayer, index) => {
    const config = session.roundConfigs[index] ?? emptyPiliPiliRoundConfig();
    const scores: Record<string, number> = {};
    for (const player of session.players) {
      scores[player.id] = calculatePiliPiliRoundScore(
        roundByPlayer,
        config,
        player.id,
      );
    }
    return scores;
  });

  return {
    id: createId(),
    name: 'Pili pili',
    gameMode: 'pili_pili',
    settings: {
      maxRounds: null,
      maxPointsToWin: PILI_PILI_LOSE_AT,
      lowestScoreWins: true,
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

export function appendPiliPiliRound(session: PiliPiliSession): PiliPiliSession {
  return {
    ...session,
    rounds: [...session.rounds, emptyRoundByPlayer(session.players)],
    roundConfigs: [...session.roundConfigs, emptyPiliPiliRoundConfig()],
    activeRoundIndex: session.rounds.length,
  };
}

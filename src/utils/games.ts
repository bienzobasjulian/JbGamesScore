import { PLAYER_COLOR_OPTIONS } from '../constants';
import type { PreferredCreateMatchGame } from '../types';
import { SKULL_KING_MAX_PLAYERS, SKULL_KING_MIN_PLAYERS } from './skullKing';
import { AVENTUREROS_TOKEN_COLOR_OPTIONS } from './aventurerosTren';

export type CreateMatchGameType =
  | 'standard'
  | 'pelusas'
  | 'skull_king'
  | 'pili_pili'
  | 'flip7'
  | 'aventureros_tren'
  | 'regicide';

export type CreateMatchPlayerLimits = {
  min: number;
  max: number;
};

export function getCreateMatchPlayerLimits(
  gameType: CreateMatchGameType,
): CreateMatchPlayerLimits {
  switch (gameType) {
    case 'skull_king':
      return { min: SKULL_KING_MIN_PLAYERS, max: SKULL_KING_MAX_PLAYERS };
    case 'pili_pili':
      return { min: 2, max: 8 };
    case 'flip7':
      return { min: 3, max: Number.POSITIVE_INFINITY };
    case 'aventureros_tren':
      return { min: 1, max: 5 };
    case 'pelusas':
      return { min: 1, max: Number.POSITIVE_INFINITY };
    case 'regicide':
      return { min: 0, max: 0 };
    default:
      return { min: 1, max: Number.POSITIVE_INFINITY };
  }
}

export function isDedicatedCreateMatchGame(
  gameType: CreateMatchGameType,
): boolean {
  return gameType !== 'standard';
}

export type CreateMatchGameOption = {
  id: CreateMatchGameType;
  name: string;
  description: string;
};

export const CREATE_MATCH_STANDARD_OPTION: CreateMatchGameOption = {
  id: 'standard',
  name: 'Ninguno',
  description: 'Partida libre con plantilla, ajustes y jugadores',
};

export const CREATE_MATCH_GAMES: CreateMatchGameOption[] = [
  CREATE_MATCH_STANDARD_OPTION,
  {
    id: 'pelusas',
    name: 'Pelusas',
    description: 'Contador de cartas del 1 al 10 y modo Revolution',
  },
  {
    id: 'skull_king',
    name: 'Skull King',
    description: 'Bazas a 10 rondas con apuestas y bonificaciones',
  },
  {
    id: 'pili_pili',
    name: 'Pili pili',
    description: 'Apuestas de bazas y Pilis de penalización (2–8 jugadores)',
  },
  {
    id: 'flip7',
    name: 'Flip 7',
    description:
      'Cartas del 0 al 12, modificadores y bonus Flip7 · gana quien llegue a 200 (3+ jugadores)',
  },
  {
    id: 'aventureros_tren',
    name: 'Aventureros al tren',
    description:
      'Base o Europa: construcción, destinos y desempates (2–5 jugadores)',
  },
  {
    id: 'regicide',
    name: 'Regicide',
    description:
      'Asistente cooperativo: vida y ataque de J, Q y K (horizontal)',
  },
];

export const DEDICATED_CREATE_MATCH_GAMES: CreateMatchGameOption[] =
  CREATE_MATCH_GAMES.filter((game) => game.id !== 'standard');

const DEDICATED_CREATE_MATCH_GAME_IDS = new Set(
  DEDICATED_CREATE_MATCH_GAMES.map((game) => game.id),
);

export function normalizePreferredCreateMatchGames(
  value: unknown,
): PreferredCreateMatchGame[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<PreferredCreateMatchGame>();
  for (const item of value) {
    if (
      typeof item === 'string' &&
      DEDICATED_CREATE_MATCH_GAME_IDS.has(item as CreateMatchGameType)
    ) {
      seen.add(item as PreferredCreateMatchGame);
    }
  }
  return DEDICATED_CREATE_MATCH_GAMES.map((game) => game.id).filter(
    (id): id is PreferredCreateMatchGame =>
      seen.has(id as PreferredCreateMatchGame),
  );
}

export function getVisibleCreateMatchGames(
  preferred: readonly PreferredCreateMatchGame[],
): CreateMatchGameOption[] {
  const allowed = new Set(preferred);
  return DEDICATED_CREATE_MATCH_GAMES.filter((game) =>
    allowed.has(game.id as PreferredCreateMatchGame),
  );
}

export function resolveCreateMatchGameType(
  gameType: CreateMatchGameType,
  preferred: readonly PreferredCreateMatchGame[],
): CreateMatchGameType {
  if (
    gameType !== 'standard' &&
    preferred.includes(gameType as PreferredCreateMatchGame)
  ) {
    return gameType;
  }
  return 'standard';
}

export type MatchTokenColorOption = {
  name: string;
  value: string;
};

/** Paleta de fichas de esta partida, o null si el juego no usa color de ficha. */
export function getMatchTokenColorOptions(
  gameType: CreateMatchGameType,
): readonly MatchTokenColorOption[] | null {
  switch (gameType) {
    case 'aventureros_tren':
      return AVENTUREROS_TOKEN_COLOR_OPTIONS;
    case 'standard':
      return PLAYER_COLOR_OPTIONS;
    default:
      return null;
  }
}

export function getMatchTokenColorHint(
  gameType: CreateMatchGameType,
): string | null {
  switch (gameType) {
    case 'aventureros_tren':
      return 'Elige el color de la locomotora de cada jugador. Solo vale para esta partida; no cambia su color guardado.';
    case 'standard':
      return 'Si el juego tiene fichas de colores, elige uno en cada jugador. Solo vale para esta partida.';
    default:
      return null;
  }
}

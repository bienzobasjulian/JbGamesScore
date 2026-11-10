import { PLAYER_COLOR_OPTIONS } from '../constants';
import type { AventurerosTrenSubmode, PreferredCreateMatchGame } from '../types';
import { HERO_QUEST_MAX_PLAYERS, HERO_QUEST_MIN_PLAYERS } from './heroQuest';
import { SKULL_KING_MAX_PLAYERS, SKULL_KING_MIN_PLAYERS, SKULL_KING_TOTAL_ROUNDS } from './skullKing';
import { AVENTUREROS_TOKEN_COLOR_OPTIONS } from './aventurerosTren';
import { FLIP7_WIN_AT } from './flip7';
import { FLIP7_VENGEANCE_WIN_AT } from './flip7Vengeance';
import { PILI_PILI_LOSE_AT } from './piliPili';
import { SUSHI_GO_TOTAL_ROUNDS } from './sushiGo';

export type CreateMatchGameType = PreferredCreateMatchGame | 'standard';

export function isPelusasGame(gameType: CreateMatchGameType): boolean {
  return gameType === 'pelusas' || gameType === 'pelusas_revolution';
}

export function isAventurerosTrenGame(gameType: CreateMatchGameType): boolean {
  return (
    gameType === 'aventureros_tren' || gameType === 'aventureros_tren_europa'
  );
}

export function aventurerosSubmodeForGame(
  gameType: CreateMatchGameType,
): AventurerosTrenSubmode {
  return gameType === 'aventureros_tren_europa' ? 'europa' : 'base';
}

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
    case 'flip7_vengeance':
      return { min: 1, max: Number.POSITIVE_INFINITY };
    case 'aventureros_tren':
    case 'aventureros_tren_europa':
      return { min: 1, max: 5 };
    case 'pelusas':
    case 'pelusas_revolution':
      return { min: 1, max: Number.POSITIVE_INFINITY };
    case 'regicide':
      return { min: 0, max: 4 };
    case 'sushi_go':
      return { min: 2, max: 5 };
    case 'hero_quest':
      return { min: HERO_QUEST_MIN_PLAYERS, max: HERO_QUEST_MAX_PLAYERS };
    case 'mente_vacuna':
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
    description: 'Contador de cartas del 1 al 10',
  },
  {
    id: 'pelusas_revolution',
    name: 'Pelusas Revolution',
    description: 'Contador de cartas del 1 al 10, más las de 20 y −7',
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
      'Cartas del 0 al 12, modificadores y bonus Flip7 · gana quien llegue a 200',
  },
  {
    id: 'flip7_vengeance',
    name: 'Flip7 Venganza',
    description:
      'Del 1 al 13, especiales y modificadores negativos · 200 pts',
  },
  {
    id: 'aventureros_tren',
    name: 'Aventureros al tren',
    description: 'Construcción, destinos y desempates (2–5 jugadores)',
  },
  {
    id: 'aventureros_tren_europa',
    name: 'Aventureros al tren Europa',
    description:
      'Estaciones, túneles y vías de hasta 8 vagones (2–5 jugadores)',
  },
  {
    id: 'regicide',
    name: 'Regicide',
    description:
      'Asistente cooperativo: vida y ataque de J, Q y K · jugadores opcionales para la sesión',
  },
  {
    id: 'sushi_go',
    name: 'Sushi Go',
    description:
      'Tres rondas de cartas: maki, nigiri, tempura y pudin (2–5 jugadores)',
  },
  {
    id: 'hero_quest',
    name: 'HeroQuest',
    description:
      'Un héroe por jugador: Bárbaro, Enano, Elfo o Mago (1–4)',
  },
  {
    id: 'mente_vacuna',
    name: 'Mente Vacuna',
    description: 'Preguntas para coincidir. Sin puntuación ni jugadores',
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

export type GameCatalogTone = 'high' | 'low' | 'neutral';

export type GameCatalogMeta = {
  /** Rango real de jugadores. Vacío si el juego no fija un máximo. */
  playersLabel: string | null;
  /** Rondas fijas del juego, si las tiene. */
  roundsLabel: string | null;
  objectiveLabel: string | null;
  objectiveTone: GameCatalogTone;
};

function formatKnownPlayerRange(limits: CreateMatchPlayerLimits): string | null {
  if (!Number.isFinite(limits.max) || limits.max <= 0) return null;
  if (limits.min <= 0) return `hasta ${limits.max}`;
  if (limits.min === limits.max) return `${limits.min}`;
  return `${limits.min}–${limits.max}`;
}

export function getGameCatalogMeta(gameType: CreateMatchGameType): GameCatalogMeta {
  const playersLabel = formatKnownPlayerRange(getCreateMatchPlayerLimits(gameType));
  switch (gameType) {
    case 'flip7':
      return {
        playersLabel,
        roundsLabel: null,
        objectiveLabel: `Objetivo ${FLIP7_WIN_AT}`,
        objectiveTone: 'high',
      };
    case 'flip7_vengeance':
      return {
        playersLabel,
        roundsLabel: null,
        objectiveLabel: `Objetivo ${FLIP7_VENGEANCE_WIN_AT}`,
        objectiveTone: 'high',
      };
    case 'skull_king':
      return {
        playersLabel,
        roundsLabel: `${SKULL_KING_TOTAL_ROUNDS} rondas`,
        objectiveLabel: 'Más alto',
        objectiveTone: 'high',
      };
    case 'sushi_go':
      return {
        playersLabel,
        roundsLabel: `${SUSHI_GO_TOTAL_ROUNDS} rondas`,
        objectiveLabel: 'Más alto',
        objectiveTone: 'high',
      };
    case 'pili_pili':
      return {
        playersLabel,
        roundsLabel: null,
        objectiveLabel: `Pierde a ${PILI_PILI_LOSE_AT}`,
        objectiveTone: 'low',
      };
    case 'pelusas':
    case 'pelusas_revolution':
    case 'aventureros_tren':
    case 'aventureros_tren_europa':
      return {
        playersLabel,
        roundsLabel: null,
        objectiveLabel: 'Más alto',
        objectiveTone: 'high',
      };
    case 'regicide':
      return {
        playersLabel,
        roundsLabel: null,
        objectiveLabel: 'Cooperativo',
        objectiveTone: 'neutral',
      };
    default:
      return {
        playersLabel,
        roundsLabel: null,
        objectiveLabel: null,
        objectiveTone: 'neutral',
      };
  }
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
    case 'aventureros_tren_europa':
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
    case 'aventureros_tren_europa':
      return 'Elige el color de la locomotora de cada jugador. Solo vale para esta partida; no cambia su color guardado.';
    case 'standard':
      return 'Si el juego tiene fichas de colores, elige uno en cada jugador. Solo vale para esta partida.';
    default:
      return null;
  }
}

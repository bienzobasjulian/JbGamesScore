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
      return { min: 1, max: 6 };
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

export const CREATE_MATCH_GAMES: CreateMatchGameOption[] = [
  {
    id: 'standard',
    name: 'Ninguno',
    description: 'Partida libre con plantilla, ajustes y jugadores',
  },
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

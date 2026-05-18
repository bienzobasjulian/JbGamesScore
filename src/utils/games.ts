export type CreateMatchGameType =
  | 'standard'
  | 'pelusas'
  | 'skull_king'
  | 'aventureros_tren';

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
    case 'aventureros_tren':
      return { min: 1, max: 5 };
    case 'pelusas':
      return { min: 1, max: Number.POSITIVE_INFINITY };
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
    id: 'aventureros_tren',
    name: 'Aventureros al tren',
    description:
      'Base o Europa: construcción, destinos y desempates (2–5 jugadores)',
  },
];

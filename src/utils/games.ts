export type CreateMatchGameType = 'standard' | 'pelusas' | 'skull_king';

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
];

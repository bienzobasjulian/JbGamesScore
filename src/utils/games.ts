export type CreateMatchGameType = 'standard' | 'pelusas';

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
];

import type { HowToPlayItem, HowToPlaySection } from '../types/howToPlay';
import { getAventurerosTrenHowToPlay } from './aventurerosTren';
import {
  FLIP7_HOW_TO_PLAY,
  FLIP7_HOW_TO_PLAY_ITEMS,
} from './flip7';
import {
  FLIP7_VENGEANCE_HOW_TO_PLAY,
  FLIP7_VENGEANCE_HOW_TO_PLAY_ITEMS,
} from './flip7Vengeance';
import type { CreateMatchGameType } from './games';
import { getPelusasHowToPlay } from './pelusas';
import { PILI_PILI_HOW_TO_PLAY } from './piliPili';
import {
  REGICIDE_HOW_TO_PLAY,
  REGICIDE_HOW_TO_PLAY_SECTIONS,
} from './regicide';
import { SKULL_KING_HOW_TO_PLAY_SECTIONS } from './skullKing';
import { SUSHI_GO_HOW_TO_PLAY_SECTIONS } from './sushiGo';

export type CreateMatchHowTo = {
  title: string;
  body?: string;
  items?: HowToPlayItem[];
  sections?: HowToPlaySection[];
};

export function getCreateMatchHowTo(
  gameType: CreateMatchGameType,
): CreateMatchHowTo | null {
  switch (gameType) {
    case 'standard':
      return null;
    case 'pelusas':
      return { title: 'Pelusas', body: getPelusasHowToPlay(false) };
    case 'pelusas_revolution':
      return { title: 'Pelusas Revolution', body: getPelusasHowToPlay(true) };
    case 'skull_king':
      return { title: 'Skull King', sections: SKULL_KING_HOW_TO_PLAY_SECTIONS };
    case 'pili_pili':
      return { title: 'Pili pili', body: PILI_PILI_HOW_TO_PLAY };
    case 'flip7':
      return {
        title: 'Flip 7',
        body: FLIP7_HOW_TO_PLAY,
        items: FLIP7_HOW_TO_PLAY_ITEMS,
      };
    case 'flip7_vengeance':
      return {
        title: 'Flip7 Venganza',
        body: FLIP7_VENGEANCE_HOW_TO_PLAY,
        items: FLIP7_VENGEANCE_HOW_TO_PLAY_ITEMS,
      };
    case 'aventureros_tren':
      return {
        title: 'Aventureros al tren',
        ...getAventurerosTrenHowToPlay('base'),
      };
    case 'aventureros_tren_europa':
      return {
        title: 'Aventureros al tren Europa',
        ...getAventurerosTrenHowToPlay('europa'),
      };
    case 'regicide':
      return {
        title: 'Regicide',
        body: REGICIDE_HOW_TO_PLAY,
        sections: REGICIDE_HOW_TO_PLAY_SECTIONS,
      };
    case 'sushi_go':
      return { title: 'Sushi Go', sections: SUSHI_GO_HOW_TO_PLAY_SECTIONS };
    case 'hero_quest':
      return {
        title: 'HeroQuest',
        body: 'Cada jugador elige una clase distinta: Bárbaro, Enano, Elfo o Mago. La partida guarda el héroe y el nombre de cada uno. La puntuación se anota en la ficha del juego.',
      };
    case 'mente_vacuna':
      return {
        title: 'Mente Vacuna',
        body: 'Se muestra una pregunta y todo el mundo intenta decir lo mismo. No se anotan jugadores ni puntos.',
      };
    default:
      return null;
  }
}

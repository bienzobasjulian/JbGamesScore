import {
  GameSettings,
  HeroQuestHeroId,
  Player,
  ScoreLayout,
  ScoreRoundOrder,
  ScoreTileWidth,
} from '../types';
import { CreateMatchGameType } from '../utils/games';

export type CreateMatchDraft = {
  gameType: CreateMatchGameType;
  settings: GameSettings;
  matchName: string;
  players: Player[];
  loadedTemplateId: string | null;
  randomStarterName: string | null;
  flip7VengeanceBrutal?: boolean;
  scoreLayout?: ScoreLayout;
  scoreTileWidth?: ScoreTileWidth;
  scoreRoundOrder?: ScoreRoundOrder;
  /** Clase de HeroQuest por id de jugador. Una clase distinta cada uno. */
  heroQuestClassByPlayer?: Partial<Record<string, HeroQuestHeroId>>;
  heroQuestNameByPlayer?: Record<string, string>;
};

export type EditMatchDraft = {
  settings: GameSettings;
  matchName: string;
  players: Player[];
  scoreLayout?: ScoreLayout;
  scoreTileWidth?: ScoreTileWidth;
  scoreRoundOrder?: ScoreRoundOrder;
};

export type PelusasSetupDraft = {
  players: Player[];
};

export type CreateWinnerMatchDraft = {
  matchName: string;
  players: Player[];
  winnerIds: string[];
};

export type EditTemplateDraft = {
  name: string;
  settings: GameSettings;
  playerIds: string[];
  players?: Player[];
};

export type PlayerSelectionDraftKey =
  | 'createMatch'
  | 'editMatch'
  | 'pelusasSetup'
  | 'createWinnerMatch'
  | 'editTemplate';

export type PlayerSelectionConfig = {
  returnScreen: import('../types').AppScreen;
  players: Player[];
  maxPlayers: number;
  allowAnonymous: boolean;
  parentDraft: unknown;
  draftKey: PlayerSelectionDraftKey;
};

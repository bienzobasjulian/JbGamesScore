import {
  AventurerosTrenSubmode,
  GameSettings,
  Player,
} from '../types';
import { CreateMatchGameType } from '../utils/games';

export type CreateMatchDraft = {
  gameType: CreateMatchGameType;
  settings: GameSettings;
  matchName: string;
  players: Player[];
  loadedTemplateId: string | null;
  aventurerosSubmode: AventurerosTrenSubmode;
  randomStarterName: string | null;
};

export type EditMatchDraft = {
  settings: GameSettings;
  matchName: string;
  players: Player[];
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

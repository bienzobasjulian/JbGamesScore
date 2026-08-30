import { PLAYER_COLORS } from '../constants';
import { Player } from '../types';
import { formatRelativeDate } from './dateFormat';
import { createId } from './game';

export const MIN_MATCH_PLAYERS = 1;

export const SOLO_PLAYER_DEFAULT_NAME = 'Yo';

export function isValidMatchPlayerCount(
  count: number,
  max: number = Number.POSITIVE_INFINITY,
): boolean {
  return count >= MIN_MATCH_PLAYERS && count <= max;
}

/** Jugador efímero para registro personal (siempre «Yo», sin usar guardados). */
export function createSoloPlayer(
  createNamedPlayer: (name: string, existing: Player[]) => Player | null,
): Player {
  const created = createNamedPlayer(SOLO_PLAYER_DEFAULT_NAME, []);
  if (created) return created;
  return {
    id: createId(),
    name: SOLO_PLAYER_DEFAULT_NAME,
    color: PLAYER_COLORS[0],
  };
}

export function ensureMatchPlayers(
  players: Player[],
  createNamedPlayer: (name: string, existing: Player[]) => Player | null,
): Player[] {
  if (players.length >= MIN_MATCH_PLAYERS) return players;
  return [createSoloPlayer(createNamedPlayer)];
}

export function formatPlayerLastUsed(timestamp: number): string {
  return `Último uso: ${formatRelativeDate(timestamp)}`;
}

const AVATAR_DARK_TEXT_COLORS = new Set(['#FFFFFF', '#FFFF00', '#00FFFF']);

function normalizePlayerColor(color: string): string {
  return color.trim().toUpperCase();
}

export function getPlayerAvatarTextColor(color: string): string {
  return AVATAR_DARK_TEXT_COLORS.has(normalizePlayerColor(color))
    ? '#000000'
    : '#FFFFFF';
}

import { PLAYER_COLORS } from '../constants';
import { Player } from '../types';
import { createId } from './game';
import { pickPlayerColor } from './match';

export const ANONYMOUS_PLAYER_ID_PREFIX = 'anon:';

export function isAnonymousPlayer(player: Player): boolean {
  return player.id.startsWith(ANONYMOUS_PLAYER_ID_PREFIX);
}

export function createAnonymousPlayer(
  index: number,
  existing: Player[],
): Player {
  return {
    id: `${ANONYMOUS_PLAYER_ID_PREFIX}${createId()}`,
    name: `Anónimo ${index}`,
    color: pickPlayerColor(existing),
  };
}

export function buildRosterFromSelection(
  selectedSaved: Player[],
  anonymousCount: number,
): Player[] {
  const roster: Player[] = [...selectedSaved];
  for (let i = 1; i <= anonymousCount; i++) {
    roster.push(createAnonymousPlayer(i, roster));
  }
  return roster;
}

export function parseRosterPlayers(players: Player[]): {
  savedPlayers: Player[];
  anonymousCount: number;
} {
  const savedPlayers = players.filter((player) => !isAnonymousPlayer(player));
  const anonymousCount = players.filter((player) =>
    isAnonymousPlayer(player),
  ).length;
  return { savedPlayers, anonymousCount };
}

export function anonymousPlayerColor(): string {
  return PLAYER_COLORS[PLAYER_COLORS.length - 1];
}

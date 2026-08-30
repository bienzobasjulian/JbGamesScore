import { PlayerGroup, SavedPlayer } from '../types';
import { createId } from './game';

export function createPlayerGroup(name: string): PlayerGroup {
  const now = Date.now();
  return {
    id: createId(),
    name: name.trim(),
    playerIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getGroupPlayers(
  group: PlayerGroup,
  players: SavedPlayer[],
): SavedPlayer[] {
  const byId = new Map(players.map((player) => [player.id, player]));
  return group.playerIds
    .map((id) => byId.get(id))
    .filter((player): player is SavedPlayer => player != null);
}

export function formatGroupMemberCount(count: number): string {
  return count === 1 ? '1 jugador' : `${count} jugadores`;
}

export function formatGroupSubtitle(
  group: PlayerGroup,
  players: SavedPlayer[],
): string {
  const members = getGroupPlayers(group, players);
  if (members.length === 0) return 'Sin jugadores';
  if (members.length <= 3) {
    return members.map((player) => player.name).join(', ');
  }
  return formatGroupMemberCount(members.length);
}

export function sortGroupsByName(groups: PlayerGroup[]): PlayerGroup[] {
  return [...groups].sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  );
}

export function removePlayerFromGroups(
  groups: PlayerGroup[],
  playerId: string,
): PlayerGroup[] {
  return groups.map((group) => ({
    ...group,
    playerIds: group.playerIds.filter((id) => id !== playerId),
  }));
}

export function removePlayersFromGroups(
  groups: PlayerGroup[],
  playerIds: string[],
): PlayerGroup[] {
  const ids = new Set(playerIds);
  return groups.map((group) => ({
    ...group,
    playerIds: group.playerIds.filter((id) => !ids.has(id)),
  }));
}

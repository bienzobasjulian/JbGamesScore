import { PLAYER_COLORS } from '../constants';
import { Player } from '../types';
import { createId } from './game';

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
    color: pickRandomPlayerColor(existing),
  };
}

function pickRandomPlayerColor(existing: Player[]): string {
  const used = new Set(existing.map((player) => player.color.toLowerCase()));
  const free = PLAYER_COLORS.filter((color) => !used.has(color.toLowerCase()));
  const pool = free.length > 0 ? free : [...PLAYER_COLORS];
  return pool[Math.floor(Math.random() * pool.length)];
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

/** Mantiene los ids ya usados en la partida para no perder las puntuaciones. */
export function preserveRosterIdentity(
  previous: Player[],
  next: Player[],
): Player[] {
  const previousById = new Map(previous.map((player) => [player.id, player]));
  const unusedAnonymous = previous.filter(isAnonymousPlayer);
  let anonymousCursor = 0;

  return next.map((player) => {
    if (!isAnonymousPlayer(player)) {
      const same = previousById.get(player.id);
      return same ? { ...same, ...player, id: same.id } : player;
    }

    const reused = unusedAnonymous[anonymousCursor];
    anonymousCursor += 1;
    if (!reused) return player;
    return {
      ...reused,
      name: player.name,
    };
  });
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

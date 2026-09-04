import { PLAYER_COLORS } from '../constants';
import { AppData, Player, SavedPlayer } from '../types';
import { formatRelativeDate } from './dateFormat';
import { createId } from './game';
import { isAnonymousPlayer } from './playerSelection';
import { normalizePlayerAvatar } from './playerAvatars';

export const MIN_MATCH_PLAYERS = 1;

export const SOLO_PLAYER_DEFAULT_NAME = 'Yo';
export const SOLO_PLAYER_ID_PREFIX = 'solo:';

export function isValidMatchPlayerCount(
  count: number,
  max: number = Number.POSITIVE_INFINITY,
): boolean {
  return count >= MIN_MATCH_PLAYERS && count <= max;
}

export function isSoloPlaceholderPlayer(player: Player): boolean {
  return player.id.startsWith(SOLO_PLAYER_ID_PREFIX);
}

export function isUnsavedRosterPlayer(player: Player): boolean {
  return isAnonymousPlayer(player) || isSoloPlaceholderPlayer(player);
}

export function createSoloPlaceholderPlayer(): Player {
  return {
    id: `${SOLO_PLAYER_ID_PREFIX}${createId()}`,
    name: SOLO_PLAYER_DEFAULT_NAME,
    color: PLAYER_COLORS[0],
  };
}

export function getSelfPlayer(
  players: SavedPlayer[],
  selfPlayerId?: string | null,
): SavedPlayer | null {
  if (!selfPlayerId) return null;
  return players.find((player) => player.id === selfPlayerId) ?? null;
}

export function formatSoloPlayerHint(selfPlayer?: Player | null): string {
  if (selfPlayer) {
    return `Si no eliges a nadie, se usará ${selfPlayer.name}.`;
  }
  return 'Si no eliges a nadie, se usará un jugador «Yo» solo para este registro. No se guarda en recientes.';
}

export function toMatchPlayer(
  player: Pick<Player, 'id' | 'name' | 'color' | 'avatar'>,
): Player {
  return {
    id: player.id,
    name: player.name,
    color: player.color,
    avatar: normalizePlayerAvatar(player.avatar),
  };
}

/** Jugador efímero para registro personal, o el marcado como «yo». */
export function ensureMatchPlayers(
  players: Player[],
  selfPlayer?: Player | null,
): Player[] {
  if (players.length >= MIN_MATCH_PLAYERS) return players;
  if (selfPlayer) {
    return [toMatchPlayer(selfPlayer)];
  }
  return [createSoloPlaceholderPlayer()];
}

export function pruneAutoSoloSavedPlayers<T extends Pick<
  AppData,
  'players' | 'groups' | 'templates' | 'selfPlayerId'
>>(data: T): T {
  const dropIds = new Set(
    data.players
      .filter(
        (player) =>
          player.name === SOLO_PLAYER_DEFAULT_NAME &&
          player.id !== data.selfPlayerId,
      )
      .map((player) => player.id),
  );
  if (dropIds.size === 0) return data;

  const selfPlayerId =
    data.selfPlayerId && dropIds.has(data.selfPlayerId)
      ? null
      : data.selfPlayerId ?? null;

  return {
    ...data,
    players: data.players.filter((player) => !dropIds.has(player.id)),
    groups: data.groups.map((group) => ({
      ...group,
      playerIds: group.playerIds.filter((id) => !dropIds.has(id)),
    })),
    templates: data.templates.map((template) => ({
      ...template,
      playerIds: template.playerIds.filter((id) => !dropIds.has(id)),
    })),
    selfPlayerId,
  };
}

export function formatPlayerLastUsed(timestamp: number): string {
  return `Último uso: ${formatRelativeDate(timestamp)}`;
}

const AVATAR_DARK_TEXT_COLORS = new Set([
  '#FFFFFF',
  '#FFFF00',
  '#00FFFF',
  '#00FF00',
]);

function normalizePlayerColor(color: string): string {
  return color.trim().toUpperCase();
}

export function getPlayerAvatarTextColor(color: string): string {
  return AVATAR_DARK_TEXT_COLORS.has(normalizePlayerColor(color))
    ? '#000000'
    : '#FFFFFF';
}

/** Asigna colores únicos de una paleta (p. ej. fichas de tren) sin repetir. */
export function assignUniquePlayerColors(
  players: Player[],
  palette: readonly { value: string }[],
): Player[] {
  const used = new Set<string>();
  const byUpper = new Map(
    palette.map((option) => [normalizePlayerColor(option.value), option.value]),
  );

  return players.map((player) => {
    const current = normalizePlayerColor(player.color);
    if (byUpper.has(current) && !used.has(current)) {
      used.add(current);
      return { ...player, color: byUpper.get(current) ?? player.color };
    }

    const next = palette.find(
      (option) => !used.has(normalizePlayerColor(option.value)),
    );
    if (!next) return player;
    used.add(normalizePlayerColor(next.value));
    return { ...player, color: next.value };
  });
}

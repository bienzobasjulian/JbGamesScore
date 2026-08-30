import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './constants';
import { AppData, Match, MatchTemplate, PlaySession, PlayerGroup, SavedPlayer } from './types';
import { createId, normalizeSettings } from './utils/game';
import { createMatch, initialAppData, pickPlayerColor } from './utils/match';
import { formatDefaultSessionName } from './utils/session';
import { normalizeMatchRounds } from './utils/rounds';

function normalizeAppData(raw: Partial<AppData> | null): AppData {
  const base = initialAppData();
  if (!raw) return base;
  return {
    players: Array.isArray(raw.players) ? raw.players : [],
    groups: Array.isArray(raw.groups)
      ? raw.groups
          .filter(
            (g): g is PlayerGroup =>
              g != null &&
              typeof g.id === 'string' &&
              typeof g.name === 'string',
          )
          .map((g) => ({
            id: g.id,
            name: g.name.trim() || 'Grupo sin nombre',
            playerIds: Array.isArray(g.playerIds)
              ? g.playerIds.filter((id) => typeof id === 'string')
              : [],
            createdAt: g.createdAt ?? Date.now(),
            updatedAt: g.updatedAt ?? Date.now(),
          }))
      : [],
    matches: Array.isArray(raw.matches)
      ? raw.matches.map((m) =>
          normalizeMatchRounds({
            ...m,
            name:
              typeof m.name === 'string' && m.name.trim()
                ? m.name.trim()
                : null,
            settings: normalizeSettings(m.settings),
            players: m.players ?? [],
            roundScoringMode: m.roundScoringMode ?? {},
            status: m.status === 'finished' ? 'finished' : 'in_progress',
            gameMode:
              m.gameMode === 'pelusas'
                ? 'pelusas'
                : m.gameMode === 'skull_king'
                  ? 'skull_king'
                  : m.gameMode === 'aventureros_tren'
                    ? 'aventureros_tren'
                    : 'standard',
            pelusasRevolution:
              m.gameMode === 'pelusas' ? Boolean(m.pelusasRevolution) : undefined,
            createdAt: m.createdAt ?? Date.now(),
            updatedAt: m.updatedAt ?? Date.now(),
            sessionId:
              typeof m.sessionId === 'string' ? m.sessionId : null,
            winnerOnly: Boolean(m.winnerOnly),
            winnerIds: Array.isArray(m.winnerIds)
              ? m.winnerIds.filter((id) => typeof id === 'string')
              : undefined,
          } as Match),
        )
      : [],
    templates: Array.isArray(raw.templates)
      ? raw.templates
          .filter(
            (t): t is MatchTemplate =>
              t != null &&
              typeof t.id === 'string' &&
              typeof t.name === 'string',
          )
          .map((t) => ({
            id: t.id,
            name: t.name.trim() || 'Plantilla sin nombre',
            settings: normalizeSettings(t.settings),
            playerIds: Array.isArray(t.playerIds)
              ? t.playerIds.filter((id) => typeof id === 'string')
              : [],
            createdAt: t.createdAt ?? Date.now(),
            updatedAt: t.updatedAt ?? Date.now(),
          }))
      : [],
    sessions: Array.isArray(raw.sessions)
      ? raw.sessions
          .filter(
            (s): s is PlaySession =>
              s != null &&
              typeof s.id === 'string' &&
              typeof s.name === 'string',
          )
          .map((s) => {
            const createdAt = s.createdAt ?? Date.now();
            return {
            id: s.id,
            name: s.name.trim() || formatDefaultSessionName(createdAt),
            status: s.status === 'closed' ? 'closed' : 'active',
            createdAt,
            updatedAt: s.updatedAt ?? Date.now(),
          };
          })
      : [],
  };
}

async function migrateLegacyGame(): Promise<AppData | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      players?: Match['players'];
      settings?: Match['settings'];
      isPlaying?: boolean;
      completedRounds?: Match['completedRounds'];
      currentRound?: Match['currentRound'];
    };
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);

    if (!parsed.players?.length) return null;

    const now = Date.now();
    const savedPlayers: SavedPlayer[] = parsed.players.map((p, i) => ({
      ...p,
      lastUsedAt: now - i,
    }));

    const legacyMatch: Match = {
      id: createId(),
      name: null,
      settings: normalizeSettings(parsed.settings),
      players: parsed.players,
      rounds: [],
      roundBreakdowns: [],
      activeRoundIndex: 0,
      completedRounds: parsed.completedRounds ?? [],
      currentRound: parsed.currentRound ?? {},
      currentRoundBreakdown: {},
      roundScoringMode: {},
      status: parsed.isPlaying ? 'in_progress' : 'finished',
      createdAt: now,
      updatedAt: now,
    };

    return {
      players: savedPlayers,
      groups: [],
      matches: [normalizeMatchRounds(legacyMatch)],
      templates: [],
      sessions: [],
    };
  } catch {
    return null;
  }
}

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeAppData(JSON.parse(raw) as Partial<AppData>);
    }
    const migrated = await migrateLegacyGame();
    if (migrated) {
      await saveAppData(migrated);
      return migrated;
    }
    return initialAppData();
  } catch {
    return initialAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createSavedPlayer(
  name: string,
  existing: SavedPlayer[],
): SavedPlayer {
  const trimmed = name.trim();
  return {
    id: createId(),
    name: trimmed,
    color: pickPlayerColor(existing),
    lastUsedAt: Date.now(),
  };
}

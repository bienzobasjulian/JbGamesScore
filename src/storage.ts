import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './constants';
import { AppData, GameState, Match, SavedPlayer } from './types';
import { createId, initialGameState, normalizeSettings } from './utils/game';
import { initialAppData, pickPlayerColor } from './utils/match';

function normalizeAppData(raw: Partial<AppData> | null): AppData {
  const base = initialAppData();
  if (!raw) return base;
  return {
    players: Array.isArray(raw.players) ? raw.players : [],
    matches: Array.isArray(raw.matches)
      ? raw.matches.map((m) => ({
          ...m,
          name:
            typeof m.name === 'string' && m.name.trim()
              ? m.name.trim()
              : null,
          settings: normalizeSettings(m.settings),
          players: m.players ?? [],
          completedRounds: m.completedRounds ?? [],
          currentRound: m.currentRound ?? {},
          status: m.status === 'finished' ? 'finished' : 'in_progress',
          createdAt: m.createdAt ?? Date.now(),
          updatedAt: m.updatedAt ?? Date.now(),
        }))
      : [],
  };
}

async function migrateLegacyGame(): Promise<AppData | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    const base = initialGameState();
    const state: GameState = {
      ...base,
      ...parsed,
      settings: normalizeSettings({ ...base.settings, ...parsed.settings }),
    };
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);

    if (state.players.length === 0) return null;

    const now = Date.now();
    const savedPlayers: SavedPlayer[] = state.players.map((p, i) => ({
      ...p,
      lastUsedAt: now - i,
    }));

    const matches: Match[] = [];
    if (state.isPlaying || state.completedRounds.length > 0) {
      const currentRound = { ...state.currentRound };
      state.players.forEach((p) => {
        if (currentRound[p.id] === undefined) currentRound[p.id] = 0;
      });
      matches.push({
        id: createId(),
        name: null,
        settings: state.settings,
        players: state.players,
        completedRounds: state.completedRounds,
        currentRound,
        status: state.isPlaying ? 'in_progress' : 'finished',
        createdAt: now,
        updatedAt: now,
      });
    }

    return { players: savedPlayers, matches };
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

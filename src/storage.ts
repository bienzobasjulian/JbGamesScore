import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from './constants';
import { GameState } from './types';
import { initialGameState, normalizeSettings } from './utils/game';

export async function loadGameState(): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return initialGameState();
    const parsed = JSON.parse(raw) as GameState;
    const base = initialGameState();
    return {
      ...base,
      ...parsed,
      settings: normalizeSettings({ ...base.settings, ...parsed.settings }),
    };
  } catch {
    return initialGameState();
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearGameState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

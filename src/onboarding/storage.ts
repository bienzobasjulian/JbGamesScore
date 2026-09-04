import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingState, TourId } from './types';

export const ONBOARDING_STORAGE_KEY = '@jbgamesscore/onboarding';
export const ONBOARDING_STATE_VERSION = 1;

const TOUR_IDS: TourId[] = [
  'home',
  'createMatch',
  'session',
  'match',
  'rounds',
  'pelusas',
  'skullKing',
  'piliPili',
  'flip7',
  'aventurerosSubmode',
  'aventurerosConstruccion',
  'aventurerosDestinos',
  'regicideSelect',
  'regicideCombat',
];

function isTourId(value: string): value is TourId {
  return TOUR_IDS.includes(value as TourId);
}

export function initialOnboardingState(): OnboardingState {
  return {
    version: ONBOARDING_STATE_VERSION,
    welcomeSeen: false,
    completedTours: [],
  };
}

export function normalizeOnboardingState(
  raw: Partial<OnboardingState> | null,
): OnboardingState {
  const base = initialOnboardingState();
  if (!raw || typeof raw !== 'object') return base;
  return {
    version: ONBOARDING_STATE_VERSION,
    welcomeSeen: Boolean(raw.welcomeSeen),
    completedTours: Array.isArray(raw.completedTours)
      ? raw.completedTours.filter(isTourId)
      : [],
  };
}

export async function loadOnboardingState(): Promise<OnboardingState> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return initialOnboardingState();
    return normalizeOnboardingState(JSON.parse(raw) as Partial<OnboardingState>);
  } catch {
    return initialOnboardingState();
  }
}

export async function saveOnboardingState(
  state: OnboardingState,
): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
}

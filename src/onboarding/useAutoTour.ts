import { useEffect } from 'react';
import type { TourId } from './types';
import { useOnboarding } from './useOnboarding';

type Options = {
  enabled?: boolean;
  delayMs?: number;
  skipStepIds?: string[];
};

export function useAutoTour(tourId: TourId, options?: Options) {
  const enabled = options?.enabled ?? true;
  const delayMs = options?.delayMs ?? 400;
  const skipStepIds = options?.skipStepIds;
  const { isReady, showWelcome, welcomeSeen, completedTours, activeTourId, startTour } =
    useOnboarding();

  useEffect(() => {
    if (!enabled || !isReady || showWelcome || !welcomeSeen) return;
    if (activeTourId) return;
    if (completedTours.includes(tourId)) return;
    const timer = setTimeout(
      () => startTour(tourId, { skipStepIds }),
      delayMs,
    );
    return () => clearTimeout(timer);
  }, [
    activeTourId,
    completedTours,
    delayMs,
    enabled,
    isReady,
    showWelcome,
    skipStepIds,
    startTour,
    tourId,
    welcomeSeen,
  ]);
}

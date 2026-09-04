import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  initialOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
} from './storage';
import { TOURS } from './tours';
import type {
  AnchorHandle,
  LayoutRect,
  OnboardingState,
  TourId,
  TourStep,
} from './types';

type StartTourOptions = {
  force?: boolean;
};

type OnboardingContextValue = {
  isReady: boolean;
  welcomeSeen: boolean;
  showWelcome: boolean;
  completedTours: TourId[];
  activeTourId: TourId | null;
  stepIndex: number;
  activeStep: TourStep | null;
  stepCount: number;
  openWelcome: () => void;
  dismissWelcome: (options?: { startHomeTour?: boolean }) => void;
  startTour: (id: TourId, options?: StartTourOptions) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  resetTour: (id: TourId) => void;
  resetAll: () => void;
  registerAnchor: (id: string, handle: AnchorHandle) => void;
  unregisterAnchor: (id: string) => void;
  getAnchorRect: (id: string) => Promise<LayoutRect | null>;
  focusAnchor: (id: string) => void;
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
);

type Props = {
  children: ReactNode;
};

export function OnboardingProvider({ children }: Props) {
  const [state, setState] = useState<OnboardingState>(initialOnboardingState);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTourId, setActiveTourId] = useState<TourId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const anchorsRef = useRef(new Map<string, AnchorHandle>());
  const persistRef = useRef(state);

  useEffect(() => {
    persistRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    loadOnboardingState().then((loaded) => {
      if (cancelled) return;
      setState(loaded);
      setShowWelcome(!loaded.welcomeSeen);
      setIsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: OnboardingState) => {
    setState(next);
    void saveOnboardingState(next);
  }, []);

  const markTourCompleted = useCallback(
    (id: TourId) => {
      const current = persistRef.current;
      if (current.completedTours.includes(id)) return;
      persist({
        ...current,
        completedTours: [...current.completedTours, id],
      });
    },
    [persist],
  );

  const closeActiveTour = useCallback(
    (complete: boolean) => {
      if (complete && activeTourId) {
        markTourCompleted(activeTourId);
      }
      setActiveTourId(null);
      setStepIndex(0);
    },
    [activeTourId, markTourCompleted],
  );

  const startTour = useCallback(
    (id: TourId, options?: StartTourOptions) => {
      const tour = TOURS[id];
      if (!tour?.steps.length) return;
      const alreadyDone = persistRef.current.completedTours.includes(id);
      if (alreadyDone && !options?.force) return;
      setShowWelcome(false);
      setActiveTourId(id);
      setStepIndex(0);
    },
    [],
  );

  const openWelcome = useCallback(() => {
    setActiveTourId(null);
    setStepIndex(0);
    setShowWelcome(true);
  }, []);

  const dismissWelcome = useCallback(
    (options?: { startHomeTour?: boolean }) => {
      const current = persistRef.current;
      const next = current.welcomeSeen
        ? current
        : { ...current, welcomeSeen: true };
      if (!current.welcomeSeen) {
        persist(next);
      }
      setShowWelcome(false);
      if (options?.startHomeTour && !next.completedTours.includes('home')) {
        setTimeout(() => startTour('home'), 450);
      }
    },
    [persist, startTour],
  );

  const nextStep = useCallback(() => {
    if (!activeTourId) return;
    const steps = TOURS[activeTourId].steps;
    if (stepIndex >= steps.length - 1) {
      closeActiveTour(true);
      return;
    }
    setStepIndex((index) => index + 1);
  }, [activeTourId, closeActiveTour, stepIndex]);

  const prevStep = useCallback(() => {
    setStepIndex((index) => Math.max(0, index - 1));
  }, []);

  const skipTour = useCallback(() => {
    closeActiveTour(true);
  }, [closeActiveTour]);

  const resetTour = useCallback(
    (id: TourId) => {
      const current = persistRef.current;
      persist({
        ...current,
        completedTours: current.completedTours.filter((tourId) => tourId !== id),
      });
    },
    [persist],
  );

  const resetAll = useCallback(() => {
    persist({
      ...persistRef.current,
      completedTours: [],
    });
    setActiveTourId(null);
    setStepIndex(0);
  }, [persist]);

  const registerAnchor = useCallback((id: string, handle: AnchorHandle) => {
    anchorsRef.current.set(id, handle);
  }, []);

  const unregisterAnchor = useCallback((id: string) => {
    anchorsRef.current.delete(id);
  }, []);

  const getAnchorRect = useCallback(async (id: string) => {
    const handle = anchorsRef.current.get(id);
    if (!handle) return null;
    return handle.measure();
  }, []);

  const focusAnchor = useCallback((id: string) => {
    anchorsRef.current.get(id)?.onFocus?.();
  }, []);

  const activeTour = activeTourId ? TOURS[activeTourId] : null;
  const activeStep = activeTour?.steps[stepIndex] ?? null;
  const stepCount = activeTour?.steps.length ?? 0;

  const value = useMemo<OnboardingContextValue>(
    () => ({
      isReady,
      welcomeSeen: state.welcomeSeen,
      showWelcome,
      completedTours: state.completedTours,
      activeTourId,
      stepIndex,
      activeStep,
      stepCount,
      openWelcome,
      dismissWelcome,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      resetTour,
      resetAll,
      registerAnchor,
      unregisterAnchor,
      getAnchorRect,
      focusAnchor,
    }),
    [
      activeStep,
      activeTourId,
      dismissWelcome,
      focusAnchor,
      getAnchorRect,
      isReady,
      nextStep,
      openWelcome,
      prevStep,
      registerAnchor,
      resetAll,
      resetTour,
      showWelcome,
      skipTour,
      startTour,
      state.completedTours,
      state.welcomeSeen,
      stepCount,
      stepIndex,
      unregisterAnchor,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

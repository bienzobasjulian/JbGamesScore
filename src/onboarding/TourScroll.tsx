import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from 'react-native';
import { computeTourScrollDelta, measureInWindow } from './tourLayout';
import type { LayoutRect } from './types';

type TourScrollApi = {
  ensureVisible: (measure: () => Promise<LayoutRect | null>) => Promise<void>;
};

const TourScrollContext = createContext<TourScrollApi | null>(null);

export function useTourScroll() {
  return useContext(TourScrollContext);
}

type ProviderProps = {
  children: ReactNode;
  measureViewport: () => Promise<LayoutRect | null>;
  scrollBy: (deltaY: number) => void;
};

export function TourScrollProvider({
  children,
  measureViewport,
  scrollBy,
}: ProviderProps) {
  const api = useMemo<TourScrollApi>(
    () => ({
      ensureVisible: async (measure) => {
        const [anchor, viewport] = await Promise.all([
          measure(),
          measureViewport(),
        ]);
        if (!anchor || !viewport) return;
        const delta = computeTourScrollDelta(anchor, viewport);
        if (Math.abs(delta) < 4) return;
        scrollBy(delta);
        await new Promise((resolve) => setTimeout(resolve, 280));
      },
    }),
    [measureViewport, scrollBy],
  );

  return (
    <TourScrollContext.Provider value={api}>
      {children}
    </TourScrollContext.Provider>
  );
}

export const TourScrollView = forwardRef<ScrollView, ScrollViewProps>(
  function TourScrollView({ onScroll, children, ...props }, ref) {
    const innerRef = useRef<ScrollView>(null);
    const offsetRef = useRef(0);

    const setRef = useCallback(
      (node: ScrollView | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const measureViewport = useCallback(
      () => measureInWindow(innerRef.current),
      [],
    );

    const scrollBy = useCallback((deltaY: number) => {
      innerRef.current?.scrollTo({
        y: Math.max(0, offsetRef.current + deltaY),
        animated: true,
      });
    }, []);

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        offsetRef.current = event.nativeEvent.contentOffset.y;
        onScroll?.(event);
      },
      [onScroll],
    );

    return (
      <TourScrollProvider measureViewport={measureViewport} scrollBy={scrollBy}>
        <ScrollView
          {...props}
          ref={setRef}
          onScroll={handleScroll}
          scrollEventThrottle={props.scrollEventThrottle ?? 16}
        >
          {children}
        </ScrollView>
      </TourScrollProvider>
    );
  },
);

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  Pressable,
} from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  TOUR_HIGHLIGHT_PAD,
  measureInWindow,
  toLocalRect,
} from './tourLayout';
import type { LayoutRect } from './types';
import { useOnboarding } from './useOnboarding';

const TOOLTIP_INSET = 20;
const TOOLTIP_GAP = 14;
const ARROW_W = 22;
const ARROW_H = 12;
const ARROW_CORNER_PAD = 18;

export function SpotlightTour() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {
    activeStep,
    stepIndex,
    stepCount,
    nextStep,
    prevStep,
    skipTour,
    getAnchorRect,
    focusAnchor,
  } = useOnboarding();

  const overlayRef = useRef<View>(null);
  const [rect, setRect] = useState<LayoutRect | null>(null);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [tooltipHeight, setTooltipHeight] = useState(200);

  useEffect(() => {
    if (!activeStep) {
      setRect(null);
      return;
    }

    if (activeStep.anchorId) {
      focusAnchor(activeStep.anchorId);
    }

    let cancelled = false;
    let attempts = 0;

    const tryMeasure = () => {
      if (!activeStep.anchorId) {
        setRect(null);
        return;
      }
      void Promise.all([
        getAnchorRect(activeStep.anchorId),
        measureInWindow(overlayRef.current),
      ]).then(([next, origin]) => {
        if (cancelled) return;
        if (next && origin) {
          setRect(toLocalRect(next, origin));
        } else if (next) {
          setRect(next);
        }
        if (attempts < 16) {
          attempts += 1;
          setTimeout(tryMeasure, 80);
        }
      });
    };

    setRect(null);
    const timer = setTimeout(tryMeasure, 420);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeStep, focusAnchor, getAnchorRect]);

  useEffect(() => {
    if (!activeStep || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      skipTour();
      return true;
    });
    return () => sub.remove();
  }, [activeStep, skipTour]);

  const highlight = useMemo(() => {
    if (!rect) return null;
    return {
      x: Math.max(8, rect.x - TOUR_HIGHLIGHT_PAD),
      y: Math.max(8, rect.y - TOUR_HIGHLIGHT_PAD),
      width: rect.width + TOUR_HIGHLIGHT_PAD * 2,
      height: rect.height + TOUR_HIGHLIGHT_PAD * 2,
    };
  }, [rect]);

  const bottomSafe = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 20 : 8,
  );
  const topSafe = Math.max(insets.top, 8);

  const tooltipTop = useMemo(() => {
    const minTop = topSafe + 8;
    const maxTop = Math.max(
      minTop,
      overlaySize.height - bottomSafe - tooltipHeight - 8,
    );
    if (!highlight || overlaySize.height <= 0) {
      return Math.max(minTop, overlaySize.height * 0.28);
    }
    const below = highlight.y + highlight.height + TOOLTIP_GAP;
    const above = highlight.y - tooltipHeight - TOOLTIP_GAP;
    if (below <= maxTop) return below;
    if (above >= minTop) return above;
    return below - maxTop <= minTop - above ? maxTop : minTop;
  }, [bottomSafe, highlight, overlaySize.height, tooltipHeight, topSafe]);

  const arrowPointsUp =
    !highlight || tooltipTop >= highlight.y + highlight.height * 0.5;

  const arrowLeft = useMemo(() => {
    const tooltipWidth = Math.max(0, overlaySize.width - TOOLTIP_INSET * 2);
    const min = ARROW_CORNER_PAD;
    const max = Math.max(min, tooltipWidth - ARROW_CORNER_PAD - ARROW_W);
    if (!highlight || tooltipWidth <= 0) {
      return tooltipWidth / 2 - ARROW_W / 2;
    }
    const center = highlight.x + highlight.width / 2 - TOOLTIP_INSET;
    return Math.max(min, Math.min(max, center - ARROW_W / 2));
  }, [highlight, overlaySize.width]);

  if (!activeStep) return null;

  const isLast = stepIndex >= stepCount - 1;
  const isFirst = stepIndex === 0;

  return (
    <GestureHandlerRootView style={styles.overlay} pointerEvents="auto">
      <View
        ref={overlayRef}
        collapsable={false}
        style={styles.root}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setOverlaySize({ width, height });
        }}
        onStartShouldSetResponder={() => true}
      >
        {highlight ? (
          <>
            <View
              style={[
                styles.dim,
                { left: 0, top: 0, right: 0, height: highlight.y },
              ]}
            />
            <View
              style={[
                styles.dim,
                {
                  left: 0,
                  top: highlight.y,
                  width: highlight.x,
                  height: highlight.height,
                },
              ]}
            />
            <View
              style={[
                styles.dim,
                {
                  left: highlight.x + highlight.width,
                  top: highlight.y,
                  right: 0,
                  height: highlight.height,
                },
              ]}
            />
            <View
              style={[
                styles.dim,
                {
                  left: 0,
                  top: highlight.y + highlight.height,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.hole,
                {
                  left: highlight.x,
                  top: highlight.y,
                  width: highlight.width,
                  height: highlight.height,
                  borderColor: theme.accent,
                },
              ]}
            />
          </>
        ) : (
          <View style={[styles.dim, StyleSheet.absoluteFill]} />
        )}

        <View
          style={[styles.tooltipWrap, { top: tooltipTop }]}
          onLayout={(event) => {
            setTooltipHeight(event.nativeEvent.layout.height);
          }}
        >
          {highlight ? (
            <TourBubbleArrow
              direction={arrowPointsUp ? 'up' : 'down'}
              left={arrowLeft}
              fill={theme.surface}
              stroke={theme.border}
            />
          ) : null}
          <View style={styles.tooltip}>
            <Text style={styles.stepLabel}>
              {stepIndex + 1} / {stepCount}
            </Text>
            <Text style={styles.title}>{activeStep.title}</Text>
            <Text style={styles.body}>{activeStep.body}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={skipTour}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.textBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.skipLabel}>Saltar</Text>
              </Pressable>
              <View style={styles.nav}>
                {!isFirst ? (
                  <Pressable
                    onPress={prevStep}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.secondaryLabel}>Atrás</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={nextStep}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.primaryLabel}>
                    {isLast ? 'Entendido' : 'Siguiente'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

function TourBubbleArrow({
  direction,
  left,
  fill,
  stroke,
}: {
  direction: 'up' | 'down';
  left: number;
  fill: string;
  stroke: string;
}) {
  const pointingUp = direction === 'up';
  const tipY = pointingUp ? 1 : ARROW_H - 1;
  const baseY = pointingUp ? ARROW_H : 0;
  const d = `M1 ${baseY} L${ARROW_W / 2} ${tipY} L${ARROW_W - 1} ${baseY}`;

  return (
    <Svg
      pointerEvents="none"
      width={ARROW_W}
      height={ARROW_H}
      style={[
        {
          position: 'absolute',
          left,
          zIndex: 3,
        },
        pointingUp ? { top: -ARROW_H + 2 } : { bottom: -ARROW_H + 2 },
      ]}
    >
      <Path d={`${d} Z`} fill={fill} />
      <Path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10000,
      elevation: 10000,
      backgroundColor: 'transparent',
    },
    root: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    dim: {
      position: 'absolute',
      backgroundColor: 'rgba(0,0,0,0.72)',
    },
    hole: {
      position: 'absolute',
      borderRadius: 16,
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    tooltipWrap: {
      position: 'absolute',
      left: TOOLTIP_INSET,
      right: TOOLTIP_INSET,
      zIndex: 2,
      overflow: 'visible',
    },
    tooltip: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 8,
      zIndex: 1,
    },
    stepLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.accent,
      letterSpacing: 0.4,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    body: {
      fontSize: 15,
      lineHeight: 21,
      color: theme.textMuted,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      gap: 12,
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    textBtn: {
      paddingVertical: 8,
      paddingRight: 8,
    },
    skipLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textMuted,
    },
    secondaryBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    primaryBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: theme.accent,
    },
    primaryLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.onAccent,
    },
    pressed: {
      opacity: 0.85,
    },
  });

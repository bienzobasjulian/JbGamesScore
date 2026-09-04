import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import type { LayoutRect } from './types';
import { useOnboarding } from './useOnboarding';

const HIGHLIGHT_PAD = 6;
const TOOLTIP_GAP = 12;
const TOOLTIP_ESTIMATE = 220;

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

  const [rect, setRect] = useState<LayoutRect | null>(null);
  const [windowSize, setWindowSize] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWindowSize(window);
    });
    return () => sub.remove();
  }, []);

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
      void getAnchorRect(activeStep.anchorId).then((next) => {
        if (cancelled) return;
        if (next) {
          setRect(next);
          return;
        }
        if (attempts < 12) {
          attempts += 1;
          setTimeout(tryMeasure, 70);
          return;
        }
        setRect(null);
      });
    };

    const timer = setTimeout(tryMeasure, 120);
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
      x: Math.max(8, rect.x - HIGHLIGHT_PAD),
      y: Math.max(8, rect.y - HIGHLIGHT_PAD),
      width: rect.width + HIGHLIGHT_PAD * 2,
      height: rect.height + HIGHLIGHT_PAD * 2,
    };
  }, [rect]);

  const tooltipTop = useMemo(() => {
    const maxTop =
      windowSize.height - insets.bottom - TOOLTIP_ESTIMATE - 16;
    if (!highlight) {
      return Math.max(insets.top + 24, windowSize.height * 0.32);
    }
    const below = highlight.y + highlight.height + TOOLTIP_GAP;
    const above = highlight.y - TOOLTIP_ESTIMATE - TOOLTIP_GAP;
    const spaceBelow = windowSize.height - insets.bottom - below;
    if (spaceBelow >= TOOLTIP_ESTIMATE) return below;
    if (above >= insets.top + 8) return Math.max(insets.top + 8, above);
    return Math.min(Math.max(insets.top + 16, below), maxTop);
  }, [highlight, insets.bottom, insets.top, windowSize.height]);

  if (!activeStep) return null;

  const isLast = stepIndex >= stepCount - 1;
  const isFirst = stepIndex === 0;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={skipTour}
    >
      <View style={styles.root} pointerEvents="box-none">
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
          style={[
            styles.tooltip,
            {
              top: tooltipTop,
              marginLeft: 20 + insets.left,
              marginRight: 20 + insets.right,
            },
          ]}
        >
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
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
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
    tooltip: {
      position: 'absolute',
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 8,
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

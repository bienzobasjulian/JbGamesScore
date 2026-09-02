import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  color?: string;
  max?: number;
  /** Sin tope superior; solo evita negativos. La validación queda fuera del input. */
  unbounded?: boolean;
  isValueAllowed?: (value: number) => boolean;
};

function floorCount(value: number): number {
  return Math.max(0, Math.floor(value));
}

function clampCount(value: number, max: number): number {
  return Math.min(floorCount(value), max);
}

function isAllowed(
  value: number,
  max: number | null,
  unbounded: boolean,
  isValueAllowed?: (value: number) => boolean,
): boolean {
  if (value < 0) return false;
  if (!unbounded && max != null && value > max) return false;
  return isValueAllowed == null || isValueAllowed(value);
}

function resolveCount(
  value: number,
  max: number | null,
  unbounded: boolean,
  isValueAllowed?: (value: number) => boolean,
): number {
  const resolved = unbounded ? floorCount(value) : clampCount(value, max ?? 99);
  if (isAllowed(resolved, max, unbounded, isValueAllowed)) {
    return resolved;
  }
  return resolved;
}

function findStepValue(
  base: number,
  delta: number,
  max: number | null,
  unbounded: boolean,
  isValueAllowed?: (value: number) => boolean,
): number | null {
  let next = base + delta;
  while (next >= 0 && (unbounded || max == null || next <= max)) {
    if (isAllowed(next, max, unbounded, isValueAllowed)) {
      return next;
    }
    next += delta;
  }
  return null;
}

function tryParseCount(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function CardCountStepper({
  value,
  onChange,
  color,
  max = 99,
  unbounded = false,
  isValueAllowed,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const accentColor = color ?? theme.accent;

  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const textRef = useRef(text);
  const focusedRef = useRef(focused);
  const effectiveMax = unbounded ? null : max;
  const maxLength = unbounded ? 3 : Math.max(2, String(max).length);

  textRef.current = text;
  focusedRef.current = focused;

  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  useEffect(() => {
    return () => {
      if (focusedRef.current) {
        const trimmed = textRef.current.trim();
        const parsed = trimmed === '' ? 0 : parseInt(trimmed, 10);
        const next = resolveCount(
          Number.isNaN(parsed) ? 0 : parsed,
          effectiveMax,
          unbounded,
          isValueAllowed,
        );
        if (isAllowed(next, effectiveMax, unbounded, isValueAllowed)) {
          onChange(next);
        }
      }
    };
  }, [effectiveMax, onChange, isValueAllowed, unbounded]);

  const commit = () => {
    const trimmed = text.trim();
    const parsed = trimmed === '' ? 0 : parseInt(trimmed, 10);
    const next = resolveCount(
      Number.isNaN(parsed) ? 0 : parsed,
      effectiveMax,
      unbounded,
      isValueAllowed,
    );
    if (isAllowed(next, effectiveMax, unbounded, isValueAllowed)) {
      onChange(next);
      setText(String(next));
    } else {
      setText(String(value));
    }
    setFocused(false);
  };

  const handleChangeText = (next: string) => {
    setText(next);
    const parsed = tryParseCount(next);
    if (parsed !== null) {
      const resolved = resolveCount(
        parsed,
        effectiveMax,
        unbounded,
        isValueAllowed,
      );
      if (isAllowed(resolved, effectiveMax, unbounded, isValueAllowed)) {
        onChange(resolved);
      }
    }
  };

  const handleAdjust = (delta: number) => {
    const base = focused
      ? unbounded
        ? Math.max(0, parseInt(text, 10) || 0)
        : clampCount(parseInt(text, 10) || 0, max)
      : value;
    const next = findStepValue(
      base,
      delta,
      effectiveMax,
      unbounded,
      isValueAllowed,
    );
    if (next == null) return;
    onChange(next);
    setText(String(next));
  };

  const canDecrease =
    findStepValue(value, -1, effectiveMax, unbounded, isValueAllowed) != null;
  const canIncrease =
    findStepValue(value, 1, effectiveMax, unbounded, isValueAllowed) != null;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => handleAdjust(-1)}
        disabled={!canDecrease}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: accentColor },
          !canDecrease && styles.btnDisabled,
          pressed && canDecrease && styles.pressed,
        ]}
      >
        <Text style={[styles.btnText, { color: accentColor }]}>−</Text>
      </Pressable>

      <TextInput
        style={[styles.input, focused && { borderColor: accentColor }]}
        value={text}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        returnKeyType="done"
        selectTextOnFocus
        maxLength={maxLength}
      />

      <Pressable
        onPress={() => handleAdjust(1)}
        disabled={!canIncrease}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: accentColor },
          !canIncrease && styles.btnDisabled,
          pressed && canIncrease && styles.pressed,
        ]}
      >
        <Text style={[styles.btnText, { color: accentColor }]}>+</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceLight,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.8,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    width: 44,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bg,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    padding: 0,
  },
});

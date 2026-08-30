import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  value: number;
  onChange: (value: number) => void;
  color?: string;
  max?: number;
};

function clampCount(value: number, max: number): number {
  const n = Math.max(0, Math.floor(value));
  return Math.min(n, max);
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
  color = theme.accent,
  max = 99,
}: Props) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const textRef = useRef(text);
  const focusedRef = useRef(focused);
  const maxLength = Math.max(2, String(max).length);

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
        const next = clampCount(Number.isNaN(parsed) ? 0 : parsed, max);
        onChange(next);
      }
    };
  }, [max, onChange]);

  const commit = () => {
    const trimmed = text.trim();
    const parsed = trimmed === '' ? 0 : parseInt(trimmed, 10);
    const next = clampCount(Number.isNaN(parsed) ? 0 : parsed, max);
    onChange(next);
    setText(String(next));
    setFocused(false);
  };

  const handleChangeText = (next: string) => {
    setText(next);
    const parsed = tryParseCount(next);
    if (parsed !== null) {
      onChange(clampCount(parsed, max));
    }
  };

  const handleAdjust = (delta: number) => {
    const base = focused ? clampCount(parseInt(text, 10) || 0, max) : value;
    const next = clampCount(base + delta, max);
    onChange(next);
    setText(String(next));
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => handleAdjust(-1)}
        disabled={value <= 0}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: color },
          value <= 0 && styles.btnDisabled,
          pressed && value > 0 && styles.pressed,
        ]}
      >
        <Text style={[styles.btnText, { color }]}>−</Text>
      </Pressable>

      <TextInput
        style={[styles.input, focused && { borderColor: color }]}
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
        disabled={value >= max}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: color },
          value >= max && styles.btnDisabled,
          pressed && value < max && styles.pressed,
        ]}
      >
        <Text style={[styles.btnText, { color }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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

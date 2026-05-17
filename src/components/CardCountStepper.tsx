import { useEffect, useState } from 'react';
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

export function CardCountStepper({
  value,
  onChange,
  color = theme.accent,
  max = 99,
}: Props) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  const commit = () => {
    const trimmed = text.trim();
    const parsed = trimmed === '' ? 0 : parseInt(trimmed, 10);
    const next = clampCount(Number.isNaN(parsed) ? 0 : parsed, max);
    onChange(next);
    setText(String(next));
    setFocused(false);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(clampCount(value - 1, max))}
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
        onChangeText={setText}
        onFocus={() => setFocused(true)}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        returnKeyType="done"
        selectTextOnFocus
        maxLength={2}
      />

      <Pressable
        onPress={() => onChange(clampCount(value + 1, max))}
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

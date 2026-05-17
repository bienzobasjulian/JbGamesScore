import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../constants';

type Props = {
  value: number;
  onAdjust: (delta: number) => void;
  onSetValue: (value: number) => void;
  color: string;
  disabled?: boolean;
};

function parseScore(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '+') return 0;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function ScoreStepper({
  value,
  onAdjust,
  onSetValue,
  color,
  disabled,
}: Props) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  const commitValue = () => {
    const num = parseScore(text);
    onSetValue(num);
    setText(String(num));
    setFocused(false);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onAdjust(-1)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          { borderColor: color },
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={[styles.btnText, { color }]}>−</Text>
      </Pressable>

      <TextInput
        style={[
          styles.input,
          focused && { borderColor: color },
          value < 0 && !focused && styles.negative,
          disabled && styles.disabled,
        ]}
        value={text}
        onChangeText={setText}
        onFocus={() => setFocused(true)}
        onBlur={commitValue}
        onSubmitEditing={commitValue}
        keyboardType="number-pad"
        returnKeyType="done"
        selectTextOnFocus
        editable={!disabled}
        maxLength={6}
      />

      <Pressable
        onPress={() => onAdjust(1)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          styles.btnPlus,
          { backgroundColor: color },
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={styles.btnTextPlus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPlus: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  btnTextPlus: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 24,
  },
  input: {
    width: 64,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  negative: {
    color: theme.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
  },
});

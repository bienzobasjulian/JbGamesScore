import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../constants';
import { formatBreakdownItem } from '../utils/scoring';

type Props = {
  items: number[];
  total: number;
  color: string;
  disabled?: boolean;
  onAdd: (value: number) => void;
  onRemove: (index: number) => void;
};

function parsePoints(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '+') return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function BreakdownEditor({
  items,
  total,
  color,
  disabled,
  onAdd,
  onRemove,
}: Props) {
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const value = parsePoints(draft);
    if (value === null) return;
    onAdd(value);
    setDraft('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total ronda</Text>
        <Text style={[styles.totalValue, total < 0 && styles.negative]}>
          {total > 0 ? `+${total}` : total}
        </Text>
      </View>

      {items.length > 0 ? (
        <View style={styles.chips}>
          {items.map((value, index) => (
            <View
              key={`${index}-${value}`}
              style={[styles.chip, { borderColor: color + '66' }]}
            >
              <Text
                style={[styles.chipValue, value < 0 && styles.negative]}
              >
                {formatBreakdownItem(value)}
              </Text>
              {!disabled && (
                <Pressable
                  onPress={() => onRemove(index)}
                  hitSlop={8}
                  style={styles.chipRemove}
                >
                  <Text style={styles.chipRemoveText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.hint}>
          Añade cada sumando (ej. 7, 7, 5, 6…)
        </Text>
      )}

      {!disabled && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Puntos"
            placeholderTextColor={theme.textMuted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={handleAdd}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={5}
          />
          <Pressable
            onPress={handleAdd}
            disabled={parsePoints(draft) === null}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: color },
              parsePoints(draft) === null && styles.addBtnDisabled,
              pressed && parsePoints(draft) !== null && styles.pressed,
            ]}
          >
            <Text style={styles.addBtnText}>Añadir</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.accent,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: theme.surfaceLight,
  },
  chipValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  chipRemove: {
    padding: 2,
  },
  chipRemoveText: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    width: 72,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    paddingHorizontal: 4,
  },
  addBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  addBtnDisabled: {
    opacity: 0.45,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
  },
  negative: {
    color: theme.danger,
  },
});

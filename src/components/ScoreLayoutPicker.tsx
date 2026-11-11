import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { ScoreLayout, ScoreRoundOrder, ScoreTileWidth } from '../types';

const OPTIONS: { id: ScoreLayout; label: string }[] = [
  { id: 'cards', label: 'Tarjetas' },
  { id: 'table', label: 'Tabla' },
  { id: 'big', label: 'Marcador' },
];

type Props = {
  value: ScoreLayout;
  onChange: (layout: ScoreLayout) => void;
};

export function ScoreLayoutPicker({ value, onChange }: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type WidthProps = {
  value: ScoreTileWidth;
  onChange: (width: ScoreTileWidth) => void;
};

const WIDTHS: { id: ScoreTileWidth; label: string }[] = [
  { id: 'full', label: '100%' },
  { id: 'half', label: '50%' },
];

export function ScoreTileWidthPicker({ value, onChange }: WidthProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      {WIDTHS.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type OrderProps = {
  value: ScoreRoundOrder;
  onChange: (order: ScoreRoundOrder) => void;
};

const ORDERS: { id: ScoreRoundOrder; label: string }[] = [
  { id: 'asc', label: 'Ascendente' },
  { id: 'desc', label: 'Descendente' },
];

export function ScoreRoundOrderPicker({ value, onChange }: OrderProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      {ORDERS.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    option: {
      flexGrow: 1,
      flexBasis: 0,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    optionSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.accent,
    },
    label: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    labelSelected: {
      color: theme.onAccent,
    },
  });

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { ScoringMode } from '../types';
import { BreakdownEditor } from './BreakdownEditor';
import { ScoreStepper } from './ScoreStepper';

type Props = {
  roundScore: number;
  breakdownItems: number[];
  mode: ScoringMode;
  color: string;
  disabled?: boolean;
  onModeChange: (mode: ScoringMode) => void;
  onAdjust: (delta: number) => void;
  onSetScore: (value: number) => void;
  onAddBreakdownItem: (value: number) => void;
  onRemoveBreakdownItem: (index: number) => void;
};

export function RoundScoringPanel({
  roundScore,
  breakdownItems,
  mode,
  color,
  disabled,
  onModeChange,
  onAdjust,
  onSetScore,
  onAddBreakdownItem,
  onRemoveBreakdownItem,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => onModeChange('direct')}
          disabled={disabled}
          style={({ pressed }) => [
            styles.modeBtn,
            mode === 'direct' && styles.modeBtnActive,
            pressed && styles.modeBtnPressed,
          ]}
        >
          <Text
            style={[
              styles.modeLabel,
              mode === 'direct' && styles.modeLabelActive,
            ]}
          >
            Directo
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onModeChange('breakdown')}
          disabled={disabled}
          style={({ pressed }) => [
            styles.modeBtn,
            mode === 'breakdown' && styles.modeBtnActive,
            pressed && styles.modeBtnPressed,
          ]}
        >
          <Text
            style={[
              styles.modeLabel,
              mode === 'breakdown' && styles.modeLabelActive,
            ]}
          >
            Desglose
          </Text>
        </Pressable>
      </View>

      {mode === 'direct' ? (
        <ScoreStepper
          value={roundScore}
          onAdjust={onAdjust}
          onSetValue={onSetScore}
          color={color}
          disabled={disabled}
        />
      ) : (
        <BreakdownEditor
          items={breakdownItems}
          total={roundScore}
          color={color}
          disabled={disabled}
          onAdd={onAddBreakdownItem}
          onRemove={onRemoveBreakdownItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: 10,
    minWidth: 0,
    alignItems: 'stretch',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-end',
  },
  modeBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
  },
  modeBtnActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '22',
  },
  modeBtnPressed: {
    opacity: 0.8,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  modeLabelActive: {
    color: theme.accent,
    fontWeight: '700',
  },
});

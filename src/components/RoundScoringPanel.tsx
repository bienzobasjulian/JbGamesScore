import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { ScoreCalculatorSheet } from './ScoreCalculatorSheet';

type Props = {
  roundScore: number;
  breakdownItems: number[];
  color: string;
  disabled?: boolean;
  onSetScore: (value: number) => void;
  onSetBreakdown: (items: number[]) => void;
  onSheetOpenChange?: (open: boolean) => void;
};

export function RoundScoringPanel({
  roundScore,
  breakdownItems,
  color,
  disabled,
  onSetScore,
  onSetBreakdown,
  onSheetOpenChange,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasFormula = breakdownItems.length > 0;

  useEffect(() => {
    onSheetOpenChange?.(sheetOpen);
  }, [onSheetOpenChange, sheetOpen]);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setSheetOpen(true)}
        style={({ pressed }) => [
          styles.calcBtn,
          (sheetOpen || hasFormula) && {
            backgroundColor: color + '33',
            borderColor: color,
          },
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel="Calculadora de puntos"
      >
        <CalculatorIcon
          color={sheetOpen || hasFormula ? color : theme.textMuted}
        />
      </Pressable>

      <ScoreCalculatorSheet
        visible={sheetOpen}
        roundScore={roundScore}
        items={breakdownItems}
        onClose={() => setSheetOpen(false)}
        onSetScore={onSetScore}
        onSetBreakdown={onSetBreakdown}
      />
    </>
  );
}

function CalculatorIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={2.5}
        width={16}
        height={19}
        rx={2.2}
        stroke={color}
        strokeWidth={1.7}
      />
      <Rect x={7} y={5.2} width={10} height={3.2} rx={0.6} fill={color} />
      <Circle cx={8.2} cy={12.2} r={1.05} fill={color} />
      <Circle cx={12} cy={12.2} r={1.05} fill={color} />
      <Circle cx={15.8} cy={12.2} r={1.05} fill={color} />
      <Circle cx={8.2} cy={16} r={1.05} fill={color} />
      <Circle cx={12} cy={16} r={1.05} fill={color} />
      <Circle cx={15.8} cy={16} r={1.05} fill={color} />
      <Circle cx={8.2} cy={19.2} r={1.05} fill={color} />
      <Circle cx={12} cy={19.2} r={1.05} fill={color} />
    </Svg>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    calcBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.75,
    },
  });

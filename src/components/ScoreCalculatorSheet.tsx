import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  formatBreakdownExpression,
  formatScoreNumber,
} from '../utils/scoring';

type Props = {
  visible: boolean;
  roundScore: number;
  items: number[];
  onClose: () => void;
  onSetScore: (value: number) => void;
  onSetBreakdown: (items: number[]) => void;
};

type EvalResult = {
  items: number[];
  total: number;
  complete: boolean;
};

function evaluateExpression(expr: string): EvalResult | null {
  const trimmed = expr.trim();
  if (!trimmed) return { items: [], total: 0, complete: true };

  const complete = !/[+-]$/.test(trimmed);
  const body = trimmed.replace(/[+-]$/, '').replace(/,/g, '.');
  if (!body || body === '-') return { items: [], total: 0, complete: false };

  const matches = body.match(/[+-]?(?:\d+\.?\d*|\.\d+)/g);
  if (!matches || matches.join('') !== body) return null;

  const items = matches.map((token) => Number(token));
  if (items.some((value) => !Number.isFinite(value))) return null;
  const total = Math.round(items.reduce((sum, value) => sum + value, 0) * 1000) / 1000;
  return { items, total, complete };
}

export function ScoreCalculatorSheet({
  visible,
  roundScore,
  items,
  onClose,
  onSetScore,
  onSetBreakdown,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const bottomInset = useSheetBottomInset();
  const [expr, setExpr] = useState('');

  useEffect(() => {
    if (!visible) return;
    setExpr(
      items.length > 0
        ? formatBreakdownExpression(items)
        : formatScoreNumber(roundScore),
    );
    // La expresión se inicializa solo al abrir; si no, un re-render la pisa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const result = useMemo(() => evaluateExpression(expr), [expr]);

  const display = expr || '0';
  const showTotal =
    Boolean(result?.complete) && /[+-]/.test(expr.replace(/^-/, ''));

  const appendDigit = (digit: string) => {
    setExpr((current) => {
      if (current === '0') return digit;
      if (current === '-0') return `-${digit}`;
      if (current.replace(/[+-]/g, '').length >= 18) return current;
      return current + digit;
    });
  };

  const appendComma = () => {
    setExpr((current) => {
      const chunk = current.split(/[+-]/).pop() ?? '';
      if (chunk.includes(',')) return current;
      if (!chunk) return `${current}0,`;
      return `${current},`;
    });
  };

  const appendOperator = (op: '+' | '-') => {
    setExpr((current) => {
      if (!current) return op === '-' ? '-' : current;
      if (/[+-]$/.test(current)) return current.slice(0, -1) + op;
      return current + op;
    });
  };

  const handleConfirm = () => {
    if (!result || !result.complete) return;
    const hasOperation = /[+-]/.test(expr.replace(/^-/, ''));
    if (hasOperation && result.items.length > 1) {
      onSetBreakdown(result.items);
    } else {
      onSetScore(result.total);
    }
    onClose();
  };

  const rows: ({
    label: string;
    onPress: () => void;
    kind?: 'op' | 'action';
  } | null)[][] = [
    [
      { label: '1', onPress: () => appendDigit('1') },
      { label: '2', onPress: () => appendDigit('2') },
      { label: '3', onPress: () => appendDigit('3') },
      { label: '+', onPress: () => appendOperator('+'), kind: 'op' },
    ],
    [
      { label: '4', onPress: () => appendDigit('4') },
      { label: '5', onPress: () => appendDigit('5') },
      { label: '6', onPress: () => appendDigit('6') },
      { label: '−', onPress: () => appendOperator('-'), kind: 'op' },
    ],
    [
      { label: '7', onPress: () => appendDigit('7') },
      { label: '8', onPress: () => appendDigit('8') },
      { label: '9', onPress: () => appendDigit('9') },
      { label: 'AC', onPress: () => setExpr(''), kind: 'action' },
    ],
    [
      { label: ',', onPress: appendComma },
      { label: '0', onPress: () => appendDigit('0') },
      {
        label: '⌫',
        onPress: () => setExpr((current) => current.slice(0, -1)),
        kind: 'action',
      },
      null,
    ],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 16 + bottomInset }]}>
          <View style={styles.handle} />
          <Text style={styles.display} numberOfLines={2}>
            {showTotal && result ? (
              <>
                {expr}
                <Text style={styles.displayArrow}>{'  →  '}</Text>
                <Text style={styles.displayTotal}>
                  {formatScoreNumber(result.total)}
                </Text>
              </>
            ) : (
              display
            )}
          </Text>
          <View style={styles.grid}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((key, keyIndex) =>
                  key ? (
                    <Pressable
                      key={key.label}
                      onPress={key.onPress}
                      style={({ pressed }) => [
                        styles.key,
                        key.kind === 'op' && styles.keyOp,
                        pressed && styles.keyPressed,
                      ]}
                    >
                      {key.label === '⌫' ? (
                        <BackspaceIcon color={theme.text} />
                      ) : (
                        <Text
                          style={[
                            styles.keyLabel,
                            key.kind === 'op' && styles.keyLabelOp,
                            key.kind === 'action' && styles.keyLabelAction,
                          ]}
                        >
                          {key.label}
                        </Text>
                      )}
                    </Pressable>
                  ) : (
                    <View key={`empty-${keyIndex}`} style={styles.keySpacer} />
                  ),
                )}
              </View>
            ))}
          </View>
          <Pressable
            onPress={handleConfirm}
            disabled={!result?.complete}
            style={({ pressed }) => [
              styles.validate,
              !result?.complete && styles.validateDisabled,
              pressed && result?.complete && styles.keyPressed,
            ]}
          >
            <Text style={styles.validateLabel}>✓  Validar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function BackspaceIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.5 5h10.2A1.8 1.8 0 0 1 21.5 6.8v10.4a1.8 1.8 0 0 1-1.8 1.8H9.5L3.5 12 9.5 5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M12 9.5 16.5 14.5M16.5 9.5 12 14.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      backgroundColor: theme.bg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 16,
      paddingTop: 10,
      gap: 14,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      marginBottom: 4,
    },
    display: {
      minHeight: 36,
      textAlign: 'right',
      fontSize: 22,
      fontWeight: '600',
      color: theme.text,
      paddingHorizontal: 8,
    },
    displayArrow: {
      color: theme.textMuted,
    },
    displayTotal: {
      color: theme.accent,
      fontWeight: '800',
    },
    grid: {
      gap: 10,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    key: {
      flex: 1,
      height: 58,
      borderRadius: 14,
      backgroundColor: theme.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keySpacer: {
      flex: 1,
    },
    keyOp: {
      backgroundColor: theme.surface,
    },
    keyPressed: {
      opacity: 0.75,
    },
    keyLabel: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.text,
    },
    keyLabelOp: {
      fontSize: 26,
      fontWeight: '500',
    },
    keyLabelAction: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textMuted,
    },
    validate: {
      alignSelf: 'center',
      marginTop: 4,
      backgroundColor: theme.accent,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 24,
    },
    validateDisabled: {
      opacity: 0.4,
    },
    validateLabel: {
      color: theme.onAccent,
      fontSize: 16,
      fontWeight: '700',
    },
  });

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';
import { Player } from '../types';
import { formatBreakdownExpression, formatScoreNumber } from '../utils/scoring';
import { PlayerAvatar } from './PlayerAvatar';
import { RoundScoringPanel } from './RoundScoringPanel';

type Props = {
  player: Player;
  total: number;
  roundScore: number;
  breakdownItems?: number[];
  rank?: number;
  onSetScore: (value: number) => void;
  onSetBreakdown?: (items: number[]) => void;
  onRemove?: () => void;
  showRoundControls?: boolean;
  showTotal?: boolean;
  controlsDisabled?: boolean;
};

export function PlayerCard({
  player,
  total,
  roundScore,
  rank,
  breakdownItems = [],
  onSetScore,
  onSetBreakdown,
  onRemove,
  showRoundControls = true,
  showTotal = true,
  controlsDisabled,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [scoreText, setScoreText] = useState(formatScoreNumber(roundScore));
  const [scoreFocused, setScoreFocused] = useState(false);
  const scoreTextRef = useRef(scoreText);
  const scoreFocusedRef = useRef(scoreFocused);
  scoreTextRef.current = scoreText;
  scoreFocusedRef.current = scoreFocused;

  useEffect(() => {
    if (!scoreFocused) setScoreText(formatScoreNumber(roundScore));
  }, [roundScore, scoreFocused]);

  useEffect(() => {
    return () => {
      if (scoreFocusedRef.current) {
        onSetScore(parseScore(scoreTextRef.current));
      }
    };
  }, [onSetScore]);

  const commitScore = () => {
    const value = parseScore(scoreText);
    onSetScore(value);
    setScoreText(formatScoreNumber(value));
    setScoreFocused(false);
  };

  return (
    <View
      style={[
        styles.card,
        calculatorOpen && styles.cardActive,
      ]}
    >
      <View style={styles.header}>
        <PlayerAvatar
          name={player.name}
          color={player.color}
          avatar={player.avatar}
          size={48}
          radius={14}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>
            {rank !== undefined && rank <= 3 && (
              <View
                style={[
                  styles.badge,
                  rank === 1 && styles.gold,
                  rank === 2 && styles.silver,
                  rank === 3 && styles.bronze,
                ]}
              >
                <Text style={styles.badgeText}>#{rank}</Text>
              </View>
            )}
          </View>
          {showTotal && (
            <Text style={styles.totalLabel}>
              Total: <Text style={styles.total}>{total}</Text>
            </Text>
          )}
        </View>
        {showRoundControls ? (
          <View style={styles.scoreBlock}>
            <View style={styles.scoreRow}>
              <View
                style={[
                  styles.scorePill,
                  scoreFocused && styles.scorePillFocused,
                ]}
              >
                <TextInput
                  style={[
                    styles.scoreValue,
                    roundScore < 0 && !scoreFocused && styles.negative,
                  ]}
                  underlineColorAndroid="transparent"
                  value={scoreText}
                  onChangeText={(next) => {
                    const sanitized = sanitizeScoreInput(next);
                    setScoreText(sanitized);
                    const parsed = tryParseScore(sanitized);
                    if (parsed !== null) onSetScore(parsed);
                  }}
                  onFocus={() => setScoreFocused(true)}
                  onBlur={commitScore}
                  onSubmitEditing={commitScore}
                  editable={!controlsDisabled}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  selectTextOnFocus
                  maxLength={8}
                />
              </View>
              <RoundScoringPanel
                roundScore={roundScore}
                breakdownItems={breakdownItems}
                color={player.color}
                disabled={controlsDisabled}
                onSetScore={onSetScore}
                onSetBreakdown={onSetBreakdown ?? (() => {})}
                onSheetOpenChange={setCalculatorOpen}
              />
            </View>
            {breakdownItems.length > 1 ? (
              <Text style={styles.formula} numberOfLines={2}>
                {formatBreakdownExpression(breakdownItems)}
              </Text>
            ) : null}
          </View>
        ) : null}
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={12} style={styles.remove}>
            <Text style={styles.removeText}>✕</Text>
          </Pressable>
        )}
      </View>

    </View>
  );
}

function sanitizeScoreInput(text: string): string {
  const normalized = text.replace(/\./g, ',');
  const negative = normalized.trim().startsWith('-');
  const digits = normalized.replace(/[^\d,]/g, '');
  const [whole, ...rest] = digits.split(',');
  const fraction = rest.join('');
  const body = fraction.length > 0 ? `${whole},${fraction}` : whole;
  return negative ? `-${body}` : body;
}

function tryParseScore(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '' || trimmed === '-' || trimmed === ',' || trimmed === '-,') {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseScore(text: string): number {
  return tryParseScore(text) ?? 0;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 14,
  },
  cardActive: {
    borderColor: theme.accent,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.surfaceLight,
  },
  gold: { backgroundColor: '#F5A62333' },
  silver: { backgroundColor: '#8B9CB333' },
  bronze: { backgroundColor: '#CD7F3233' },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.warning,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.textMuted,
  },
  total: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.accent,
  },
  remove: {
    padding: 4,
  },
  removeText: {
    fontSize: 18,
    color: theme.textMuted,
  },
  scoreBlock: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scorePill: {
    width: 76,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  scorePillFocused: {
    borderColor: theme.accent,
  },
  scoreValue: {
    width: '100%',
    height: 40,
    paddingVertical: 0,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  formula: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'right',
    maxWidth: 124,
  },
  negative: {
    color: theme.danger,
  },
});

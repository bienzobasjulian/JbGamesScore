import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Flip7Modifier, Flip7RoundEntry, Player } from '../types';
import {
  FLIP7_MAX_NUMBERS,
  FLIP7_MODIFIERS,
  FLIP7_NUMBERS,
  formatFlip7Calculation,
  getFlip7DisplayScore,
  hasFlip7Bonus,
} from '../utils/flip7';
import { Flip7ModifierCard } from './Flip7ModifierCard';
import { Flip7NumberCard } from './Flip7NumberCard';
import { PlayerAvatar } from './PlayerAvatar';

type Props = {
  player: Player;
  entry: Flip7RoundEntry;
  expanded: boolean;
  onToggle: () => void;
  onToggleNumber: (number: number) => void;
  onToggleModifier: (modifier: Flip7Modifier) => void;
  onClear: () => void;
};

export function Flip7PlayerRoundPanel({
  player,
  entry,
  expanded,
  onToggle,
  onToggleNumber,
  onToggleModifier,
  onClear,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const roundScore = getFlip7DisplayScore(entry);
  const flip7Achieved = hasFlip7Bonus(entry);
  const calculation = formatFlip7Calculation(entry);
  const hasSelection =
    entry.numbers.length > 0 || entry.modifiers.length > 0;

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <PlayerAvatar
          name={player.name}
          color={player.color}
          avatar={player.avatar}
          size={44}
          radius={12}
        />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.hint}>
            {entry.numbers.length}/{FLIP7_MAX_NUMBERS} cartas
            {flip7Achieved ? ' · Flip 7' : ''}
            {expanded ? ' · Ocultar' : ' · Registrar cartas'}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Ronda</Text>
          <Text style={styles.score}>{roundScore}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Cartas</Text>
          <View style={styles.cardGrid}>
            {FLIP7_NUMBERS.map((number) => (
              <Flip7NumberCard
                key={number}
                number={number}
                selected={entry.numbers.includes(number)}
                onPress={() => onToggleNumber(number)}
              />
            ))}
          </View>

          {flip7Achieved ? (
            <View style={styles.flip7Banner}>
              <Text style={styles.flip7BannerText}>🏅 Flip 7 · +15 pts</Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Modificadores</Text>
          <View style={styles.modifierGrid}>
            {FLIP7_MODIFIERS.map((modifier) => (
              <Flip7ModifierCard
                key={modifier}
                modifier={modifier}
                selected={entry.modifiers.includes(modifier)}
                onPress={() => onToggleModifier(modifier)}
              />
            ))}
          </View>

          <View style={styles.calculation}>
            <Text style={styles.calculationTitle}>Cálculo</Text>
            <Text style={styles.calculationLine}>{calculation}</Text>
          </View>

          {hasSelection ? (
            <Pressable
              onPress={onClear}
              style={({ pressed }) => [
                styles.clearBtn,
                pressed && styles.clearBtnPressed,
              ]}
            >
              <Text style={styles.clearBtnText}>Limpiar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  headerPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  scoreBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.accent,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
    marginLeft: 4,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  modifierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  flip7Banner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: theme.warning + '22',
    borderWidth: 1,
    borderColor: theme.warning + '66',
    alignItems: 'center',
  },
  flip7BannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.warning,
  },
  calculation: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 4,
  },
  calculationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  calculationLine: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.accent,
    fontVariant: ['tabular-nums'],
  },
  clearBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
  },
  clearBtnPressed: {
    opacity: 0.8,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textMuted,
  },
});

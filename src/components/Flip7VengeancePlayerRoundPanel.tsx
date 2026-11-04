import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  Flip7VengeanceModifier,
  Flip7VengeanceRoundEntry,
  Flip7VengeanceSpecial,
  Player,
} from '../types';
import {
  Flip7VengeanceModifierCard,
  Flip7VengeanceSpecialCard,
} from './Flip7VengeanceCards';
import { Flip7NumberCard } from './Flip7NumberCard';
import { PlayerAvatar } from './PlayerAvatar';
import {
  countFlip7VengeanceNumber,
  FLIP7_VENGEANCE_MAX_NUMBERS,
  FLIP7_VENGEANCE_MODIFIERS,
  FLIP7_VENGEANCE_NUMBERS,
  FLIP7_VENGEANCE_SPECIALS,
  formatFlip7VengeanceCalculation,
  hasFlip7VengeanceBonus,
} from '../utils/flip7Vengeance';

type Props = {
  player: Player;
  players: Player[];
  entry: Flip7VengeanceRoundEntry;
  brutal: boolean;
  roundScore: number;
  expanded: boolean;
  onToggle: () => void;
  onCycleNumber: (number: number) => void;
  onToggleModifier: (modifier: Flip7VengeanceModifier) => void;
  onToggleSpecial: (special: Flip7VengeanceSpecial) => void;
  onStealFrom: (playerId: string | null) => void;
  onClear: () => void;
};

export function Flip7VengeancePlayerRoundPanel({
  player,
  players,
  entry,
  brutal,
  roundScore,
  expanded,
  onToggle,
  onCycleNumber,
  onToggleModifier,
  onToggleSpecial,
  onStealFrom,
  onClear,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const flip7 = hasFlip7VengeanceBonus(entry);
  const distinct = new Set(entry.numbers).size;
  const hasSelection =
    entry.numbers.length > 0 ||
    entry.modifiers.length > 0 ||
    entry.specials.length > 0;

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
            {distinct}/{FLIP7_VENGEANCE_MAX_NUMBERS} números
            {flip7 ? ' · Flip 7' : ''}
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
            {FLIP7_VENGEANCE_NUMBERS.map((number) => {
              const count = countFlip7VengeanceNumber(entry, number);
              return (
                <View key={number} style={styles.numberWrap}>
                  <Flip7NumberCard
                    number={number}
                    selected={count > 0}
                    onPress={() => onCycleNumber(number)}
                  />
                  {count > 1 ? (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>×{count}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {flip7 ? (
            <View style={styles.flip7Banner}>
              <Text style={styles.flip7BannerText}>Flip 7 · +15 pts</Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Especiales</Text>
          <View style={styles.modifierGrid}>
            {FLIP7_VENGEANCE_SPECIALS.map((special) => (
              <Flip7VengeanceSpecialCard
                key={special.id}
                special={special.id}
                selected={entry.specials.includes(special.id)}
                onPress={() => onToggleSpecial(special.id)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Modificadores</Text>
          <View style={styles.modifierGrid}>
            {FLIP7_VENGEANCE_MODIFIERS.map((modifier) => (
              <Flip7VengeanceModifierCard
                key={modifier}
                modifier={modifier}
                selected={entry.modifiers.includes(modifier)}
                onPress={() => onToggleModifier(modifier)}
              />
            ))}
          </View>

          {brutal && flip7 ? (
            <>
              <Text style={styles.sectionLabel}>Quitar 15 a</Text>
              <View style={styles.chipRow}>
                {players
                  .filter((other) => other.id !== player.id)
                  .map((other) => {
                    const selected = entry.flip7StealFromPlayerId === other.id;
                    return (
                      <Pressable
                        key={other.id}
                        onPress={() => onStealFrom(other.id)}
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[styles.chipText, selected && styles.chipTextSelected]}
                        >
                          {other.name}
                        </Text>
                      </Pressable>
                    );
                  })}
              </View>
            </>
          ) : null}

          <View style={styles.calculation}>
            <Text style={styles.calculationTitle}>Cálculo</Text>
            <Text style={styles.calculationLine}>
              {formatFlip7VengeanceCalculation(entry, brutal)}
            </Text>
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    headerPressed: { opacity: 0.85 },
    headerText: { flex: 1, gap: 2 },
    name: { fontSize: 17, fontWeight: '800', color: theme.text },
    hint: { fontSize: 12, color: theme.textMuted },
    scoreBox: { alignItems: 'flex-end', gap: 2 },
    scoreLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textMuted,
      textTransform: 'uppercase',
    },
    score: { fontSize: 22, fontWeight: '800', color: theme.accent },
    chevron: { fontSize: 12, color: theme.textMuted, marginLeft: 4 },
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
    numberWrap: { position: 'relative' },
    countBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.accent,
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    countBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.surfaceLight,
    },
    chipSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.accent + '22',
    },
    chipText: { fontSize: 14, fontWeight: '700', color: theme.text },
    chipTextSelected: { color: theme.accent },
    flip7Banner: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.warning + '22',
      borderWidth: 1,
      borderColor: theme.warning + '66',
      alignItems: 'center',
    },
    flip7BannerText: { fontSize: 13, fontWeight: '700', color: theme.warning },
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
    clearBtnPressed: { opacity: 0.8 },
    clearBtnText: { fontSize: 14, fontWeight: '700', color: theme.textMuted },
  });

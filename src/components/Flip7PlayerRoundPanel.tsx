import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Flip7Modifier, Flip7PlayerRoundStatus, Flip7RoundEntry, Player } from '../types';
import {
  FLIP7_MAX_NUMBERS,
  FLIP7_MODIFIERS,
  FLIP7_NUMBERS,
  formatFlip7RoundScoreBreakdown,
  getFlip7DisplayScore,
  hasFlip7Bonus,
  isFlip7Eliminated,
} from '../utils/flip7';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  player: Player;
  entry: Flip7RoundEntry;
  roundByPlayer: Record<string, Flip7RoundEntry>;
  readOnly?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onToggleNumber: (number: number) => void;
  onToggleModifier: (modifier: Flip7Modifier) => void;
  onSetStatus: (status: Flip7PlayerRoundStatus) => void;
};

function getFlip7StatusLabel(entry: Flip7RoundEntry, expanded: boolean): string {
  if (entry.status === 'active') {
    return `${entry.numbers.length}/${FLIP7_MAX_NUMBERS} números · ${expanded ? 'Ocultar' : 'Registrar cartas'}`;
  }
  if (isFlip7Eliminated(entry)) return 'Eliminado';
  if (entry.status === 'frozen') return 'Congelado';
  return 'Plantado';
}

export function Flip7PlayerRoundPanel({
  player,
  entry,
  roundByPlayer,
  readOnly = false,
  expanded,
  onToggle,
  onToggleNumber,
  onToggleModifier,
  onSetStatus,
}: Props) {
  const roundScore = getFlip7DisplayScore(entry);
  const isLocked = readOnly || entry.status !== 'active';
  const flip7Achieved = hasFlip7Bonus(entry);
  const eliminated = isFlip7Eliminated(entry);

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text
            style={[
              styles.avatarText,
              { color: getPlayerAvatarTextColor(player.color) },
            ]}
          >
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.hint}>
            {getFlip7StatusLabel(entry, expanded)}
            {flip7Achieved ? ' · Flip 7' : ''}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Ronda</Text>
          <Text
            style={[
              styles.score,
              eliminated && styles.scoreEliminated,
              entry.status === 'active' && styles.scorePreview,
            ]}
          >
            {roundScore}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {isLocked ? (
            <View style={styles.lockedBlock}>
              {!readOnly ? (
                <Pressable
                  onPress={() => onSetStatus('active')}
                  style={({ pressed }) => [
                    styles.resumeBtn,
                    pressed && styles.actionBtnPressed,
                  ]}
                >
                  <Text style={styles.resumeBtnText}>Volver al juego</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Números (0–12)</Text>
              <Text style={styles.sectionHint}>
                Resaltadas: cartas de este jugador.
              </Text>
              <View style={styles.chipGrid}>
                {FLIP7_NUMBERS.map((number) => {
                  const selected = entry.numbers.includes(number);
                  return (
                    <Pressable
                      key={number}
                      disabled={isLocked}
                      onPress={() => onToggleNumber(number)}
                      style={({ pressed }) => [
                        styles.chip,
                        selected && {
                          backgroundColor: player.color + '33',
                          borderColor: player.color,
                        },
                        pressed && !isLocked && styles.chipPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {number}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Modificadores</Text>
              <View style={styles.chipGrid}>
                {FLIP7_MODIFIERS.map((modifier) => {
                  const selected = entry.modifiers.includes(modifier);
                  return (
                    <Pressable
                      key={modifier}
                      disabled={isLocked}
                      onPress={() => onToggleModifier(modifier)}
                      style={({ pressed }) => [
                        styles.chip,
                        styles.modifierChip,
                        selected && {
                          backgroundColor: theme.accent + '33',
                          borderColor: theme.accent,
                        },
                        pressed && !isLocked && styles.chipPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {modifier}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => onSetStatus('stood')}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.standBtn,
                    pressed && styles.actionBtnPressed,
                  ]}
                >
                  <Text style={styles.standBtnText}>Plantarse/Bloqueado</Text>
                </Pressable>
                <Pressable
                  onPress={() => onSetStatus('eliminated')}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.eliminatedBtn,
                    pressed && styles.actionBtnPressed,
                  ]}
                >
                  <Text style={styles.eliminatedBtnText}>Eliminado</Text>
                </Pressable>
              </View>
            </>
          )}

          <Text style={styles.breakdown}>{formatFlip7RoundScoreBreakdown(entry)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  scorePreview: {
    color: theme.textMuted,
  },
  scoreEliminated: {
    color: theme.danger,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
    marginLeft: 4,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  lockedBlock: {
    paddingTop: 12,
  },
  resumeBtn: {
    alignSelf: 'flex-start',
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textMuted,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginTop: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 44,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  modifierChip: {
    minWidth: 52,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textMuted,
  },
  chipTextSelected: {
    color: theme.text,
    fontWeight: '800',
  },
  chipTextDisabled: {
    color: theme.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  standBtn: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '18',
  },
  standBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.accent,
  },
  eliminatedBtn: {
    borderColor: theme.danger,
    backgroundColor: theme.danger + '18',
  },
  eliminatedBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.danger,
  },
  breakdown: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 4,
  },
});

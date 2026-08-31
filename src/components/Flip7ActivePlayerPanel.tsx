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
  isFlip7Frozen,
} from '../utils/flip7';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  player: Player;
  entry: Flip7RoundEntry;
  roundByPlayer: Record<string, Flip7RoundEntry>;
  readOnly?: boolean;
  isTurnPlayer: boolean;
  pendingDraws: number;
  onAddNumber: (number: number) => void;
  onAddModifier: (modifier: Flip7Modifier) => void;
  onSetStatus: (status: Flip7PlayerRoundStatus) => void;
  onFreeze: () => void;
  onFlipThree: () => void;
  onSecondChance: () => void;
};

export function Flip7ActivePlayerPanel({
  player,
  entry,
  roundByPlayer,
  readOnly = false,
  isTurnPlayer,
  pendingDraws,
  onAddNumber,
  onAddModifier,
  onSetStatus,
  onFreeze,
  onFlipThree,
  onSecondChance,
}: Props) {
  const roundScore = getFlip7DisplayScore(entry);
  const canRegister = !readOnly && isTurnPlayer && entry.status === 'active';
  const flip7Achieved = hasFlip7Bonus(entry);
  const eliminated = isFlip7Eliminated(entry);
  const frozen = isFlip7Frozen(entry);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
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
            {entry.status === 'active'
              ? isTurnPlayer
                ? pendingDraws > 0
                  ? `Roba ${pendingDraws} carta${pendingDraws === 1 ? '' : 's'}`
                  : 'Tu turno · registra carta'
                : `${entry.numbers.length}/${FLIP7_MAX_NUMBERS} números`
              : frozen
                ? 'Congelado'
                : eliminated
                  ? 'Eliminado'
                  : 'Plantado'}
            {entry.hasSecondChance ? ' · Segunda oportunidad' : ''}
            {flip7Achieved ? ' · Flip 7' : ''}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Ronda</Text>
          <Text
            style={[
              styles.score,
              eliminated && styles.scoreEliminated,
              frozen && styles.scoreFrozen,
              entry.status === 'active' && styles.scorePreview,
            ]}
          >
            {roundScore}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {entry.status !== 'active' && !readOnly ? (
          <View style={styles.lockedBlock}>
            <Pressable
              onPress={() => onSetStatus('active')}
              style={({ pressed }) => [
                styles.resumeBtn,
                pressed && styles.actionBtnPressed,
              ]}
            >
              <Text style={styles.resumeBtnText}>Volver al juego</Text>
            </Pressable>
          </View>
        ) : null}

        {entry.status === 'active' && !canRegister && !readOnly && !isTurnPlayer ? (
          <Text style={styles.waitHint}>
            Solo el jugador en turno puede registrar cartas. Puedes revisar qué
            cartas han salido en la ronda.
          </Text>
        ) : null}

        <Text style={styles.sectionLabel}>Números (0–12)</Text>
        <Text style={styles.sectionHint}>
          Resaltadas: cartas de este jugador. Navega el carrusel para contar qué
          ha salido en la ronda.
        </Text>
        <View style={styles.chipGrid}>
          {FLIP7_NUMBERS.map((number) => {
            const selected = entry.numbers.includes(number);
            return (
              <Pressable
                key={number}
                onPress={() => {
                  if (canRegister) onAddNumber(number);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  selected && {
                    backgroundColor: player.color + '33',
                    borderColor: player.color,
                  },
                  pressed && canRegister && styles.chipPressed,
                ]}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
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
                onPress={() => {
                  if (canRegister) onAddModifier(modifier);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  styles.modifierChip,
                  selected && {
                    backgroundColor: theme.accent + '33',
                    borderColor: theme.accent,
                  },
                  pressed && canRegister && styles.chipPressed,
                ]}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {modifier}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {entry.status === 'active' ? (
          <>
            <Text style={styles.sectionLabel}>Cartas de acción</Text>
            <View style={styles.actionCards}>
              <Pressable
                disabled={!canRegister}
                onPress={onFreeze}
                style={({ pressed }) => [
                  styles.actionCard,
                  styles.freezeCard,
                  !canRegister && styles.chipDisabled,
                  pressed && canRegister && styles.actionBtnPressed,
                ]}
              >
                <Text style={styles.actionCardTitle}>Congelado</Text>
                <Text style={styles.actionCardHint}>Congelado · fuera</Text>
              </Pressable>
              <Pressable
                disabled={!canRegister}
                onPress={onFlipThree}
                style={({ pressed }) => [
                  styles.actionCard,
                  styles.flipThreeCard,
                  !canRegister && styles.chipDisabled,
                  pressed && canRegister && styles.actionBtnPressed,
                ]}
              >
                <Text style={styles.actionCardTitle}>Roba 3</Text>
                <Text style={styles.actionCardHint}>Elige jugador</Text>
              </Pressable>
              <Pressable
                disabled={!canRegister}
                onPress={onSecondChance}
                style={({ pressed }) => [
                  styles.actionCard,
                  styles.secondChanceCard,
                  !canRegister && styles.chipDisabled,
                  pressed && canRegister && styles.actionBtnPressed,
                ]}
              >
                <Text style={styles.actionCardTitle}>2ª oport.</Text>
                <Text style={styles.actionCardHint}>
                  {entry.hasSecondChance ? 'Regalar' : 'Conservar'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={!canRegister}
                onPress={() => onSetStatus('stood')}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.standBtn,
                  !canRegister && styles.chipDisabled,
                  pressed && canRegister && styles.actionBtnPressed,
                ]}
              >
                <Text style={styles.standBtnText}>Plantarse/Bloqueado</Text>
              </Pressable>
              <Pressable
                disabled={!canRegister}
                onPress={() => onSetStatus('eliminated')}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.eliminatedBtn,
                  !canRegister && styles.chipDisabled,
                  pressed && canRegister && styles.actionBtnPressed,
                ]}
              >
                <Text style={styles.eliminatedBtnText}>Eliminado</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        <Text style={styles.breakdown}>{formatFlip7RoundScoreBreakdown(entry)}</Text>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
  },
  hint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
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
    fontSize: 28,
    fontWeight: '800',
    color: theme.accent,
  },
  scorePreview: {
    color: theme.textMuted,
  },
  scoreEliminated: {
    color: theme.danger,
  },
  scoreFrozen: {
    color: '#5B9BD5',
  },
  body: {
    padding: 16,
    gap: 10,
  },
  lockedBlock: {
    paddingVertical: 4,
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
  waitHint: {
    fontSize: 13,
    color: theme.warning,
    fontWeight: '600',
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
  actionCards: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCard: {
    flex: 1,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  freezeCard: {
    borderColor: '#5B9BD5',
    backgroundColor: '#5B9BD522',
  },
  flipThreeCard: {
    borderColor: theme.warning,
    backgroundColor: theme.warning + '22',
  },
  secondChanceCard: {
    borderColor: theme.danger,
    backgroundColor: theme.danger + '22',
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  actionCardHint: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textMuted,
    textAlign: 'center',
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

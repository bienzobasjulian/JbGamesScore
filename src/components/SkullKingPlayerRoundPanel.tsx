import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../constants';
import { Player, SkullKingRoundEntry } from '../types';
import {
  calculateSkullKingRoundScore,
  getSkullKingRoundNumber,
} from '../utils/skullKing';
import { CardCountStepper } from './CardCountStepper';

type Props = {
  player: Player;
  roundIndex: number;
  entry: SkullKingRoundEntry;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<SkullKingRoundEntry>) => void;
};

export function SkullKingPlayerRoundPanel({
  player,
  roundIndex,
  entry,
  expanded,
  onToggle,
  onChange,
}: Props) {
  const roundNumber = getSkullKingRoundNumber(roundIndex);
  const maxBid = roundNumber;
  const roundScore = calculateSkullKingRoundScore(roundNumber, entry);
  const bidExact = entry.bid === entry.tricksWon;

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={[styles.avatar, { backgroundColor: player.color }]}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.hint}>
            {expanded ? 'Ocultar apuesta' : 'Registrar apuesta y bazas'}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Ronda</Text>
          <Text
            style={[styles.score, roundScore < 0 && styles.scoreNegative]}
          >
            {roundScore > 0 ? '+' : ''}
            {roundScore}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Apuesta</Text>
              <Text style={styles.fieldHint}>0 a {maxBid}</Text>
            </View>
            <CardCountStepper
              value={entry.bid}
              onChange={(bid) => onChange({ bid })}
              color={player.color}
              max={maxBid}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Bazas ganadas</Text>
              <Text style={styles.fieldHint}>0 a {maxBid}</Text>
            </View>
            <CardCountStepper
              value={entry.tricksWon}
              onChange={(tricksWon) => onChange({ tricksWon })}
              color={player.color}
              max={maxBid}
            />
          </View>

          {!bidExact && (entry.bid > 0 || entry.tricksWon > 0) ? (
            <Text style={styles.warn}>
              No cumple la apuesta: −10 pts por cada baza de diferencia. Sin
              bonificaciones.
            </Text>
          ) : null}

          <Text style={styles.bonusTitle}>Bonificaciones</Text>
          <Text style={styles.bonusHint}>
            Solo aplican si la apuesta se cumple exactamente.
          </Text>

          <View style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Piratas (×30)</Text>
              <Text style={styles.fieldHint}>Baza con Skull King jugado</Text>
            </View>
            <CardCountStepper
              value={entry.pirateCount}
              onChange={(pirateCount) => onChange({ pirateCount })}
              color={player.color}
              max={20}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>Sirena captura Skull King</Text>
              <Text style={styles.fieldHint}>+50 puntos</Text>
            </View>
            <Switch
              value={entry.mermaidCapturesKing}
              onValueChange={(mermaidCapturesKing) =>
                onChange({ mermaidCapturesKing })
              }
              trackColor={{ false: theme.border, true: theme.accentDark }}
              thumbColor={
                entry.mermaidCapturesKing ? theme.accent : theme.textMuted
              }
              disabled={!bidExact}
            />
          </View>
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
    fontSize: 20,
    fontWeight: '800',
    color: theme.accent,
  },
  scoreNegative: {
    color: theme.danger,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldInfo: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  warn: {
    fontSize: 12,
    color: theme.warning,
    lineHeight: 17,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginTop: 4,
  },
  bonusHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});

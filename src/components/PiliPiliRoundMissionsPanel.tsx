import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import {
  PiliPiliMissionType,
  PiliPiliRoundConfig,
} from '../types';
import {
  formatPiliPiliMissionLabel,
  PILI_PILI_MISSION_LABELS,
} from '../utils/piliPili';

const ALL_MISSIONS: PiliPiliMissionType[] = [
  'exact_bet_discard',
  'first_last_trick',
  'mission_card_numbers',
  'linked_player',
  'forbidden_bet',
  'no_copy_bid',
];

type Props = {
  config: PiliPiliRoundConfig;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<PiliPiliRoundConfig>) => void;
};

export function PiliPiliRoundMissionsPanel({
  config,
  expanded,
  onToggle,
  onChange,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const selectMission = (mission: PiliPiliMissionType) => {
    if (config.mission === mission) {
      onChange({ mission: null, forbiddenBidValue: null });
      return;
    }
    onChange({
      mission,
      ...(mission === 'forbidden_bet'
        ? { forbiddenBidValue: config.forbiddenBidValue ?? 0 }
        : { forbiddenBidValue: null }),
    });
  };

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.headerText}>
          <Text style={styles.title}>Misión especial</Text>
          <Text style={styles.hint}>{formatPiliPiliMissionLabel(config)}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.singleHint}>
            Solo puedes activar una misión por ronda. Pulsa de nuevo para quitarla.
          </Text>
          {ALL_MISSIONS.map((mission) => {
            const active = config.mission === mission;
            return (
              <Pressable
                key={mission}
                onPress={() => selectMission(mission)}
                style={({ pressed }) => [
                  styles.missionRow,
                  active && styles.missionRowActive,
                  pressed && styles.missionRowPressed,
                ]}
              >
                <View
                  style={[styles.radio, active && styles.radioActive]}
                >
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <Text
                  style={[
                    styles.missionLabel,
                    active && styles.missionLabelActive,
                  ]}
                >
                  {PILI_PILI_MISSION_LABELS[mission]}
                </Text>
              </Pressable>
            );
          })}

          {config.mission === 'forbidden_bet' ? (
            <View style={styles.forbiddenBlock}>
              <Text style={styles.forbiddenLabel}>Número prohibido</Text>
              <Text style={styles.forbiddenHint}>
                Según la carta de misión: 0 o 1.
              </Text>
              <View style={styles.forbiddenRow}>
                {([0, 1] as const).map((value) => {
                  const selected = config.forbiddenBidValue === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => onChange({ forbiddenBidValue: value })}
                      style={({ pressed }) => [
                        styles.forbiddenChip,
                        selected && styles.forbiddenChipActive,
                        pressed && styles.forbiddenChipPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.forbiddenChipText,
                          selected && styles.forbiddenChipTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  singleHint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
    marginBottom: 4,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
  },
  missionRowActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '14',
  },
  missionRowPressed: {
    opacity: 0.85,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: theme.accent,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  missionLabel: {
    flex: 1,
    fontSize: 13,
    color: theme.text,
    lineHeight: 18,
  },
  missionLabelActive: {
    fontWeight: '700',
    color: theme.accent,
  },
  forbiddenBlock: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    gap: 8,
  },
  forbiddenLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  forbiddenHint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
  },
  forbiddenRow: {
    flexDirection: 'row',
    gap: 10,
  },
  forbiddenChip: {
    minWidth: 52,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    alignItems: 'center',
  },
  forbiddenChipActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '22',
  },
  forbiddenChipPressed: {
    opacity: 0.85,
  },
  forbiddenChipText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textMuted,
  },
  forbiddenChipTextActive: {
    color: theme.accent,
  },
});

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { GameSettings } from '../types';

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  disabled?: boolean;
  flat?: boolean;
};

const DEFAULT_MAX_ROUNDS = 3;
const DEFAULT_MAX_POINTS = 100;

function parseLimit(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

export function GameSettingsPanel({
  settings,
  onChange,
  disabled,
  flat = false,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const maxRoundsEnabled = settings.maxRounds != null;
  const maxPointsEnabled = settings.maxPointsToWin != null;

  const [roundsText, setRoundsText] = useState(
    () => String(settings.maxRounds ?? DEFAULT_MAX_ROUNDS),
  );
  const [pointsText, setPointsText] = useState(
    () => String(settings.maxPointsToWin ?? DEFAULT_MAX_POINTS),
  );
  const [roundsFocused, setRoundsFocused] = useState(false);
  const [pointsFocused, setPointsFocused] = useState(false);

  useEffect(() => {
    if (!roundsFocused && settings.maxRounds != null) {
      setRoundsText(String(settings.maxRounds));
    }
  }, [settings.maxRounds, roundsFocused]);

  useEffect(() => {
    if (!pointsFocused && settings.maxPointsToWin != null) {
      setPointsText(String(settings.maxPointsToWin));
    }
  }, [settings.maxPointsToWin, pointsFocused]);

  const handleRoundsTextChange = (text: string) => {
    setRoundsText(text);
    const parsed = parseLimit(text);
    if (parsed != null) {
      onChange({ ...settings, maxRounds: parsed });
    }
  };

  const commitRounds = () => {
    const parsed = parseLimit(roundsText);
    const value = parsed ?? settings.maxRounds ?? DEFAULT_MAX_ROUNDS;
    onChange({ ...settings, maxRounds: value });
    setRoundsText(String(value));
  };

  const handlePointsTextChange = (text: string) => {
    setPointsText(text);
    const parsed = parseLimit(text);
    if (parsed != null) {
      onChange({ ...settings, maxPointsToWin: parsed });
    }
  };

  const commitPoints = () => {
    const parsed = parseLimit(pointsText);
    const value = parsed ?? settings.maxPointsToWin ?? DEFAULT_MAX_POINTS;
    onChange({ ...settings, maxPointsToWin: value });
    setPointsText(String(value));
  };

  return (
    <View style={flat ? styles.flat : styles.panel}>
      <Text style={flat ? styles.flatTitle : styles.title}>
        Configuración de partida
      </Text>

      <Text style={styles.label}>Quién gana</Text>
      {(
        [
          ['high', 'Más puntos gana', 'El podio ordena de mayor a menor.'],
          [
            'low',
            'Menos puntos gana',
            'El podio pone arriba a quien menos puntos tiene.',
          ],
          [
            'loses',
            'Menos puntos pierde',
            'Quien menos tiene pierde y el resto gana igual. Se marca al perdedor, sin podio.',
          ],
        ] as const
      ).map(([id, label, hint]) => {
        const selected =
          id === 'loses'
            ? settings.lowestScoreLoses === true
            : id === 'low'
              ? settings.lowestScoreWins === true &&
                settings.lowestScoreLoses !== true
              : settings.lowestScoreWins !== true &&
                settings.lowestScoreLoses !== true;
        return (
          <Pressable
            key={id}
            disabled={disabled}
            onPress={() =>
              onChange({
                ...settings,
                lowestScoreWins: id === 'low',
                lowestScoreLoses: id === 'loses',
              })
            }
            style={[styles.rule, selected && styles.ruleSelected]}
          >
            <Text style={[styles.ruleLabel, selected && styles.ruleLabelSelected]}>
              {label}
            </Text>
            {selected ? <Text style={styles.hint}>{hint}</Text> : null}
          </Pressable>
        );
      })}

      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Máximo de rondas</Text>
          <Text style={styles.hint}>La partida termina al completarlas</Text>
        </View>
        <Switch
          value={maxRoundsEnabled}
          onValueChange={(on) => {
            if (on) {
              const value = settings.maxRounds ?? DEFAULT_MAX_ROUNDS;
              setRoundsText(String(value));
              onChange({ ...settings, maxRounds: value });
            } else {
              onChange({ ...settings, maxRounds: null });
            }
          }}
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={maxRoundsEnabled ? theme.accent : theme.textMuted}
          disabled={disabled}
        />
      </View>
      {maxRoundsEnabled && (
        <TextInput
          style={styles.input}
          value={roundsText}
          onChangeText={handleRoundsTextChange}
          onFocus={() => setRoundsFocused(true)}
          onBlur={() => {
            setRoundsFocused(false);
            commitRounds();
          }}
          onSubmitEditing={commitRounds}
          keyboardType="number-pad"
          placeholder="Número de rondas"
          placeholderTextColor={theme.textMuted}
          editable={!disabled}
          maxLength={3}
        />
      )}

      <View style={[styles.row, styles.rowSpaced]}>
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Puntos para ganar/perder</Text>
          <Text style={styles.hint}>
            {settings.lowestScoreLoses
              ? 'Se comprueba al terminar cada ronda; pierde el menor total'
              : settings.lowestScoreWins
                ? 'Se comprueba al terminar cada ronda; gana el menor total'
                : 'Se comprueba al terminar cada ronda'}
          </Text>
        </View>
        <Switch
          value={maxPointsEnabled}
          onValueChange={(on) => {
            if (on) {
              const value = settings.maxPointsToWin ?? DEFAULT_MAX_POINTS;
              setPointsText(String(value));
              onChange({ ...settings, maxPointsToWin: value });
            } else {
              onChange({ ...settings, maxPointsToWin: null });
            }
          }}
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={maxPointsEnabled ? theme.accent : theme.textMuted}
          disabled={disabled}
        />
      </View>
      {maxPointsEnabled && (
        <TextInput
          style={styles.input}
          value={pointsText}
          onChangeText={handlePointsTextChange}
          onFocus={() => setPointsFocused(true)}
          onBlur={() => {
            setPointsFocused(false);
            commitPoints();
          }}
          onSubmitEditing={commitPoints}
          keyboardType="number-pad"
          placeholder="Puntos objetivo"
          placeholderTextColor={theme.textMuted}
          editable={!disabled}
          maxLength={4}
        />
      )}

    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  flat: {
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  flatTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.textMuted,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowSpaced: {
    marginTop: 4,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  input: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.text,
    marginTop: 2,
  },
  rule: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  ruleSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.surfaceLight,
  },
  ruleLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  ruleLabelSelected: {
    color: theme.accent,
  },
});

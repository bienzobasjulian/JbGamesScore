import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { theme } from '../constants';
import { GameSettings } from '../types';

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  disabled?: boolean;
};

const DEFAULT_MAX_ROUNDS = 3;
const DEFAULT_MAX_POINTS = 100;

function parseLimit(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

export function GameSettingsPanel({ settings, onChange, disabled }: Props) {
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
    <View style={styles.panel}>
      <Text style={styles.title}>Configuración de partida</Text>

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
          <Text style={styles.label}>Puntos para ganar</Text>
          <Text style={styles.hint}>
            {settings.lowestScoreWins
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

      <View style={[styles.row, styles.rowSpaced]}>
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Gana quien tenga menos puntos</Text>
          <Text style={styles.hint}>
            Por defecto gana la puntuación más alta
          </Text>
        </View>
        <Switch
          value={settings.lowestScoreWins === true}
          onValueChange={(lowestScoreWins) =>
            onChange({ ...settings, lowestScoreWins })
          }
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={
            settings.lowestScoreWins ? theme.accent : theme.textMuted
          }
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
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
});

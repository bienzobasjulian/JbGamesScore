import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { theme } from '../constants';
import { GameSettings } from '../types';

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  disabled?: boolean;
};

function parseLimit(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

export function GameSettingsPanel({ settings, onChange, disabled }: Props) {
  const maxRoundsEnabled = settings.maxRounds != null;
  const maxPointsEnabled = settings.maxPointsToWin != null;

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
          onValueChange={(on) =>
            onChange({
              ...settings,
              maxRounds: on ? 5 : null,
            })
          }
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={maxRoundsEnabled ? theme.accent : theme.textMuted}
          disabled={disabled}
        />
      </View>
      {maxRoundsEnabled && (
        <TextInput
          style={styles.input}
          defaultValue={String(settings.maxRounds ?? 5)}
          key={`rounds-${settings.maxRounds}`}
          onEndEditing={(e) => {
            const parsed = parseLimit(e.nativeEvent.text);
            if (parsed != null) {
              onChange({ ...settings, maxRounds: parsed });
            }
          }}
          keyboardType="number-pad"
          placeholder="Ej. 10"
          placeholderTextColor={theme.textMuted}
          editable={!disabled}
        />
      )}

      <View style={[styles.row, styles.rowSpaced]}>
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Puntos para ganar</Text>
          <Text style={styles.hint}>Gana quien llegue primero al objetivo</Text>
        </View>
        <Switch
          value={maxPointsEnabled}
          onValueChange={(on) =>
            onChange({
              ...settings,
              maxPointsToWin: on ? 100 : null,
            })
          }
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={maxPointsEnabled ? theme.accent : theme.textMuted}
          disabled={disabled}
        />
      </View>
      {maxPointsEnabled && (
        <TextInput
          style={styles.input}
          defaultValue={String(settings.maxPointsToWin ?? 100)}
          key={`points-${settings.maxPointsToWin}`}
          onEndEditing={(e) => {
            const parsed = parseLimit(e.nativeEvent.text);
            if (parsed != null) {
              onChange({ ...settings, maxPointsToWin: parsed });
            }
          }}
          keyboardType="number-pad"
          placeholder="Ej. 100"
          placeholderTextColor={theme.textMuted}
          editable={!disabled}
        />
      )}
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

import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../constants';
import { AventurerosTrenPlayerScoring, AventurerosTrenSubmode } from '../types';
import {
  EUROPA_MAX_STATIONS,
  EUROPA_STATION_BONUS_PER_UNUSED,
  LONGEST_ROUTE_BONUS_POINTS,
} from '../utils/aventurerosTren';
import { CardCountStepper } from './CardCountStepper';

type Props = {
  submode: AventurerosTrenSubmode;
  scoring: AventurerosTrenPlayerScoring;
  color: string;
  onChange: (patch: Partial<AventurerosTrenPlayerScoring>) => void;
};

export function AventurerosTrenEndgameFields({
  submode,
  scoring,
  color,
  onChange,
}: Props) {
  const isEuropa = submode === 'europa';

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Puntuación final</Text>

      <View style={styles.fieldRow}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>Ruta más larga</Text>
          <Text style={styles.fieldHint}>
            Longitud para desempate (tramo continuo más largo)
          </Text>
        </View>
        <CardCountStepper
          value={scoring.longestRouteLength}
          onChange={(longestRouteLength) => onChange({ longestRouteLength })}
          color={color}
          max={99}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>
            Bonificación ruta más larga (+{LONGEST_ROUTE_BONUS_POINTS})
          </Text>
          <Text style={styles.fieldHint}>
            Marca solo al jugador con la ruta continua más larga
          </Text>
        </View>
        <Switch
          value={scoring.hasLongestRouteBonus}
          onValueChange={(hasLongestRouteBonus) =>
            onChange({ hasLongestRouteBonus })
          }
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={
            scoring.hasLongestRouteBonus ? theme.accent : theme.textMuted
          }
        />
      </View>

      {isEuropa ? (
        <View style={styles.fieldRow}>
          <View style={styles.fieldInfo}>
            <Text style={styles.fieldLabel}>Estaciones sin usar</Text>
            <Text style={styles.fieldHint}>
              De 0 a {EUROPA_MAX_STATIONS} (+{EUROPA_STATION_BONUS_PER_UNUSED}{' '}
              pts por cada una)
            </Text>
          </View>
          <CardCountStepper
            value={scoring.unusedStations}
            onChange={(unusedStations) => onChange({ unusedStations })}
            color={color}
            max={EUROPA_MAX_STATIONS}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
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
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});

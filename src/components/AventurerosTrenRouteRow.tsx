import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { AventurerosTrenRouteEntry } from '../types';
import {
  getRouteEntryPoints,
  ROUTE_LENGTH_OPTIONS,
  ROUTE_POINTS_BY_LENGTH,
} from '../utils/aventurerosTren';
import { CardCountStepper } from './CardCountStepper';
import { OriginDestinationInputs } from './OriginDestinationInputs';

type Props = {
  entry: AventurerosTrenRouteEntry;
  color: string;
  onChange: (patch: Partial<AventurerosTrenRouteEntry>) => void;
  onRemove: () => void;
};

export function AventurerosTrenRouteRow({
  entry,
  color,
  onChange,
  onRemove,
}: Props) {
  const points = getRouteEntryPoints(entry);

  return (
    <View style={styles.row}>
      <OriginDestinationInputs
        origin={entry.origin}
        destination={entry.destination}
        onChangeOrigin={(origin) => onChange({ origin })}
        onChangeDestination={(destination) => onChange({ destination })}
      />

      <Pressable
        onPress={() => onChange({ useCustomPoints: !entry.useCustomPoints })}
        style={styles.modeToggle}
      >
        <Text style={styles.modeText}>
          {entry.useCustomPoints ? 'Puntos directos' : 'Por longitud'}
        </Text>
      </Pressable>

      {entry.useCustomPoints ? (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Puntos</Text>
          <CardCountStepper
            value={entry.customPoints}
            onChange={(customPoints) => onChange({ customPoints })}
            color={color}
            max={999}
          />
        </View>
      ) : (
        <View style={styles.lengthGrid}>
          {ROUTE_LENGTH_OPTIONS.map((len) => {
            const selected = entry.length === len;
            return (
              <Pressable
                key={len}
                onPress={() => onChange({ length: len })}
                style={[
                  styles.lengthChip,
                  selected && { borderColor: color, backgroundColor: color + '22' },
                ]}
              >
                <Text style={[styles.lengthVal, selected && { color }]}>
                  {len}
                </Text>
                <Text style={styles.lengthPts}>
                  {ROUTE_POINTS_BY_LENGTH[len]} pt
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.points}>+{points} pts</Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>Quitar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modeToggle: {
    alignSelf: 'flex-start',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.accent,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  lengthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lengthChip: {
    minWidth: 52,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    gap: 2,
  },
  lengthVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
  },
  lengthPts: {
    fontSize: 10,
    color: theme.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  points: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.accent,
  },
  remove: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.danger,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { AventurerosTrenRouteEntry, AventurerosTrenSubmode } from '../types';
import {
  formatRouteCollapsedMeta,
  formatRoutePlaces,
  getRouteEntryPoints,
  getRouteLengthOptions,
  getRoutePointsByLength,
} from '../utils/aventurerosTren';
import { CardCountStepper } from './CardCountStepper';
import { CollapsibleTrenEntryCard } from './CollapsibleTrenEntryCard';
import { OriginDestinationInputs } from './OriginDestinationInputs';

type Props = {
  submode: AventurerosTrenSubmode;
  entry: AventurerosTrenRouteEntry;
  color: string;
  onChange: (patch: Partial<AventurerosTrenRouteEntry>) => void;
  onRemove: () => void;
};

export function AventurerosTrenRouteRow({
  submode,
  entry,
  color,
  onChange,
  onRemove,
}: Props) {
  const lengthOptions = getRouteLengthOptions(submode);
  const pointsByLength = getRoutePointsByLength(submode);
  const points = getRouteEntryPoints(entry, submode);
  const places = formatRoutePlaces(entry);
  const meta = formatRouteCollapsedMeta(entry, submode);

  return (
    <CollapsibleTrenEntryCard
      collapsed={entry.collapsed === true}
      onToggleCollapsed={() => onChange({ collapsed: !entry.collapsed })}
      places={places}
      subtitle={meta}
      pointsLabel={`+${points}`}
      pointsPositive
      accentColor={color}
      onRemove={onRemove}
    >
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
          {lengthOptions.map((len) => {
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
                  {pointsByLength[len]} pt
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </CollapsibleTrenEntryCard>
  );
}

const styles = StyleSheet.create({
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
});

import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../constants';
import { AventurerosTrenDestinationEntry } from '../types';
import {
  formatDestinationPlaces,
  getDestinationEntryPoints,
} from '../utils/aventurerosTren';
import { CardCountStepper } from './CardCountStepper';
import { CollapsibleTrenEntryCard } from './CollapsibleTrenEntryCard';
import { OriginDestinationInputs } from './OriginDestinationInputs';

type Props = {
  entry: AventurerosTrenDestinationEntry;
  color: string;
  onChange: (patch: Partial<AventurerosTrenDestinationEntry>) => void;
  onRemove: () => void;
};

export function AventurerosTrenDestinationRow({
  entry,
  color,
  onChange,
  onRemove,
}: Props) {
  const net = getDestinationEntryPoints(entry);
  const places = formatDestinationPlaces(entry);
  const pointsLabel = `${net > 0 ? '+' : ''}${net} pts`;

  return (
    <CollapsibleTrenEntryCard
      collapsed={entry.collapsed === true}
      onToggleCollapsed={() => onChange({ collapsed: !entry.collapsed })}
      places={places}
      pointsLabel={pointsLabel}
      pointsPositive={net >= 0}
      accentColor={color}
      onRemove={onRemove}
    >
      <OriginDestinationInputs
        origin={entry.origin}
        destination={entry.destination}
        onChangeOrigin={(origin) => onChange({ origin })}
        onChangeDestination={(destination) => onChange({ destination })}
      />

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Valor de la carta</Text>
        <CardCountStepper
          value={entry.points}
          onChange={(points) => onChange({ points })}
          color={color}
          max={999}
        />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <Text style={styles.fieldLabel}>Destino completado</Text>
          <Text style={styles.switchHint}>
            {entry.completed ? 'Se suman los puntos' : 'Se restan los puntos'}
          </Text>
        </View>
        <Switch
          value={entry.completed}
          onValueChange={(completed) => onChange({ completed })}
          trackColor={{ false: theme.border, true: theme.accentDark }}
          thumbColor={entry.completed ? theme.accent : theme.textMuted}
        />
      </View>
    </CollapsibleTrenEntryCard>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchInfo: {
    flex: 1,
    gap: 2,
  },
  switchHint: {
    fontSize: 12,
    color: theme.textMuted,
  },
});

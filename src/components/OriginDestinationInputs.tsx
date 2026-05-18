import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  origin: string;
  destination: string;
  onChangeOrigin: (value: string) => void;
  onChangeDestination: (value: string) => void;
};

export function OriginDestinationInputs({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.label}>Origen</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciudad A"
          placeholderTextColor={theme.textMuted}
          value={origin}
          onChangeText={onChangeOrigin}
          maxLength={40}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Destino</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciudad B"
          placeholderTextColor={theme.textMuted}
          value={destination}
          onChangeText={onChangeDestination}
          maxLength={40}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  input: {
    backgroundColor: theme.bg,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.text,
  },
});

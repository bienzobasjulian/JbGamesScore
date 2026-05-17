import { StyleSheet, Text } from 'react-native';
import { theme } from '../constants';

type Props = {
  label: string;
};

export function SectionLabel({ label }: Props) {
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
    marginBottom: 2,
  },
});

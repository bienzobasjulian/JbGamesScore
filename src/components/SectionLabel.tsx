import { StyleSheet, Text } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  label: string;
};

export function SectionLabel({ label }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return <Text style={styles.label}>{label}</Text>;
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
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

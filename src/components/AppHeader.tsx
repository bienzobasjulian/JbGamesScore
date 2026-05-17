import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onBack?: () => void;
};

export function AppHeader({ title, subtitle, onMenuPress, onBack }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onMenuPress ? (
        <Pressable onPress={onMenuPress} hitSlop={12} style={styles.iconBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconPlaceholder: {
    width: 40,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.text,
    fontWeight: '700',
  },
  backIcon: {
    fontSize: 22,
    color: theme.text,
    fontWeight: '600',
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },
});

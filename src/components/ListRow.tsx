import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  title: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

export function ListRow({
  title,
  subtitle,
  color,
  onPress,
  onLongPress,
  onRemove,
  selectionMode = false,
  selected = false,
}: Props) {
  const content = (
    <>
      {selectionMode ? (
        <View style={[styles.selector, selected && styles.selectorActive]}>
          {selected ? <View style={styles.selectorDot} /> : null}
        </View>
      ) : null}
      {color ? (
        <View style={[styles.dot, { backgroundColor: color }]} />
      ) : null}
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onRemove && !selectionMode ? (
        <Pressable onPress={onRemove} hitSlop={12} style={styles.remove}>
          <Text style={styles.removeText}>x</Text>
        </Pressable>
      ) : onPress && !selectionMode ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </>
  );

  if (!onPress && !onLongPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  pressed: {
    opacity: 0.75,
  },
  selector: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceLight,
  },
  selectorActive: {
    borderColor: theme.accent,
  },
  selectorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: theme.textMuted,
    fontWeight: '300',
  },
  remove: {
    padding: 4,
  },
  removeText: {
    fontSize: 18,
    color: theme.textMuted,
  },
});

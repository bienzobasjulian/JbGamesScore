import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { PlayerAvatar } from './PlayerAvatar';

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  color?: string;
  avatar?: string | null;
  playerName?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

export function ListRow({
  title,
  subtitle,
  badge,
  color,
  avatar,
  playerName,
  onPress,
  onLongPress,
  onRemove,
  selectionMode = false,
  selected = false,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const content = (
    <>
      {selectionMode ? (
        <View style={[styles.selector, selected && styles.selectorActive]}>
          {selected ? <View style={styles.selectorDot} /> : null}
        </View>
      ) : null}
      {color ? (
        playerName ? (
          <PlayerAvatar
            name={playerName}
            color={color}
            avatar={avatar}
            size={36}
            radius={10}
          />
        ) : (
          <View style={[styles.dot, { backgroundColor: color }]} />
        )
      ) : null}
      <View style={styles.texts}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: theme.accent + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.accent,
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

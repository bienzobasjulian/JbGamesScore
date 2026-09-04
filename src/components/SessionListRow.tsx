import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Match, PlaySession } from '../types';
import { formatSessionSubtitle, getSessionMatches } from '../utils/session';

type Props = {
  session: PlaySession;
  matches: Match[];
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

export function SessionListRow({
  session,
  matches,
  onPress,
  onLongPress,
  onRemove,
  selectionMode = false,
  selected = false,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const sessionMatches = getSessionMatches(session.id, matches);
  const subtitle = formatSessionSubtitle(session, sessionMatches);
  const isActive = session.status === 'active';

  const content = (
    <>
      {selectionMode ? (
        <View style={[styles.selector, selected && styles.selectorActive]}>
          {selected ? <View style={styles.selectorDot} /> : null}
        </View>
      ) : null}
      <View style={styles.texts}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {session.name}
          </Text>
          <View
            style={[
              styles.badge,
              isActive ? styles.badgeActive : styles.badgeClosed,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isActive ? styles.badgeTextActive : styles.badgeTextClosed,
              ]}
            >
              {isActive ? 'Activa' : 'Cerrada'}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
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
  texts: {
    flex: 1,
    gap: 3,
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
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeActive: {
    backgroundColor: theme.success + '22',
  },
  badgeClosed: {
    backgroundColor: theme.surfaceLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: theme.success,
  },
  badgeTextClosed: {
    color: theme.textMuted,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
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

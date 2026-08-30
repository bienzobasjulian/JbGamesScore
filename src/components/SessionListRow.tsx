import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Match, PlaySession } from '../types';
import { formatSessionSubtitle, getSessionMatches } from '../utils/session';

type Props = {
  session: PlaySession;
  matches: Match[];
  onPress?: () => void;
};

export function SessionListRow({ session, matches, onPress }: Props) {
  const sessionMatches = getSessionMatches(session.id, matches);
  const subtitle = formatSessionSubtitle(session, sessionMatches);
  const isActive = session.status === 'active';

  const content = (
    <>
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
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
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
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Match } from '../types';
import { formatMatchListSubtitle, formatMatchTitle } from '../utils/match';

type Props = {
  match: Match;
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

export function MatchListRow({
  match,
  onPress,
  onLongPress,
  onRemove,
  selectionMode = false,
  selected = false,
}: Props) {
  const isFinished = match.status === 'finished';
  const subtitle = formatMatchListSubtitle(match);
  const subtitleLines = subtitle.split('\n');

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
            {formatMatchTitle(match)}
          </Text>
          <View
            style={[
              styles.badge,
              isFinished ? styles.badgeFinished : styles.badgeActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isFinished ? styles.badgeTextFinished : styles.badgeTextActive,
              ]}
            >
              {isFinished ? 'Finalizada' : 'En curso'}
            </Text>
          </View>
        </View>
        {subtitleLines.map((line, i) => (
          <Text
            key={i}
            style={[styles.subtitle, i > 0 && styles.subtitleAccent]}
            numberOfLines={2}
          >
            {line}
          </Text>
        ))}
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
    backgroundColor: theme.accent + '22',
  },
  badgeFinished: {
    backgroundColor: theme.surfaceLight,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: theme.accent,
  },
  badgeTextFinished: {
    color: theme.textMuted,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  subtitleAccent: {
    color: theme.warning,
    fontWeight: '600',
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

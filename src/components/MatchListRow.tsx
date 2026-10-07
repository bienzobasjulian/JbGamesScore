import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Match } from '../types';
import { formatMatchListSubtitle, formatMatchTitle } from '../utils/match';
import { getRegicideResultLabel } from '../utils/regicide';

type Props = {
  match: Match;
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

function getMatchStatusBadge(match: Match): {
  label: string;
  tone: 'active' | 'finished' | 'victory' | 'defeat';
} {
  if (match.status !== 'finished') {
    return { label: 'En curso', tone: 'active' };
  }
  if (match.gameMode === 'regicide') {
    const result = getRegicideResultLabel(
      match.regicideSession,
      match.status,
    );
    if (result === 'Victoria') return { label: 'Victoria', tone: 'victory' };
    return { label: 'Derrota', tone: 'defeat' };
  }
  return { label: 'Finalizada', tone: 'finished' };
}

export function MatchListRow({
  match,
  onPress,
  onLongPress,
  onRemove,
  selectionMode = false,
  selected = false,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const badge = getMatchStatusBadge(match);
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
              badge.tone === 'active' && styles.badgeActive,
              badge.tone === 'finished' && styles.badgeFinished,
              badge.tone === 'victory' && styles.badgeVictory,
              badge.tone === 'defeat' && styles.badgeDefeat,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                badge.tone === 'active' && styles.badgeTextActive,
                badge.tone === 'finished' && styles.badgeTextFinished,
                badge.tone === 'victory' && styles.badgeTextVictory,
                badge.tone === 'defeat' && styles.badgeTextDefeat,
              ]}
            >
              {badge.label}
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    badgeVictory: {
      backgroundColor: theme.success + '22',
    },
    badgeDefeat: {
      backgroundColor: theme.danger + '22',
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
    badgeTextVictory: {
      color: theme.success,
    },
    badgeTextDefeat: {
      color: theme.danger,
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

import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  places: string | null;
  subtitle?: string;
  pointsLabel: string;
  pointsPositive?: boolean;
  accentColor?: string;
  onRemove: () => void;
  children: ReactNode;
};

export function CollapsibleTrenEntryCard({
  collapsed,
  onToggleCollapsed,
  places,
  subtitle,
  pointsLabel,
  pointsPositive = true,
  accentColor,
  onRemove,
  children,
}: Props) {
  const expanded = !collapsed;

  return (
    <View style={styles.panel}>
      <Pressable
        onPress={onToggleCollapsed}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.headerText}>
          {places ? (
            <Text style={styles.places} numberOfLines={2}>
              {places}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={[styles.subtitle, !places && styles.subtitleSolo]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.points,
            !pointsPositive && styles.pointsNegative,
            accentColor && pointsPositive && { color: accentColor },
          ]}
        >
          {pointsLabel}
        </Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {children}
          <View style={styles.footer}>
            <Pressable onPress={onRemove} hitSlop={8}>
              <Text style={styles.remove}>Quitar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  places: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  subtitleSolo: {
    fontSize: 14,
    color: theme.text,
  },
  points: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.accent,
  },
  pointsNegative: {
    color: theme.danger,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
    width: 16,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  remove: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.danger,
  },
});

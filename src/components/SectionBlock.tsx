import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TourAnchor } from '../onboarding';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { SectionActionButton } from './SectionActionButton';

type ActionVariant = 'matches' | 'players' | 'sessions';

type Props = {
  title: string;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: ActionVariant;
  children: ReactNode;
  style?: ViewStyle;
  tourAnchorId?: string;
  tourOnFocus?: () => void;
  onTitlePress?: () => void;
  titleAccessibilityLabel?: string;
};

export function SectionBlock({
  title,
  actionLabel,
  onAction,
  actionVariant = 'matches',
  children,
  style,
  tourAnchorId,
  tourOnFocus,
  onTitlePress,
  titleAccessibilityLabel,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const action = (
    <SectionActionButton
      label={actionLabel}
      onPress={onAction}
      variant={actionVariant}
    />
  );

  return (
    <View style={[styles.block, style]}>
      {onTitlePress ? (
        <Pressable
          onPress={onTitlePress}
          accessibilityRole="button"
          accessibilityLabel={titleAccessibilityLabel ?? `Ver ${title}`}
          style={({ pressed }) => [
            styles.titleRow,
            pressed && styles.titlePressed,
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.titleChevron}>›</Text>
        </Pressable>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      <View style={styles.content}>{children}</View>
      {tourAnchorId ? (
        <TourAnchor id={tourAnchorId} onFocus={tourOnFocus}>
          {action}
        </TourAnchor>
      ) : (
        action
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  block: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titlePressed: {
    opacity: 0.75,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
  titleChevron: {
    fontSize: 26,
    fontWeight: '300',
    color: theme.textMuted,
    lineHeight: 28,
  },
  content: {
    gap: 0,
  },
});

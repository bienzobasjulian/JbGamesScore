import { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemedStyles, type AppTheme } from '../theme';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
};

export function HomeCarouselSection({
  title,
  actionLabel = 'Ver todo',
  onAction,
  children,
}: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onAction ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel}: ${title}`}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.action}>
              {actionLabel} {'›'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      gap: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    action: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.accent,
    },
    pressed: {
      opacity: 0.7,
    },
    row: {
      gap: 10,
      paddingRight: 4,
    },
  });

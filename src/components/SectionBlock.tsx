import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../constants';
import { SectionActionButton } from './SectionActionButton';

type ActionVariant = 'matches' | 'players';

type Props = {
  title: string;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: ActionVariant;
  children: ReactNode;
  style?: ViewStyle;
};

export function SectionBlock({
  title,
  actionLabel,
  onAction,
  actionVariant = 'matches',
  children,
  style,
}: Props) {
  return (
    <View style={[styles.block, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
      <SectionActionButton
        label={actionLabel}
        onPress={onAction}
        variant={actionVariant}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
  content: {
    gap: 0,
  },
});

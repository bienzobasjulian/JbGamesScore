import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  title: string;
  subtitle: string;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TemplateListRow({
  title,
  subtitle,
  onPlay,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onPlay}
          style={({ pressed }) => [styles.action, styles.play, pressed && styles.pressed]}
        >
          <Text style={styles.playLabel}>Jugar</Text>
        </Pressable>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionLabel}>Editar</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.deleteLabel}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 10,
  },
  texts: {
    gap: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  action: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  play: {
    borderColor: theme.accent + '55',
    backgroundColor: theme.accent + '14',
  },
  pressed: {
    opacity: 0.8,
  },
  playLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.accent,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },
  deleteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.danger,
  },
});

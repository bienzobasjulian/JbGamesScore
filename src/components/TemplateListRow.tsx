import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import type { TemplateFact } from '../utils/template';
import { FactIcon } from '../screens/GamesListScreen';

type Props = {
  title: string;
  facts: TemplateFact[];
  playersLabel: string | null;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TemplateListRow({
  title,
  facts,
  playersLabel,
  onPlay,
  onEdit,
  onDelete,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.facts}>
        {facts.map((fact) => (
          <View
            key={fact.label}
            style={[
              styles.fact,
              { backgroundColor: toneColor(theme, fact.tone) + '22' },
            ]}
          >
            {fact.icon ? (
              <FactIcon name={fact.icon} color={toneColor(theme, fact.tone)} />
            ) : null}
            <Text style={[styles.factLabel, { color: toneColor(theme, fact.tone) }]}>
              {fact.label}
            </Text>
          </View>
        ))}
      </View>
      {playersLabel ? (
        <View style={styles.playersRow}>
          <FactIcon name="pawns" color={theme.textMuted} />
          <Text style={styles.players} numberOfLines={1}>
            {playersLabel}
          </Text>
        </View>
      ) : null}
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

function toneColor(theme: AppTheme, tone: TemplateFact['tone']): string {
  if (tone === 'high') return theme.success;
  if (tone === 'low') return theme.danger;
  return theme.accent;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 8,
      marginBottom: 10,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
    },
    facts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    fact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    factLabel: {
      fontSize: 12,
      fontWeight: '700',
    },
    playersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    players: {
      flex: 1,
      fontSize: 13,
      color: theme.textMuted,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 2,
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

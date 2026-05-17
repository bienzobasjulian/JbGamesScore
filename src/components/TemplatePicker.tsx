import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { MatchTemplate, SavedPlayer } from '../types';
import { formatTemplateSubtitle } from '../utils/template';

type Props = {
  templates: MatchTemplate[];
  savedPlayers: SavedPlayer[];
  selectedId: string | null;
  onSelect: (template: MatchTemplate | null) => void;
};

export function TemplatePicker({
  templates,
  savedPlayers,
  selectedId,
  onSelect,
}: Props) {
  if (templates.length === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>Plantilla</Text>
        <Text style={styles.empty}>
          Crea plantillas en el menú para reutilizar ajustes y jugadores.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Cargar plantilla</Text>
      <Text style={styles.hint}>
        Rellena el formulario; los cambios aquí no modifican la plantilla
        guardada.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => onSelect(null)}
          style={({ pressed }) => [
            styles.chip,
            selectedId === null && styles.chipSelected,
            pressed && styles.chipPressed,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              selectedId === null && styles.chipTextSelected,
            ]}
          >
            Ninguna
          </Text>
        </Pressable>
        {templates.map((template) => {
          const selected = selectedId === template.id;
          return (
            <Pressable
              key={template.id}
              onPress={() => onSelect(template)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
                numberOfLines={1}
              >
                {template.name}
              </Text>
              <Text
                style={[
                  styles.chipSub,
                  selected && styles.chipSubSelected,
                ]}
                numberOfLines={1}
              >
                {formatTemplateSubtitle(template, savedPlayers)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
  },
  empty: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  chips: {
    gap: 8,
    paddingTop: 4,
    paddingRight: 4,
  },
  chip: {
    maxWidth: 200,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 2,
  },
  chipSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '18',
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  chipTextSelected: {
    color: theme.accent,
  },
  chipSub: {
    fontSize: 11,
    color: theme.textMuted,
  },
  chipSubSelected: {
    color: theme.textMuted,
  },
});

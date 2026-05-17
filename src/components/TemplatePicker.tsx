import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [open, setOpen] = useState(false);

  if (templates.length === 0) {
    return (
      <View style={styles.panel}>
        <Text style={styles.label}>Plantilla</Text>
        <Text style={styles.empty}>
          Crea plantillas en el menú para reutilizar ajustes y jugadores.
        </Text>
      </View>
    );
  }

  const selected = templates.find((t) => t.id === selectedId);
  const triggerLabel = selected?.name ?? 'Sin plantilla';

  const pick = (template: MatchTemplate | null) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Plantilla</Text>
      <Text style={styles.hint}>
        Los cambios aquí no modifican la plantilla guardada.
      </Text>

      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {triggerLabel}
        </Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {open ? (
        <View style={styles.list}>
          <Pressable
            onPress={() => pick(null)}
            style={({ pressed }) => [
              styles.option,
              selectedId === null && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <Text
              style={[
                styles.optionTitle,
                selectedId === null && styles.optionTitleSelected,
              ]}
            >
              Sin plantilla
            </Text>
          </Pressable>

          {templates.map((template, index) => {
            const isSelected = selectedId === template.id;
            const isLast = index === templates.length - 1;
            return (
              <Pressable
                key={template.id}
                onPress={() => pick(template)}
                style={({ pressed }) => [
                  styles.option,
                  isLast && styles.optionLast,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionTitle,
                    isSelected && styles.optionTitleSelected,
                  ]}
                  numberOfLines={1}
                >
                  {template.name}
                </Text>
                <Text style={styles.optionSub} numberOfLines={2}>
                  {formatTemplateSubtitle(template, savedPlayers)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerOpen: {
    borderColor: theme.accent,
  },
  triggerPressed: {
    opacity: 0.9,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
  },
  list: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.surfaceLight,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 2,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionSelected: {
    backgroundColor: theme.accent + '14',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  optionTitleSelected: {
    color: theme.accent,
  },
  optionSub: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 16,
  },
});

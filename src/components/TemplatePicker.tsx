import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
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
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const bottomInset = useSheetBottomInset();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = templates.find((template) => template.id === selectedId);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return templates;
    return templates.filter((template) =>
      template.name.toLocaleLowerCase().includes(needle),
    );
  }, [query, templates]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (template: MatchTemplate | null) => {
    onSelect(template);
    close();
  };

  return (
    <View style={styles.block}>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={templates.length === 0}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Elegir plantilla"
      >
        <Text
          style={[
            styles.triggerText,
            !selected && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {templates.length === 0
            ? 'Sin plantillas guardadas'
            : (selected?.name ?? 'Sin plantilla')}
        </Text>
        {templates.length > 0 ? (
          <Ionicons name="pencil-outline" size={18} color={theme.textMuted} />
        ) : null}
      </Pressable>
      <Text style={styles.hint}>
        Los cambios aquí no modifican la plantilla guardada.
      </Text>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={[styles.sheet, { paddingBottom: 12 + bottomInset }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Plantilla</Text>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar plantilla"
              placeholderTextColor={theme.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                onPress={() => pick(null)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
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
                {selectedId === null ? (
                  <Text style={styles.check}>✓</Text>
                ) : null}
              </Pressable>
              {filtered.length === 0 ? (
                <Text style={styles.empty}>Ninguna plantilla coincide</Text>
              ) : (
                filtered.map((template) => {
                  const isSelected = selectedId === template.id;
                  return (
                    <Pressable
                      key={template.id}
                      onPress={() => pick(template)}
                      style={({ pressed }) => [
                        styles.option,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.optionText}>
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
                      </View>
                      {isSelected ? (
                        <Text style={styles.check}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    block: {
      gap: 6,
    },
    hint: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 18,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    pressed: {
      opacity: 0.7,
    },
    triggerText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    triggerPlaceholder: {
      fontWeight: '600',
      color: theme.textMuted,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      maxHeight: '78%',
      backgroundColor: theme.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 10,
      gap: 12,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      marginBottom: 4,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    search: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
      gap: 12,
    },
    optionText: {
      flex: 1,
      gap: 2,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    optionTitleSelected: {
      color: theme.accent,
      fontWeight: '800',
    },
    optionSub: {
      fontSize: 13,
      color: theme.textMuted,
    },
    check: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.accent,
    },
    empty: {
      paddingVertical: 24,
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 15,
    },
  });

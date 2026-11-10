import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { TemplateListRow } from '../components/TemplateListRow';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { MatchTemplate, SavedPlayer } from '../types';
import { getTemplateFacts } from '../utils/template';

type Props = {
  templates: MatchTemplate[];
  savedPlayers: SavedPlayer[];
  onBack: () => void;
  onCreateTemplate: () => void;
  onPlayTemplate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
};

export function TemplatesListScreen({
  templates,
  savedPlayers,
  onBack,
  onCreateTemplate,
  onPlayTemplate,
  onEditTemplate,
  onDeleteTemplate,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [toDelete, setToDelete] = useState<MatchTemplate | null>(null);
  const [query, setQuery] = useState('');
  const sorted = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...templates]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((template) => {
        if (!needle) return true;
        const facts = getTemplateFacts(template, savedPlayers);
        return [template.name, facts.playersLabel ?? '', ...facts.facts.map((fact) => fact.label)]
          .some((value) => value.toLowerCase().includes(needle));
      });
  }, [query, savedPlayers, templates]);

  const confirmDelete = () => {
    if (!toDelete) return;
    onDeleteTemplate(toDelete.id);
    setToDelete(null);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Plantillas" onBack={onBack} />

      <Text style={styles.intro}>
        Guarda ajustes de rondas, puntos y jugadores habituales. Usa Jugar para
        crear una partida con esa plantilla al instante.
      </Text>

      <Button
        label="Nueva plantilla"
        onPress={onCreateTemplate}
        style={styles.createBtn}
      />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar..."
        placeholderTextColor={theme.textMuted}
        style={styles.search}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {templates.length === 0 ? (
          <Text style={styles.empty}>No hay plantillas guardadas</Text>
        ) : sorted.length === 0 ? (
          <Text style={styles.empty}>Ninguna plantilla coincide con la búsqueda</Text>
        ) : (
          sorted.map((template) => {
            const facts = getTemplateFacts(template, savedPlayers);
            return (
              <TemplateListRow
                key={template.id}
                title={template.name}
                facts={facts.facts}
                playersLabel={facts.playersLabel}
                onPlay={() => onPlayTemplate(template.id)}
                onEdit={() => onEditTemplate(template.id)}
                onDelete={() => setToDelete(template)}
              />
            );
          })
        )}
      </ScrollView>

      <ConfirmModal
        visible={toDelete != null}
        title="¿Eliminar plantilla?"
        message={
          toDelete
            ? `Se borrará «${toDelete.name}». Las partidas ya creadas no se verán afectadas.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  intro: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  createBtn: {
    marginBottom: 12,
  },
  search: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  scroll: {
    paddingBottom: 24,
  },
  empty: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
});

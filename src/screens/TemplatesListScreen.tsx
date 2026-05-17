import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { TemplateListRow } from '../components/TemplateListRow';
import { theme } from '../constants';
import { MatchTemplate, SavedPlayer } from '../types';
import { formatTemplateSubtitle } from '../utils/template';

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
  const [toDelete, setToDelete] = useState<MatchTemplate | null>(null);
  const sorted = [...templates].sort((a, b) => b.updatedAt - a.updatedAt);

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {sorted.length === 0 ? (
          <Text style={styles.empty}>No hay plantillas guardadas</Text>
        ) : (
          sorted.map((template) => (
            <TemplateListRow
              key={template.id}
              title={template.name}
              subtitle={formatTemplateSubtitle(template, savedPlayers)}
              onPlay={() => onPlayTemplate(template.id)}
              onEdit={() => onEditTemplate(template.id)}
              onDelete={() => setToDelete(template)}
            />
          ))
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

const styles = StyleSheet.create({
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
    marginBottom: 16,
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

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { SessionListRow } from '../components/SessionListRow';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Match, PlaySession } from '../types';
import { getAllSessionsSorted } from '../utils/session';

type Props = {
  sessions: PlaySession[];
  matches: Match[];
  onBack: () => void;
  onCreateSession: () => void;
  onOpenSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteSessions: (sessionIds: string[]) => void;
};

export function SessionsListScreen({
  sessions,
  matches,
  onBack,
  onCreateSession,
  onOpenSession,
  onDeleteSession,
  onDeleteSessions,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const sorted = getAllSessionsSorted(sessions);
  const [sessionToDelete, setSessionToDelete] = useState<PlaySession | null>(
    null,
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);

  const toggleSelected = (sessionId: string) => {
    setSelectedIds((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId],
    );
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const startSelection = (sessionId: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) =>
      prev.includes(sessionId) ? prev : [...prev, sessionId],
    );
  };

  const confirmDelete = () => {
    if (!sessionToDelete) return;
    onDeleteSession(sessionToDelete.id);
    setSessionToDelete(null);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteSessions(selectedIds);
    setBulkDeleteVisible(false);
    clearSelection();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Sesiones de juego" onBack={onBack} />

      <Text style={styles.intro}>
        Agrupa partidas de la misma tarde o reunión. Registra quién gana cada
        juego y consulta quién lleva más victorias.
      </Text>

      <View style={styles.actionsRow}>
        <Button
          label="Nueva sesión"
          onPress={onCreateSession}
          style={styles.primaryAction}
        />
        {sorted.length > 0 ? (
          <Button
            label={selectionMode ? 'Cancelar' : 'Seleccionar'}
            onPress={selectionMode ? clearSelection : () => setSelectionMode(true)}
            variant="secondary"
            style={styles.secondaryAction}
          />
        ) : null}
      </View>

      {selectionMode ? (
        <Button
          label={`Eliminar seleccionadas (${selectedIds.length})`}
          onPress={() => setBulkDeleteVisible(true)}
          variant="danger"
          disabled={selectedIds.length === 0}
          style={styles.bulkDeleteBtn}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {sorted.length === 0 ? (
          <Text style={styles.empty}>No hay sesiones guardadas</Text>
        ) : (
          sorted.map((session) => (
            <SessionListRow
              key={session.id}
              session={session}
              matches={matches}
              onPress={() =>
                selectionMode
                  ? toggleSelected(session.id)
                  : onOpenSession(session.id)
              }
              onLongPress={() => startSelection(session.id)}
              onRemove={() => setSessionToDelete(session)}
              selectionMode={selectionMode}
              selected={selectedIds.includes(session.id)}
            />
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={sessionToDelete != null}
        title="¿Eliminar sesión?"
        message={
          sessionToDelete
            ? `Se borrará «${sessionToDelete.name}». Las partidas se conservarán, pero ya no estarán agrupadas.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setSessionToDelete(null)}
      />

      <ConfirmModal
        visible={bulkDeleteVisible}
        title="¿Eliminar sesiones?"
        message={`Se eliminarán ${selectedIds.length} sesiones. Las partidas se conservarán, pero ya no estarán agrupadas.`}
        confirmLabel="Eliminar seleccionadas"
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteVisible(false)}
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    minWidth: 132,
  },
  bulkDeleteBtn: {
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

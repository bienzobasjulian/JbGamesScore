import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { DeleteMatchModal } from '../components/DeleteMatchModal';
import { MatchListRow } from '../components/MatchListRow';
import { theme } from '../constants';
import { Match } from '../types';
import { formatMatchTitle } from '../utils/match';

type Props = {
  matches: Match[];
  onBack: () => void;
  onCreateMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  onDeleteMatch: (matchId: string) => void;
  onDeleteMatches: (matchIds: string[]) => void;
};

export function MatchesListScreen({
  matches,
  onBack,
  onCreateMatch,
  onOpenMatch,
  onDeleteMatch,
  onDeleteMatches,
}: Props) {
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);

  const toggleSelected = (matchId: string) => {
    setSelectedIds((prev) =>
      prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId],
    );
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const startSelection = (matchId: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) => (prev.includes(matchId) ? prev : [...prev, matchId]));
  };

  const confirmDelete = () => {
    if (!matchToDelete) return;
    onDeleteMatch(matchToDelete.id);
    setMatchToDelete(null);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onDeleteMatches(selectedIds);
    setBulkDeleteVisible(false);
    clearSelection();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Partidas" onBack={onBack} />

      <View style={styles.actionsRow}>
        <Button
          label="Nueva partida"
          onPress={onCreateMatch}
          style={styles.primaryAction}
        />
        {matches.length > 0 ? (
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
        {matches.length === 0 ? (
          <Text style={styles.empty}>No hay partidas guardadas</Text>
        ) : (
          matches.map((match) => (
            <MatchListRow
              key={match.id}
              match={match}
              onPress={() =>
                selectionMode ? toggleSelected(match.id) : onOpenMatch(match.id)
              }
              onLongPress={() => startSelection(match.id)}
              onRemove={() => setMatchToDelete(match)}
              selectionMode={selectionMode}
              selected={selectedIds.includes(match.id)}
            />
          ))
        )}
      </ScrollView>

      <DeleteMatchModal
        visible={matchToDelete != null}
        matchTitle={
          matchToDelete ? formatMatchTitle(matchToDelete) : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setMatchToDelete(null)}
      />

      <ConfirmModal
        visible={bulkDeleteVisible}
        title="¿Eliminar partidas?"
        message={`Se eliminarán ${selectedIds.length} partidas y no podrás recuperarlas.`}
        confirmLabel="Eliminar seleccionadas"
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { ListRow } from '../components/ListRow';
import { theme } from '../constants';
import { SavedPlayer } from '../types';

type Props = {
  players: SavedPlayer[];
  onBack: () => void;
  onCreatePlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onRemovePlayers: (ids: string[]) => void;
};

export function PlayersListScreen({
  players,
  onBack,
  onCreatePlayer,
  onRemovePlayer,
  onRemovePlayers,
}: Props) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
  const sorted = [...players].sort((a, b) => b.lastUsedAt - a.lastUsedAt);

  const toggleSelected = (playerId: string) => {
    setSelectedIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const startSelection = (playerId: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]));
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onRemovePlayers(selectedIds);
    setBulkDeleteVisible(false);
    clearSelection();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Jugadores" onBack={onBack} />

      <View style={styles.actionsRow}>
        <Button
          label="Nuevo jugador"
          onPress={onCreatePlayer}
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
          label={`Eliminar seleccionados (${selectedIds.length})`}
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
          <Text style={styles.empty}>No hay jugadores guardados</Text>
        ) : (
          sorted.map((player) => (
            <ListRow
              key={player.id}
              title={player.name}
              color={player.color}
              onPress={
                selectionMode ? () => toggleSelected(player.id) : undefined
              }
              onLongPress={() => startSelection(player.id)}
              onRemove={() => onRemovePlayer(player.id)}
              selectionMode={selectionMode}
              selected={selectedIds.includes(player.id)}
            />
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={bulkDeleteVisible}
        title="¿Eliminar jugadores?"
        message={`Se eliminarán ${selectedIds.length} jugadores guardados.`}
        confirmLabel="Eliminar seleccionados"
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

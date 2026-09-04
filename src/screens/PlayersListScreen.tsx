import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { CreateGroupSheet } from '../components/CreateGroupSheet';
import { CreatePlayerSheet } from '../components/CreatePlayerSheet';
import { EditGroupSheet } from '../components/EditGroupSheet';
import { EditPlayerSheet } from '../components/EditPlayerSheet';
import { ListRow } from '../components/ListRow';
import { SectionLabel } from '../components/SectionLabel';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Player, PlayerGroup, SavedPlayer } from '../types';
import { formatGroupSubtitle, sortGroupsByName } from '../utils/groups';
import { formatPlayerLastUsed } from '../utils/players';

const GROUP_COLOR = '#9B59B6';

type Props = {
  players: SavedPlayer[];
  groups: PlayerGroup[];
  onBack: () => void;
  onCreatePlayer: (name: string, avatar?: string | null) => Player | null;
  onCreateGroup: (name: string) => string | null;
  onUpdateGroup: (
    groupId: string,
    patch: { name: string; playerIds: string[] },
  ) => void;
  onDeleteGroup: (groupId: string) => void;
  onRemoveGroups: (ids: string[]) => void;
  onUpdatePlayer: (
    playerId: string,
    patch: { name: string; color: string; avatar?: string | null },
  ) => boolean;
  onRemovePlayer: (id: string) => void;
  onRemovePlayers: (ids: string[]) => void;
  selfPlayerId?: string | null;
  onSetSelfPlayerId: (playerId: string | null) => void;
};

function formatBulkDeleteMessage(
  playerCount: number,
  groupCount: number,
): string {
  const parts: string[] = [];
  if (playerCount > 0) {
    parts.push(
      playerCount === 1
        ? '1 jugador guardado'
        : `${playerCount} jugadores guardados`,
    );
  }
  if (groupCount > 0) {
    parts.push(groupCount === 1 ? '1 grupo' : `${groupCount} grupos`);
  }
  return `Se eliminarán ${parts.join(' y ')}.`;
}

export function PlayersListScreen({
  players,
  groups,
  onBack,
  onCreatePlayer,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onRemoveGroups,
  onUpdatePlayer,
  onRemovePlayer,
  onRemovePlayers,
  selfPlayerId = null,
  onSetSelfPlayerId,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
  const [createPlayerSheetVisible, setCreatePlayerSheetVisible] =
    useState(false);
  const [createGroupSheetVisible, setCreateGroupSheetVisible] =
    useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  const sortedPlayers = [...players].sort(
    (a, b) => b.lastUsedAt - a.lastUsedAt,
  );
  const sortedGroups = sortGroupsByName(groups);
  const editingGroup = useMemo(
    () => groups.find((group) => group.id === editingGroupId) ?? null,
    [editingGroupId, groups],
  );
  const editingPlayer = useMemo(
    () => players.find((player) => player.id === editingPlayerId) ?? null,
    [editingPlayerId, players],
  );

  const hasSelectableItems =
    sortedPlayers.length > 0 || sortedGroups.length > 0;
  const selectedCount = selectedPlayerIds.length + selectedGroupIds.length;

  const togglePlayerSelected = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const toggleGroupSelected = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedPlayerIds([]);
    setSelectedGroupIds([]);
  };

  const startPlayerSelection = (playerId: string) => {
    setSelectionMode(true);
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev : [...prev, playerId],
    );
  };

  const startGroupSelection = (groupId: string) => {
    setSelectionMode(true);
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev : [...prev, groupId],
    );
  };

  const confirmBulkDelete = () => {
    if (selectedPlayerIds.length > 0) {
      onRemovePlayers(selectedPlayerIds);
    }
    if (selectedGroupIds.length > 0) {
      onRemoveGroups(selectedGroupIds);
    }
    setBulkDeleteVisible(false);
    clearSelection();
  };

  const handleCreateGroup = (name: string) => {
    const groupId = onCreateGroup(name);
    if (groupId) {
      setEditingGroupId(groupId);
    }
    return groupId;
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Jugadores" onBack={onBack} />

      <View style={styles.actionsRow}>
        <Button
          label="Nuevo jugador"
          onPress={() => setCreatePlayerSheetVisible(true)}
          style={styles.primaryAction}
        />
        <Button
          label="Nuevo grupo"
          onPress={() => setCreateGroupSheetVisible(true)}
          variant="secondary"
          style={styles.secondaryAction}
        />
      </View>

      {hasSelectableItems ? (
        <View style={styles.actionsRowSecondary}>
          <Button
            label={selectionMode ? 'Cancelar' : 'Seleccionar'}
            onPress={selectionMode ? clearSelection : () => setSelectionMode(true)}
            variant="secondary"
            style={styles.selectAction}
          />
        </View>
      ) : null}

      {selectionMode ? (
        <Button
          label={`Eliminar seleccionados (${selectedCount})`}
          onPress={() => setBulkDeleteVisible(true)}
          variant="danger"
          disabled={selectedCount === 0}
          style={styles.bulkDeleteBtn}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel label="Grupos" />
        {sortedGroups.length === 0 ? (
          <Text style={styles.emptySection}>
            Crea grupos para añadir varios jugadores a la vez en una partida.
          </Text>
        ) : (
          sortedGroups.map((group) => (
            <ListRow
              key={group.id}
              title={group.name}
              subtitle={formatGroupSubtitle(group, players)}
              color={GROUP_COLOR}
              onPress={
                selectionMode
                  ? () => toggleGroupSelected(group.id)
                  : () => setEditingGroupId(group.id)
              }
              onLongPress={() => startGroupSelection(group.id)}
              selectionMode={selectionMode}
              selected={selectedGroupIds.includes(group.id)}
            />
          ))
        )}

        <View style={styles.playersSection}>
          <SectionLabel label="Jugadores" />
        </View>
        {sortedPlayers.length === 0 ? (
          <Text style={styles.empty}>No hay jugadores guardados</Text>
        ) : (
          sortedPlayers.map((player) => (
            <ListRow
              key={player.id}
              title={player.name}
              subtitle={formatPlayerLastUsed(player.lastUsedAt)}
              badge={player.id === selfPlayerId ? 'Tú' : undefined}
              color={player.color}
              avatar={player.avatar}
              playerName={player.name}
              onPress={
                selectionMode
                  ? () => togglePlayerSelected(player.id)
                  : () => setEditingPlayerId(player.id)
              }
              onLongPress={() => startPlayerSelection(player.id)}
              onRemove={
                selectionMode ? undefined : () => onRemovePlayer(player.id)
              }
              selectionMode={selectionMode}
              selected={selectedPlayerIds.includes(player.id)}
            />
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={bulkDeleteVisible}
        title="¿Eliminar seleccionados?"
        message={formatBulkDeleteMessage(
          selectedPlayerIds.length,
          selectedGroupIds.length,
        )}
        confirmLabel="Eliminar seleccionados"
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteVisible(false)}
      />

      <CreatePlayerSheet
        visible={createPlayerSheetVisible}
        existingCount={players.length}
        onClose={() => setCreatePlayerSheetVisible(false)}
        onCreate={onCreatePlayer}
      />

      <CreateGroupSheet
        visible={createGroupSheetVisible}
        onClose={() => setCreateGroupSheetVisible(false)}
        onCreate={handleCreateGroup}
      />

      <EditGroupSheet
        visible={editingGroup != null}
        group={editingGroup}
        players={players}
        onClose={() => setEditingGroupId(null)}
        onSave={onUpdateGroup}
        onDelete={onDeleteGroup}
      />

      <EditPlayerSheet
        visible={editingPlayer != null}
        player={editingPlayer}
        isSelf={editingPlayer?.id === selfPlayerId}
        onClose={() => setEditingPlayerId(null)}
        onSave={onUpdatePlayer}
        onSetSelf={(isSelf) => {
          if (!editingPlayer) return;
          if (isSelf) {
            onSetSelfPlayerId(editingPlayer.id);
            return;
          }
          if (editingPlayer.id === selfPlayerId) {
            onSetSelfPlayerId(null);
          }
        }}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionsRowSecondary: {
    marginBottom: 16,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    flex: 1,
  },
  selectAction: {
    alignSelf: 'flex-start',
    minWidth: 132,
  },
  bulkDeleteBtn: {
    marginBottom: 16,
  },
  scroll: {
    paddingBottom: 24,
  },
  playersSection: {
    marginTop: 20,
    marginBottom: 2,
  },
  emptySection: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  empty: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});

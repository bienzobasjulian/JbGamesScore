import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { theme } from '../constants';
import { GameSettings, MatchTemplate, Player, SavedPlayer } from '../types';
import { defaultSettings } from '../utils/game';
type Props = {
  template?: MatchTemplate;
  savedPlayers: SavedPlayer[];
  onBack: () => void;
  onSave: (draft: {
    id?: string;
    name: string;
    settings: GameSettings;
    playerIds: string[];
  }) => string | null;
  onDelete?: () => void;
  onAddFromSaved: (player: SavedPlayer) => Player;
  onCreateNewPlayer: (name: string, existing: Player[]) => Player | null;
};

export function EditTemplateScreen({
  template,
  savedPlayers,
  onBack,
  onSave,
  onDelete,
  onAddFromSaved,
  onCreateNewPlayer,
}: Props) {
  const isNew = template == null;
  const [name, setName] = useState(template?.name ?? '');
  const [settings, setSettings] = useState<GameSettings>(
    template?.settings ?? defaultSettings(),
  );
  const [playerIds, setPlayerIds] = useState<string[]>(
    template?.playerIds ?? [],
  );
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rosterPlayers = useMemo(
    () =>
      playerIds
        .map((id) => savedPlayers.find((p) => p.id === id))
        .filter((p): p is SavedPlayer => p != null)
        .map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        })),
    [playerIds, savedPlayers],
  );

  const selectedIds = useMemo(() => new Set(playerIds), [playerIds]);

  const handleAddSaved = (saved: SavedPlayer) => {
    if (selectedIds.has(saved.id)) return;
    onAddFromSaved(saved);
    setPlayerIds((prev) => [...prev, saved.id]);
  };

  const handleToggleSaved = (saved: SavedPlayer) => {
    if (selectedIds.has(saved.id)) {
      handleRemove(saved.id);
      return;
    }
    handleAddSaved(saved);
  };

  const handleAddNew = (playerName: string) => {
    const player = onCreateNewPlayer(playerName, rosterPlayers);
    if (!player) return false;
    if (playerIds.includes(player.id)) return false;
    setPlayerIds((prev) => [...prev, player.id]);
    return true;
  };

  const handleRemove = (id: string) => {
    setPlayerIds((prev) => prev.filter((pid) => pid !== id));
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('El nombre de la plantilla es obligatorio');
      return;
    }
    const id = onSave({
      id: template?.id,
      name: trimmed,
      settings,
      playerIds,
    });
    if (id) {
      onBack();
    } else {
      setError('No se pudo guardar la plantilla');
    }
  };

  const formBlock = (
    <View style={styles.headerBlock}>
      <View style={styles.namePanel}>
        <Text style={styles.nameLabel}>Nombre de la plantilla</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Ej. Domino en familia"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError(null);
          }}
          maxLength={40}
          returnKeyType="done"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <GameSettingsPanel settings={settings} onChange={setSettings} />

      <MatchPlayerRoster
        title="Jugadores habituales"
        intro="Opcional. Se cargarán al usar esta plantilla en una partida nueva."
        savedPlayers={savedPlayers}
        selectedIds={selectedIds}
        onToggleSaved={handleToggleSaved}
        onAddNew={handleAddNew}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title={isNew ? 'Nueva plantilla' : 'Editar plantilla'}
        onBack={onBack}
      />

      <ReorderablePlayersList
        players={rosterPlayers}
        contentContainerStyle={styles.list}
        listHeaderComponent={
          <>
            {formBlock}
          </>
        }
        listFooterComponent={
          <View style={styles.footer}>
            <Button label="Guardar plantilla" onPress={handleSave} />
            {!isNew && onDelete ? (
              <Button
                label="Eliminar plantilla"
                onPress={() => setDeleteVisible(true)}
                variant="danger"
              />
            ) : null}
          </View>
        }
        onChange={(players) => setPlayerIds(players.map((player) => player.id))}
        onRemove={handleRemove}
      />

      <ConfirmModal
        visible={deleteVisible}
        title="¿Eliminar plantilla?"
        message={
          template
            ? `Se borrará «${template.name}» permanentemente.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          setDeleteVisible(false);
          onDelete?.();
        }}
        onCancel={() => setDeleteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerBlock: {
    gap: 16,
    marginBottom: 12,
  },
  namePanel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  nameInput: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  error: {
    fontSize: 13,
    color: theme.danger,
  },
  playersSection: {
    gap: 10,
  },
  playersTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  playersHint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 2,
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  footer: {
    paddingTop: 16,
    gap: 10,
  },
});

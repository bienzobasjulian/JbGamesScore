import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { theme } from '../constants';
import { GameSettings, Match, Player, SavedPlayer } from '../types';
import { ensureMatchPlayers } from '../utils/players';

type Props = {
  match: Match;
  savedPlayers: SavedPlayer[];
  onBack: () => void;
  onSave: (
    players: Player[],
    settings: GameSettings,
    name: string | null,
  ) => void;
  onAddFromSaved: (player: SavedPlayer) => Player;
  onCreateNewPlayer: (name: string, existing: Player[]) => Player | null;
};

export function EditMatchScreen({
  match,
  savedPlayers,
  onBack,
  onSave,
  onAddFromSaved,
  onCreateNewPlayer,
}: Props) {
  const [settings, setSettings] = useState<GameSettings>(match.settings);
  const [matchName, setMatchName] = useState(match.name ?? '');
  const [players, setPlayers] = useState<Player[]>(match.players);

  const selectedIds = useMemo(
    () => new Set(players.map((player) => player.id)),
    [players],
  );

  const handleAddSaved = (saved: SavedPlayer) => {
    if (selectedIds.has(saved.id)) return;
    const player = onAddFromSaved(saved);
    setPlayers((prev) => [...prev, player]);
  };

  const handleToggleSaved = (saved: SavedPlayer) => {
    if (selectedIds.has(saved.id)) {
      setPlayers((prev) => prev.filter((player) => player.id !== saved.id));
      return;
    }
    handleAddSaved(saved);
  };

  const handleAddNew = (name: string) => {
    const player = onCreateNewPlayer(name, players);
    if (!player) return false;
    if (players.some((existing) => existing.id === player.id)) return false;
    setPlayers((prev) => [...prev, player]);
    return true;
  };

  const handleSave = () => {
    const roster = ensureMatchPlayers(players, onCreateNewPlayer);
    onSave(roster, settings, matchName.trim() || null);
  };

  const header = (
    <View style={styles.headerBlock}>
      <Text style={styles.hint}>
        Los puntos de los jugadores que mantengas se conservarán. Si quitas a
        alguien, perderás sus puntuaciones.
      </Text>

      <View style={styles.namePanel}>
        <Text style={styles.nameLabel}>Nombre de la partida (opcional)</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Ej. Domino del viernes"
          placeholderTextColor={theme.textMuted}
          value={matchName}
          onChangeText={setMatchName}
          maxLength={40}
          returnKeyType="done"
        />
      </View>

      <GameSettingsPanel settings={settings} onChange={setSettings} />

      <MatchPlayerRoster
        savedPlayers={savedPlayers}
        selectedIds={selectedIds}
        onToggleSaved={handleToggleSaved}
        onAddNew={handleAddNew}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Editar partida" onBack={onBack} />

      <ReorderablePlayersList
        players={players}
        contentContainerStyle={styles.list}
        listHeaderComponent={header}
        listEmptyComponent={
          <Text style={styles.empty}>
            Añade al menos un jugador para continuar.
          </Text>
        }
        listFooterComponent={
          <View style={styles.footer}>
            <Button label="Guardar cambios" onPress={handleSave} />
          </View>
        }
        onChange={setPlayers}
        onRemove={(playerId) =>
          setPlayers((prev) => prev.filter((player) => player.id !== playerId))
        }
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
  hint: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
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
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  empty: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
  },
  footer: {
    paddingTop: 16,
  },
});

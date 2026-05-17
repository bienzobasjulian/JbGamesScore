import { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AddPlayerInput } from '../components/AddPlayerInput';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { PlayerCard } from '../components/PlayerCard';
import { SavedPlayerPicker } from '../components/SavedPlayerPicker';
import { theme } from '../constants';
import { GameSettings, Player, SavedPlayer } from '../types';
import { defaultSettings } from '../utils/game';

type Props = {
  savedPlayers: SavedPlayer[];
  onBack: () => void;
  onStart: (players: Player[], settings: GameSettings, name?: string | null) => void;
  onAddFromSaved: (player: SavedPlayer) => Player;
  onCreateNewPlayer: (name: string, existing: Player[]) => Player | null;
};

export function CreateMatchScreen({
  savedPlayers,
  onBack,
  onStart,
  onAddFromSaved,
  onCreateNewPlayer,
}: Props) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings());
  const [matchName, setMatchName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  const selectedIds = useMemo(
    () => new Set(players.map((p) => p.id)),
    [players],
  );

  const canStart = players.length >= 2;

  const handleAddSaved = (saved: SavedPlayer) => {
    if (selectedIds.has(saved.id)) return;
    const player = onAddFromSaved(saved);
    setPlayers((prev) => [...prev, player]);
  };

  const handleAddNew = (name: string) => {
    const player = onCreateNewPlayer(name, players);
    if (!player) return false;
    if (players.some((p) => p.id === player.id)) return false;
    setPlayers((prev) => [...prev, player]);
    return true;
  };

  const handleRemove = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStart = () => {
    if (canStart) {
      onStart(players, settings, matchName.trim() || null);
    }
  };

  const header = (
    <View style={styles.headerBlock}>
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

      <View style={styles.playersSection}>
        <Text style={styles.playersTitle}>Jugadores</Text>
        <Text style={styles.playersHint}>Guardados</Text>
        <SavedPlayerPicker
          players={savedPlayers}
          selectedIds={selectedIds}
          onSelect={handleAddSaved}
        />
        <Text style={styles.playersHint}>Nuevo nombre</Text>
        <AddPlayerInput onAdd={handleAddNew} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Nueva partida" onBack={onBack} />

      {players.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {header}
          <Text style={styles.empty}>Añade al menos 2 jugadores</Text>
          <Button
            label="Comenzar partida"
            onPress={handleStart}
            disabled={!canStart}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={header}
          ListFooterComponent={
            <View style={styles.footer}>
              <Button
                label="Comenzar partida"
                onPress={handleStart}
                disabled={!canStart}
              />
            </View>
          }
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              total={0}
              roundScore={0}
              onAdjust={() => {}}
              onRemove={() => handleRemove(item.id)}
              showRoundControls={false}
              showTotal={false}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    gap: 16,
    paddingBottom: 24,
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
  empty: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 16,
  },
  footer: {
    paddingTop: 16,
    gap: 10,
  },
});

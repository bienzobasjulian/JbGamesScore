import { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AddPlayerInput } from '../components/AddPlayerInput';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { PlayerCard } from '../components/PlayerCard';
import { SavedPlayerPicker } from '../components/SavedPlayerPicker';
import { theme } from '../constants';
import { Player, SavedPlayer } from '../types';

type Props = {
  savedPlayers: SavedPlayer[];
  initialPlayers?: Player[];
  onBack: () => void;
  onStart: (players: Player[]) => void;
  onAddFromSaved: (player: SavedPlayer) => Player;
  onCreateNewPlayer: (name: string, existing: Player[]) => Player | null;
};

export function PelusasSetupScreen({
  savedPlayers,
  initialPlayers = [],
  onBack,
  onStart,
  onAddFromSaved,
  onCreateNewPlayer,
}: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

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

  const rosterBlock = (
    <View style={styles.playersSection}>
      <Text style={styles.intro}>
        Añade quién juega esta mano. Después indicaréis cuántas cartas del 1 al
        10 tiene cada jugador (y las de Revolution, si las activáis).
      </Text>
      <Text style={styles.playersHint}>Guardados</Text>
      <SavedPlayerPicker
        players={savedPlayers}
        selectedIds={selectedIds}
        onSelect={handleAddSaved}
      />
      <Text style={styles.playersHint}>Nuevo nombre</Text>
      <AddPlayerInput onAdd={handleAddNew} />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Contador de pelusas" onBack={onBack} />

      {players.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {rosterBlock}
          <Text style={styles.empty}>Añade al menos 2 jugadores</Text>
          <Button
            label="Contar puntos"
            onPress={() => onStart(players)}
            disabled={!canStart}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={rosterBlock}
          ListFooterComponent={
            <View style={styles.footer}>
              <Button
                label="Contar puntos"
                onPress={() => onStart(players)}
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
              onRemove={() =>
                setPlayers((prev) => prev.filter((p) => p.id !== item.id))
              }
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
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  intro: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 4,
  },
  playersSection: {
    gap: 10,
    marginBottom: 12,
  },
  playersHint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
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

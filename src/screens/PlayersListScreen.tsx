import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ListRow } from '../components/ListRow';
import { theme } from '../constants';
import { SavedPlayer } from '../types';

type Props = {
  players: SavedPlayer[];
  onBack: () => void;
  onCreatePlayer: () => void;
  onRemovePlayer: (id: string) => void;
};

export function PlayersListScreen({
  players,
  onBack,
  onCreatePlayer,
  onRemovePlayer,
}: Props) {
  const sorted = [...players].sort((a, b) => b.lastUsedAt - a.lastUsedAt);

  return (
    <View style={styles.container}>
      <AppHeader title="Jugadores" onBack={onBack} />

      <Button
        label="Nuevo jugador"
        onPress={onCreatePlayer}
        style={styles.createBtn}
      />

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
              onRemove={() => onRemovePlayer(player.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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

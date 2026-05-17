import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AddPlayerInput } from '../components/AddPlayerInput';
import { Button } from '../components/Button';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { PlayerCard } from '../components/PlayerCard';
import { theme } from '../constants';
import { GameSettings, GameState } from '../types';

type Props = {
  state: GameState;
  onAddPlayer: (name: string) => boolean;
  onRemovePlayer: (id: string) => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onStart: () => void;
};

export function SetupScreen({
  state,
  onAddPlayer,
  onRemovePlayer,
  onUpdateSettings,
  onStart,
}: Props) {
  const canStart = state.players.length >= 2;

  const handleStart = () => {
    if (canStart) onStart();
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🎲</Text>
        <Text style={styles.title}>Jb Games Score</Text>
        <Text style={styles.subtitle}>
          Contador de puntos para tus partidas de mesa
        </Text>
      </View>

      <GameSettingsPanel
        settings={state.settings}
        onChange={onUpdateSettings}
      />

      <AddPlayerInput onAdd={onAddPlayer} />
    </View>
  );

  return (
    <View style={styles.container}>
      {state.players.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {listHeader}
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Añade jugadores para empezar
            </Text>
          </View>
          <View style={styles.footer}>
            <Button
              label="Comenzar partida"
              onPress={handleStart}
              disabled={!canStart}
            />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={state.players}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={listHeader}
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
              onRemove={() => onRemovePlayer(item.id)}
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
    gap: 20,
    flexGrow: 1,
  },
  headerBlock: {
    gap: 20,
    marginBottom: 12,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 16,
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  footer: {
    gap: 10,
    paddingTop: 16,
    marginTop: 4,
  },
});

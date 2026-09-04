import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { GameSettingsPanel } from '../components/GameSettingsPanel';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { EditMatchDraft } from '../types/playerSelection';
import { AppScreen, GameSettings, Match, Player, SavedPlayer } from '../types';
import { ensureMatchPlayers } from '../utils/players';

type Props = {
  match: Match;
  savedPlayers: SavedPlayer[];
  restoredDraft?: EditMatchDraft | null;
  onBack: () => void;
  onSave: (
    players: Player[],
    settings: GameSettings,
    name: string | null,
  ) => void;
  onOpenPlayerSelection: (config: {
    draftKey: 'editMatch';
    parentDraft: EditMatchDraft;
    players: Player[];
    maxPlayers: number;
    allowAnonymous: boolean;
    returnScreen: AppScreen;
  }) => void;
  selfPlayer?: Player | null;
};

export function EditMatchScreen({
  match,
  savedPlayers: _savedPlayers,
  restoredDraft,
  onBack,
  onSave,
  onOpenPlayerSelection,
  selfPlayer = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [settings, setSettings] = useState<GameSettings>(
    restoredDraft?.settings ?? match.settings,
  );
  const [matchName, setMatchName] = useState(
    restoredDraft?.matchName ?? match.name ?? '',
  );
  const [players, setPlayers] = useState<Player[]>(
    restoredDraft?.players ?? match.players,
  );

  const handleChoosePlayers = () => {
    onOpenPlayerSelection({
      draftKey: 'editMatch',
      parentDraft: { settings, matchName, players },
      players,
      maxPlayers: Number.POSITIVE_INFINITY,
      allowAnonymous: true,
      returnScreen: { type: 'editMatch', matchId: match.id },
    });
  };

  const handleSave = () => {
    const roster = ensureMatchPlayers(players, selfPlayer);
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
        playerCount={players.length}
        onChoosePlayers={handleChoosePlayers}
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
            Pulsa «Elegir jugadores» para añadir al menos uno.
          </Text>
        }
        onChange={setPlayers}
        onRemove={(playerId) =>
          setPlayers((prev) => prev.filter((player) => player.id !== playerId))
        }
      />

      <View style={styles.footer}>
        <Button label="Guardar cambios" onPress={handleSave} />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

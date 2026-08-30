import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { ReorderablePlayersList } from '../components/ReorderablePlayersList';
import { theme } from '../constants';
import { PelusasSetupDraft } from '../types/playerSelection';
import { AppScreen, Player, SavedPlayer } from '../types';
import { ensureMatchPlayers } from '../utils/players';

type Props = {
  savedPlayers: SavedPlayer[];
  initialPlayers?: Player[];
  restoredDraft?: PelusasSetupDraft | null;
  onBack: () => void;
  onStart: (players: Player[]) => void;
  onOpenPlayerSelection: (config: {
    draftKey: 'pelusasSetup';
    parentDraft: PelusasSetupDraft;
    players: Player[];
    maxPlayers: number;
    allowAnonymous: boolean;
    returnScreen: AppScreen;
  }) => void;
  onCreateNewPlayer: (name: string, existing: Player[]) => Player | null;
};

export function PelusasSetupScreen({
  savedPlayers: _savedPlayers,
  initialPlayers = [],
  restoredDraft,
  onBack,
  onStart,
  onOpenPlayerSelection,
  onCreateNewPlayer,
}: Props) {
  const [players, setPlayers] = useState<Player[]>(
    restoredDraft?.players ?? initialPlayers,
  );

  const handleChoosePlayers = () => {
    onOpenPlayerSelection({
      draftKey: 'pelusasSetup',
      parentDraft: { players },
      players,
      maxPlayers: Number.POSITIVE_INFINITY,
      allowAnonymous: true,
      returnScreen: { type: 'pelusasSetup' },
    });
  };

  const handleStart = () => {
    onStart(ensureMatchPlayers(players, onCreateNewPlayer));
  };

  const rosterBlock = (
    <MatchPlayerRoster
      intro="Añade quién juega esta mano. Después indicaréis cuántas cartas del 1 al 10 tiene cada jugador (y las de Revolution, si las activáis)."
      playerCount={players.length}
      onChoosePlayers={handleChoosePlayers}
      soloHint="Sin jugadores seleccionados se usará un jugador «Yo» solo para este conteo."
    />
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Contador de pelusas" onBack={onBack} />

      <ReorderablePlayersList
        players={players}
        contentContainerStyle={styles.list}
        listHeaderComponent={rosterBlock}
        listEmptyComponent={
          <Text style={styles.empty}>
            Pulsa «Elegir jugadores» para añadir quién juega.
          </Text>
        }
        onChange={setPlayers}
        onRemove={(playerId) =>
          setPlayers((prev) => prev.filter((p) => p.id !== playerId))
        }
      />

      <View style={styles.footer}>
        <Button label="Contar puntos" onPress={handleStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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

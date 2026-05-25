import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { SavedPlayer } from '../types';
import { AddPlayerInput } from './AddPlayerInput';
import { SavedPlayerPicker } from './SavedPlayerPicker';

type Props = {
  savedPlayers: SavedPlayer[];
  selectedIds: Set<string>;
  onToggleSaved: (player: SavedPlayer) => void;
  onAddNew: (name: string) => boolean;
  title?: string;
  intro?: string;
  soloHint?: string;
  atPlayerCap?: boolean;
};

export function MatchPlayerRoster({
  savedPlayers,
  selectedIds,
  onToggleSaved,
  onAddNew,
  title = 'Jugadores',
  intro,
  soloHint,
  atPlayerCap = false,
}: Props) {
  return (
    <View style={styles.section}>
      {intro ? <Text style={styles.intro}>{intro}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {soloHint ? <Text style={styles.soloHint}>{soloHint}</Text> : null}

      <Text style={styles.hint}>Nuevo nombre</Text>
      <AddPlayerInput onAdd={onAddNew} disabled={atPlayerCap} />

      <Text style={styles.hint}>Guardados</Text>
      <SavedPlayerPicker
        players={savedPlayers}
        selectedIds={selectedIds}
        onToggle={onToggleSaved}
        atPlayerCap={atPlayerCap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  intro: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },
  soloHint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  hint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 2,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { SavedPlayer } from '../types';

type Props = {
  players: SavedPlayer[];
  selectedIds: Set<string>;
  onSelect: (player: SavedPlayer) => void;
};

export function SavedPlayerPicker({ players, selectedIds, onSelect }: Props) {
  if (players.length === 0) {
    return (
      <Text style={styles.empty}>No tienes jugadores guardados todavía</Text>
    );
  }

  return (
    <View style={styles.list}>
      {players.map((player) => {
        const selected = selectedIds.has(player.id);
        return (
          <Pressable
            key={player.id}
            onPress={() => onSelect(player)}
            disabled={selected}
            style={({ pressed }) => [
              styles.row,
              selected && styles.rowSelected,
              pressed && !selected && styles.rowPressed,
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: player.color }]}>
              <Text style={styles.avatarText}>
                {player.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text
              style={[styles.name, selected && styles.nameMuted]}
              numberOfLines={1}
            >
              {player.name}
            </Text>
            {selected ? (
              <Text style={styles.added}>Añadido</Text>
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  rowSelected: {
    opacity: 0.5,
  },
  rowPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  nameMuted: {
    color: theme.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: theme.textMuted,
    fontWeight: '300',
  },
  added: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  empty: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
});

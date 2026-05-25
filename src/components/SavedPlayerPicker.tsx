import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { SavedPlayer } from '../types';

type Props = {
  players: SavedPlayer[];
  selectedIds: Set<string>;
  onToggle: (player: SavedPlayer) => void;
  atPlayerCap?: boolean;
};

export function SavedPlayerPicker({
  players,
  selectedIds,
  onToggle,
  atPlayerCap = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (players.length === 0) {
    return (
      <Text style={styles.empty}>No tienes jugadores guardados todavía</Text>
    );
  }

  const selectedCount = players.filter((player) => selectedIds.has(player.id)).length;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.rowPressed,
        ]}
      >
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Jugadores guardados</Text>
          <Text style={styles.headerSubtitle}>{players.length} disponibles</Text>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.count}>{selectedCount}</Text>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {expanded ? (
        <ScrollView style={styles.list} nestedScrollEnabled>
          <View style={styles.listContent}>
            {players.map((player) => {
              const selected = selectedIds.has(player.id);
              const disabled = atPlayerCap && !selected;

              return (
                <Pressable
                  key={player.id}
                  onPress={() => onToggle(player)}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    disabled && styles.rowDisabled,
                    pressed && !disabled && styles.rowPressed,
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: player.color }]}>
                    <Text style={styles.avatarText}>
                      {player.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected,
                      disabled && styles.checkboxDisabled,
                    ]}
                  >
                    <Text style={styles.checkboxText}>{selected ? '✓' : ''}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  count: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1419',
    backgroundColor: theme.accent,
  },
  list: {
    maxHeight: 240,
  },
  listContent: {
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
    borderColor: theme.accent,
    backgroundColor: theme.accentDark + '22',
  },
  rowDisabled: {
    opacity: 0.45,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  checkboxSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accent,
  },
  checkboxDisabled: {
    backgroundColor: theme.surfaceLight,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F1419',
  },
  chevron: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
});

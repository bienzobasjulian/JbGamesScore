import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { CardCountStepper } from '../components/CardCountStepper';
import { CreatePlayerSheet } from '../components/CreatePlayerSheet';
import { theme } from '../constants';
import { Player, PlayerGroup, SavedPlayer } from '../types';
import {
  formatGroupSubtitle,
  sortGroupsByName,
} from '../utils/groups';
import {
  buildRosterFromSelection,
  parseRosterPlayers,
} from '../utils/playerSelection';
import { formatPlayerLastUsed, getPlayerAvatarTextColor } from '../utils/players';

const GROUP_COLOR = '#9B59B6';

type Props = {
  savedPlayers: SavedPlayer[];
  groups: PlayerGroup[];
  initialPlayers: Player[];
  maxPlayers: number;
  allowAnonymous: boolean;
  onBack: () => void;
  onConfirm: (players: Player[]) => void;
  onCreatePlayer: (name: string) => Player | null;
};

function PlayerSelectRow({
  player,
  selected,
  disabled,
  onToggle,
  subtitle,
}: {
  player: Pick<Player, 'id' | 'name' | 'color'>;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  subtitle?: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        disabled && styles.rowDisabled,
        pressed && !disabled && styles.rowPressed,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: player.color }]}>
        <Text
          style={[
            styles.avatarText,
            { color: getPlayerAvatarTextColor(player.color) },
          ]}
        >
          {player.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {player.name}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.checkbox,
          selected && styles.checkboxSelected,
          disabled && styles.checkboxDisabled,
        ]}
      >
        <Text style={styles.checkboxMark}>{selected ? '✓' : ''}</Text>
      </View>
    </Pressable>
  );
}

export function SelectPlayersScreen({
  savedPlayers,
  groups,
  initialPlayers,
  maxPlayers,
  allowAnonymous,
  onBack,
  onConfirm,
  onCreatePlayer,
}: Props) {
  const initial = useMemo(
    () => parseRosterPlayers(initialPlayers),
    [initialPlayers],
  );

  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initial.savedPlayers.map((player) => player.id)),
  );
  const [anonymousCount, setAnonymousCount] = useState(initial.anonymousCount);
  const [createSheetVisible, setCreateSheetVisible] = useState(false);

  const sortedPlayers = useMemo(
    () => [...savedPlayers].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [savedPlayers],
  );

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedPlayers;
    return sortedPlayers.filter((player) =>
      player.name.toLowerCase().includes(q),
    );
  }, [query, sortedPlayers]);

  const hasMax = Number.isFinite(maxPlayers);
  const selectedSavedCount = selectedIds.size;
  const totalSelected = selectedSavedCount + anonymousCount;
  const slotsLeft = hasMax ? maxPlayers - totalSelected : Number.POSITIVE_INFINITY;
  const canAddMore = slotsLeft > 0;

  useEffect(() => {
    if (Platform.OS !== 'android' || !createSheetVisible) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setCreateSheetVisible(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [createSheetVisible]);

  const togglePlayer = (playerId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else if (canAddMore || next.has(playerId)) {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleAnonymousChange = (count: number) => {
    const maxAnonymous = hasMax
      ? Math.max(0, maxPlayers - selectedSavedCount)
      : count;
    setAnonymousCount(Math.min(count, maxAnonymous));
  };

  const sortedGroups = useMemo(
    () => sortGroupsByName(groups),
    [groups],
  );

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedGroups;
    return sortedGroups.filter((group) =>
      group.name.toLowerCase().includes(q),
    );
  }, [query, sortedGroups]);

  const handleAddGroup = (group: PlayerGroup) => {
    const memberIds = group.playerIds.filter((id) =>
      savedPlayers.some((player) => player.id === id),
    );
    if (memberIds.length === 0) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      let slotsLeftNow = hasMax
        ? maxPlayers - anonymousCount - next.size
        : Number.POSITIVE_INFINITY;

      for (const id of memberIds) {
        if (next.has(id)) continue;
        if (slotsLeftNow <= 0) break;
        next.add(id);
        slotsLeftNow -= 1;
      }
      return next;
    });
  };

  const handleCreatePlayer = (name: string) => {
    const player = onCreatePlayer(name);
    if (!player) return null;
    if (canAddMore || selectedIds.has(player.id)) {
      setSelectedIds((prev) => new Set(prev).add(player.id));
    }
    return player;
  };

  const handleConfirm = () => {
    const selectedSaved = sortedPlayers
      .filter((player) => selectedIds.has(player.id))
      .map((player) => ({
        id: player.id,
        name: player.name,
        color: player.color,
      }));
    onConfirm(buildRosterFromSelection(selectedSaved, anonymousCount));
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={styles.searchPanel}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar jugador..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {allowAnonymous ? (
        <View style={styles.anonymousPanel}>
          <View style={styles.anonymousText}>
            <Text style={styles.anonymousTitle}>Jugadores anónimos</Text>
            <Text style={styles.anonymousHint}>
              Invitados sin nombre. No se guardan en tu lista.
            </Text>
          </View>
          <CardCountStepper
            value={anonymousCount}
            onChange={handleAnonymousChange}
            max={
              hasMax
                ? Math.max(0, maxPlayers - selectedSavedCount)
                : 99
            }
          />
        </View>
      ) : null}

      <Pressable
        onPress={() => setCreateSheetVisible(true)}
        style={({ pressed }) => [
          styles.createRow,
          pressed && styles.rowPressed,
        ]}
      >
        <View style={styles.createIcon}>
          <Text style={styles.createIconText}>+</Text>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.createRowTitle}>Crear jugador</Text>
          <Text style={styles.createRowSubtitle}>
            Se guardará para futuras partidas
          </Text>
        </View>
      </Pressable>

      {filteredGroups.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Grupos</Text>
          <Text style={styles.sectionHint}>
            Toca un grupo para añadir sus jugadores. Luego puedes quitar
            individuales.
          </Text>
          {filteredGroups.map((group) => {
            const unselectedMemberCount = group.playerIds.filter(
              (id) =>
                savedPlayers.some((player) => player.id === id) &&
                !selectedIds.has(id),
            ).length;
            const disabled = unselectedMemberCount === 0 || !canAddMore;
            return (
              <Pressable
                key={group.id}
                onPress={() => handleAddGroup(group)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.groupRow,
                  disabled && styles.rowDisabled,
                  pressed && !disabled && styles.rowPressed,
                ]}
              >
                <View
                  style={[styles.groupIcon, { backgroundColor: GROUP_COLOR + '33' }]}
                >
                  <Text style={[styles.groupIconText, { color: GROUP_COLOR }]}>
                    G
                  </Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.createRowTitle}>{group.name}</Text>
                  <Text style={styles.createRowSubtitle}>
                    {unselectedMemberCount === 0 &&
                    group.playerIds.some((id) =>
                      savedPlayers.some((player) => player.id === id),
                    )
                      ? 'Todos añadidos'
                      : `${formatGroupSubtitle(group, savedPlayers)} · Añadir`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </>
      ) : null}

      <Text style={styles.sectionLabel}>Jugadores recientes</Text>
      {!query.trim() ? (
        <Text style={styles.sectionHint}>
          Los últimos con los que has jugado
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Elegir jugadores" onBack={onBack} />

      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query.trim()
              ? 'Ningún jugador coincide con la búsqueda'
              : 'Aún no tienes jugadores guardados'}
          </Text>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.has(item.id);
          const disabled = !selected && !canAddMore;
          return (
            <PlayerSelectRow
              player={item}
              selected={selected}
              disabled={disabled}
              onToggle={() => togglePlayer(item.id)}
              subtitle={formatPlayerLastUsed(item.lastUsedAt)}
            />
          );
        }}
      />

      <View style={styles.footer}>
        {hasMax ? (
          <Text style={styles.footerHint}>
            {totalSelected} de {maxPlayers} jugadores
          </Text>
        ) : (
          <Text style={styles.footerHint}>
            {totalSelected} seleccionado{totalSelected === 1 ? '' : 's'}
          </Text>
        )}
        <Button
          label={
            totalSelected > 0
              ? `Añadir jugadores (${totalSelected})`
              : 'Añadir jugadores'
          }
          onPress={handleConfirm}
        />
      </View>

      <CreatePlayerSheet
        visible={createSheetVisible}
        existingCount={savedPlayers.length}
        onClose={() => setCreateSheetVisible(false)}
        onCreate={handleCreatePlayer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  list: {
    paddingBottom: 16,
    gap: 8,
  },
  headerBlock: {
    gap: 12,
    marginBottom: 8,
  },
  searchPanel: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },
  anonymousPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  anonymousText: {
    flex: 1,
    gap: 4,
  },
  anonymousTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  anonymousHint: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 16,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.success + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIconText: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.success,
    lineHeight: 26,
  },
  createRowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  createRowSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  rowSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '14',
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
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
  checkboxMark: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F1419',
  },
  empty: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  footerHint: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: 'center',
  },
});

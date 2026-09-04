import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { MatchPlayerRoster } from '../components/MatchPlayerRoster';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { CreateWinnerMatchDraft } from '../types/playerSelection';
import { AppScreen, Player, SavedPlayer } from '../types';
import { ensureMatchPlayers } from '../utils/players';

type Props = {
  sessionName: string;
  sessionId: string;
  savedPlayers: SavedPlayer[];
  restoredDraft?: CreateWinnerMatchDraft | null;
  onBack: () => void;
  onSave: (
    players: Player[],
    winnerIds: string[],
    name?: string | null,
  ) => void;
  onOpenPlayerSelection: (config: {
    draftKey: 'createWinnerMatch';
    parentDraft: CreateWinnerMatchDraft;
    players: Player[];
    maxPlayers: number;
    allowAnonymous: boolean;
    returnScreen: AppScreen;
  }) => void;
  selfPlayer?: Player | null;
};

export function CreateWinnerMatchScreen({
  sessionName,
  sessionId,
  savedPlayers: _savedPlayers,
  restoredDraft,
  onBack,
  onSave,
  onOpenPlayerSelection,
  selfPlayer = null,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [matchName, setMatchName] = useState(restoredDraft?.matchName ?? '');
  const [players, setPlayers] = useState<Player[]>(restoredDraft?.players ?? []);
  const [winnerIds, setWinnerIds] = useState<Set<string>>(
    () => new Set(restoredDraft?.winnerIds ?? []),
  );

  const soloHint =
    'Elige quién participó y marca uno o más ganadores (empate si hay varios).';

  const handleChoosePlayers = () => {
    onOpenPlayerSelection({
      draftKey: 'createWinnerMatch',
      parentDraft: {
        matchName,
        players,
        winnerIds: [...winnerIds],
      },
      players,
      maxPlayers: Number.POSITIVE_INFINITY,
      allowAnonymous: true,
      returnScreen: { type: 'createWinnerMatch', sessionId },
    });
  };

  const handleRemove = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setWinnerIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleWinner = (playerId: string) => {
    setWinnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (winnerIds.size < 1) return;
    const roster = ensureMatchPlayers(players, selfPlayer);
    onSave(roster, [...winnerIds], matchName.trim() || null);
  };

  const validWinnerIds = useMemo(() => {
    const ids = new Set(players.map((player) => player.id));
    return [...winnerIds].filter((id) => ids.has(id));
  }, [players, winnerIds]);

  return (
    <View style={styles.container}>
      <AppHeader title="Partida con ganador" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sessionHint}>Sesión: {sessionName}</Text>

        <View style={styles.namePanel}>
          <Text style={styles.nameLabel}>Nombre (opcional)</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Ej. Partida rápida de dominó"
            placeholderTextColor={theme.textMuted}
            value={matchName}
            onChangeText={setMatchName}
            maxLength={40}
            returnKeyType="done"
          />
        </View>

        <Text style={styles.hint}>
          Sin puntuación: solo indicas quién ganó esta partida.
        </Text>

        <MatchPlayerRoster
          playerCount={players.length}
          onChoosePlayers={handleChoosePlayers}
          soloHint={soloHint}
        />

        {players.length === 0 ? (
          <Text style={styles.empty}>
            Pulsa «Elegir jugadores» y marca quién ganó.
          </Text>
        ) : (
          <View style={styles.playerList}>
            {players.map((player) => {
              const isWinner = winnerIds.has(player.id);
              return (
                <View key={player.id} style={styles.playerRow}>
                  <View style={styles.playerInfo}>
                    <PlayerAvatar
                      name={player.name}
                      color={player.color}
                      avatar={player.avatar}
                      size={36}
                      radius={10}
                    />
                    <Text style={styles.playerName} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Pressable
                      onPress={() => handleRemove(player.id)}
                      hitSlop={8}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => toggleWinner(player.id)}
                    style={[
                      styles.winnerBtn,
                      isWinner && styles.winnerBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.winnerBtnText,
                        isWinner && styles.winnerBtnTextActive,
                      ]}
                    >
                      {isWinner ? 'Ganador ✓' : 'Marcar ganador'}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Registrar victoria"
          onPress={handleSave}
          disabled={validWinnerIds.length < 1}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    gap: 16,
    paddingBottom: 16,
  },
  sessionHint: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.accent,
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
  hint: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
  },
  empty: {
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 8,
  },
  playerList: {
    gap: 10,
  },
  playerRow: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 10,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  removeText: {
    fontSize: 22,
    color: theme.textMuted,
    paddingHorizontal: 4,
  },
  winnerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
  },
  winnerBtnActive: {
    borderColor: theme.success,
    backgroundColor: theme.success + '22',
  },
  winnerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textMuted,
  },
  winnerBtnTextActive: {
    color: theme.success,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});

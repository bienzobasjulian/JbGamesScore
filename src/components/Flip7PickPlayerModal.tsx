import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Flip7RoundEntry, Player } from '../types';
import { emptyFlip7RoundEntry, getFlip7StatusLabel } from '../utils/flip7';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  players: Player[];
  roundByPlayer: Record<string, Flip7RoundEntry>;
  onSelect: (playerId: string) => void;
  onCancel: () => void;
};

export function Flip7PickPlayerModal({
  visible,
  title,
  message,
  players,
  roundByPlayer,
  onSelect,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={styles.panel}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {players.map((player) => {
              const entry = roundByPlayer[player.id] ?? emptyFlip7RoundEntry();
              return (
                <Pressable
                  key={player.id}
                  onPress={() => onSelect(player.id)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View
                    style={[styles.avatar, { backgroundColor: player.color }]}
                  >
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
                    <Text style={styles.name}>{player.name}</Text>
                    <Text style={styles.hint}>
                      {getFlip7StatusLabel(entry.status)}
                      {entry.hasSecondChance ? ' · Segunda oportunidad' : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.rowPressed]}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    gap: 12,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
  },
  rowPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  hint: {
    fontSize: 12,
    color: theme.textMuted,
  },
  cancelBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textMuted,
  },
});

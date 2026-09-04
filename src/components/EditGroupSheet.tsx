import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from './ConfirmModal';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { PlayerGroup, SavedPlayer } from '../types';
import { formatGroupMemberCount } from '../utils/groups';
import { PlayerAvatar } from './PlayerAvatar';

type Props = {
  visible: boolean;
  group: PlayerGroup | null;
  players: SavedPlayer[];
  onClose: () => void;
  onSave: (
    groupId: string,
    patch: { name: string; playerIds: string[] },
  ) => void;
  onDelete: (groupId: string) => void;
};

function MemberRow({
  player,
  selected,
  onToggle,
}: {
  player: SavedPlayer;
  selected: boolean;
  onToggle: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.memberRow,
        selected && styles.memberRowSelected,
        pressed && styles.memberRowPressed,
      ]}
    >
      <PlayerAvatar
        name={player.name}
        color={player.color}
        avatar={player.avatar}
        size={36}
        radius={10}
      />
      <Text style={styles.memberName} numberOfLines={1}>
        {player.name}
      </Text>
      <View
        style={[
          styles.checkbox,
          selected && styles.checkboxSelected,
        ]}
      >
        <Text style={styles.checkboxMark}>{selected ? '✓' : ''}</Text>
      </View>
    </Pressable>
  );
}

export function EditGroupSheet({
  visible,
  group,
  players,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    if (!visible || !group) return;
    setName(group.name);
    setMemberIds(new Set(group.playerIds));
    setDeleteVisible(false);
  }, [group, visible]);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [players],
  );

  const handleSave = () => {
    if (!group) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(group.id, {
      name: trimmed,
      playerIds: [...memberIds],
    });
    onClose();
  };

  const handleDelete = () => {
    if (!group) return;
    onDelete(group.id);
    setDeleteVisible(false);
    onClose();
  };

  const toggleMember = (playerId: string) => {
    setMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  if (!group) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.handle} />

            <Text style={styles.title}>Editar grupo</Text>
            <Text style={styles.subtitle}>
              {formatGroupMemberCount(memberIds.size)} en este grupo
            </Text>

            <View style={styles.nameField}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                maxLength={32}
              />
            </View>

            <Text style={styles.sectionLabel}>Jugadores del grupo</Text>
            <ScrollView
              style={styles.membersList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {sortedPlayers.length === 0 ? (
                <Text style={styles.emptyMembers}>
                  Crea jugadores antes de añadirlos al grupo.
                </Text>
              ) : (
                sortedPlayers.map((player) => (
                  <MemberRow
                    key={player.id}
                    player={player}
                    selected={memberIds.has(player.id)}
                    onToggle={() => toggleMember(player.id)}
                  />
                ))
              )}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                onPress={() => setDeleteVisible(true)}
                style={({ pressed }) => [
                  styles.textBtn,
                  pressed && styles.textBtnPressed,
                ]}
              >
                <Text style={styles.deleteText}>Eliminar grupo</Text>
              </Pressable>
              <View style={styles.actionsRight}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.textBtn,
                    pressed && styles.textBtnPressed,
                  ]}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={!name.trim()}
                  style={({ pressed }) => [
                    styles.textBtn,
                    pressed && styles.textBtnPressed,
                    !name.trim() && styles.textBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.confirmText,
                      !name.trim() && styles.confirmTextDisabled,
                    ]}
                  >
                    Guardar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal
        visible={deleteVisible}
        title="¿Eliminar grupo?"
        message={`Se borrará «${group.name}». Los jugadores no se eliminarán.`}
        confirmLabel="Eliminar grupo"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteVisible(false)}
      />
    </>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '88%',
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
  },
  nameField: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  input: {
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  membersList: {
    maxHeight: 280,
  },
  emptyMembers: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 8,
  },
  memberRowSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accent + '14',
  },
  memberRowPressed: {
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
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
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
  checkboxMark: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.onAccent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  actionsRight: {
    flexDirection: 'row',
    gap: 16,
  },
  textBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  textBtnPressed: {
    opacity: 0.7,
  },
  textBtnDisabled: {
    opacity: 0.45,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textMuted,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.accent,
  },
  confirmTextDisabled: {
    color: theme.textMuted,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.danger,
  },
});

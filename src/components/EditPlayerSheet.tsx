import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlayerColorPicker } from './PlayerColorPicker';
import { theme } from '../constants';
import { SavedPlayer } from '../types';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  visible: boolean;
  player: SavedPlayer | null;
  onClose: () => void;
  onSave: (
    playerId: string,
    patch: { name: string; color: string },
  ) => boolean;
};

export function EditPlayerSheet({
  visible,
  player,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && player) {
      setName(player.name);
      setColor(player.color);
      setError(null);
    }
  }, [player, visible]);

  if (!player) return null;

  const handleSave = () => {
    const saved = onSave(player.id, { name, color });
    if (saved) {
      onClose();
      return;
    }
    setError('Introduce un nombre válido y único');
  };

  const initial = (name.trim().charAt(0) || '?').toUpperCase();

  return (
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

          <Text style={styles.title}>Editar jugador</Text>

          <View style={styles.previewRow}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
              <Text
                style={[
                  styles.avatarText,
                  { color: getPlayerAvatarTextColor(color) },
                ]}
              >
                {initial}
              </Text>
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                onSubmitEditing={handleSave}
                returnKeyType="done"
                maxLength={24}
                autoFocus
              />
            </View>
          </View>

          <Text style={styles.labelCentered}>Color</Text>
          <PlayerColorPicker value={color} onChange={setColor} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    gap: 14,
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  nameField: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  labelCentered: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
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
  error: {
    fontSize: 13,
    color: theme.danger,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    paddingTop: 4,
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
});

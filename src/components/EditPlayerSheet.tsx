import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { PlayerColorPicker } from './PlayerColorPicker';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerAvatarPicker } from './PlayerAvatarPicker';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { SavedPlayer } from '../types';

type Props = {
  visible: boolean;
  player: SavedPlayer | null;
  onClose: () => void;
  onSave: (
    playerId: string,
    patch: { name: string; color: string; avatar?: string | null },
  ) => boolean;
  isSelf?: boolean;
  onSetSelf?: (isSelf: boolean) => void;
};

export function EditPlayerSheet({
  visible,
  player,
  onClose,
  onSave,
  isSelf: isSelfProp = false,
  onSetSelf,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const bottomInset = useSheetBottomInset();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSelf, setIsSelf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && player) {
      setName(player.name);
      setColor(player.color);
      setAvatar(player.avatar ?? null);
      setIsSelf(isSelfProp);
      setError(null);
    }
  }, [isSelfProp, player, visible]);

  if (!player) return null;

  const handleSave = () => {
    const saved = onSave(player.id, { name, color, avatar });
    if (saved) {
      onSetSelf?.(isSelf);
      onClose();
      return;
    }
    setError('Introduce un nombre válido y único');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
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
            { paddingBottom: 16 + bottomInset },
          ]}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>Editar jugador</Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetBody}
          >
            <View style={styles.previewRow}>
              <PlayerAvatar
                name={name}
                color={color}
                avatar={avatar}
                size={56}
                radius={16}
              />
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

            <Text style={styles.labelCentered}>Avatar</Text>
            <PlayerAvatarPicker
              value={avatar}
              onChange={setAvatar}
              previewName={name}
              previewColor={color}
            />

            <View style={[styles.selfRow, isSelf && styles.selfRowActive]}>
              <View style={styles.selfText}>
                <Text style={styles.selfTitle}>Este jugador soy yo</Text>
                <Text style={styles.selfHint}>
                  En partidas sin elegir jugadores se usará su nombre, color y
                  avatar.
                </Text>
              </View>
              <Switch
                value={isSelf}
                onValueChange={setIsSelf}
                trackColor={{ false: theme.border, true: theme.accentDark }}
                thumbColor={isSelf ? theme.accent : theme.textMuted}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

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
    gap: 14,
    maxHeight: '88%',
  },
  sheetBody: {
    gap: 14,
    paddingBottom: 8,
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
  selfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selfRowActive: {
    borderColor: theme.accent,
  },
  selfText: {
    flex: 1,
    gap: 4,
  },
  selfTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  selfHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
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

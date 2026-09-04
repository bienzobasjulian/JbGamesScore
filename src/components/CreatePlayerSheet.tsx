import { useEffect, useState } from 'react';
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
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Player } from '../types';
import { pickPlayerColor } from '../utils/match';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerAvatarPicker } from './PlayerAvatarPicker';

type Props = {
  visible: boolean;
  existingCount: number;
  onClose: () => void;
  onCreate: (name: string, avatar?: string | null) => Player | null;
};

export function CreatePlayerSheet({
  visible,
  existingCount,
  onClose,
  onCreate,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setName('');
      setAvatar(null);
      setError(null);
    }
  }, [visible]);

  const previewColor = pickPlayerColor(
    Array.from({ length: existingCount }, (_, index) => ({
      id: String(index),
      name: '',
      color: theme.accent,
    })),
  );

  const handleCreate = () => {
    const player = onCreate(name, avatar);
    if (player) {
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

          <Text style={styles.title}>Crear jugador</Text>
          <Text style={styles.subtitle}>
            Se guardará en tu lista para futuras partidas.
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetBody}
          >
            <View style={styles.previewRow}>
              <PlayerAvatar
                name={name}
                color={previewColor}
                avatar={avatar}
                size={56}
                radius={16}
              />
              <View style={styles.nameField}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Introduce el nombre del jugador..."
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setError(null);
                  }}
                  onSubmitEditing={handleCreate}
                  returnKeyType="done"
                  maxLength={24}
                  autoFocus
                />
              </View>
            </View>

            <Text style={styles.labelCentered}>Avatar</Text>
            <PlayerAvatarPicker
              value={avatar}
              onChange={setAvatar}
              previewName={name}
              previewColor={previewColor}
            />

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
              onPress={handleCreate}
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
                Añadir
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
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
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

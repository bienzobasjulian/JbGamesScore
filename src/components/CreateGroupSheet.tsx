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
import { theme } from '../constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => string | null;
};

export function CreateGroupSheet({ visible, onClose, onCreate }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setName('');
      setError(null);
    }
  }, [visible]);

  const handleCreate = () => {
    const groupId = onCreate(name);
    if (groupId) {
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

          <Text style={styles.title}>Crear grupo</Text>
          <Text style={styles.subtitle}>
            Agrupa jugadores para añadirlos rápido a una partida.
          </Text>

          <View style={styles.nameField}>
            <Text style={styles.label}>Nombre del grupo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Familia, Amigos del trabajo..."
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              maxLength={32}
              autoFocus
            />
          </View>

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
                Crear
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
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
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

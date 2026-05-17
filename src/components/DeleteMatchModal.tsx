import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Button } from './Button';

type Props = {
  visible: boolean;
  matchTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteMatchModal({
  visible,
  matchTitle,
  onConfirm,
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
          <Text style={styles.title}>¿Eliminar partida?</Text>
          <Text style={styles.message}>
            Se borrará «{matchTitle}» y no podrás recuperarla.
          </Text>
          <View style={styles.actions}>
            <Button
              label="Eliminar"
              onPress={onConfirm}
              variant="danger"
              style={styles.btn}
            />
            <Button
              label="Cancelar"
              onPress={onCancel}
              variant="secondary"
              style={styles.btn}
            />
          </View>
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
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  btn: {
    width: '100%',
  },
});

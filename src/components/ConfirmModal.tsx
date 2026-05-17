import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Button } from './Button';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  danger,
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
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={danger ? 'danger' : 'primary'}
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

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Button } from './Button';

type Props = {
  visible: boolean;
  errors: string[];
  onClose: () => void;
};

export function RoundErrorsModal({ visible, errors, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>
          <Text style={styles.title}>Corrige la ronda</Text>
          <Text style={styles.subtitle}>
            Hay datos que no cuadran antes de continuar:
          </Text>
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {errors.map((error, index) => (
              <Text key={`${index}-${error}`} style={styles.errorItem}>
                · {error}
              </Text>
            ))}
          </ScrollView>
          <Button label="Entendido" onPress={onClose} style={styles.btn} />
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
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  listScroll: {
    flexGrow: 0,
  },
  listContent: {
    gap: 8,
  },
  errorItem: {
    fontSize: 14,
    color: theme.warning,
    lineHeight: 20,
  },
  btn: {
    width: '100%',
    marginTop: 4,
  },
});

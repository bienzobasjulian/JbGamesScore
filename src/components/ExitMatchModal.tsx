import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  visible: boolean;
  matchTitle?: string;
  onClose: () => void;
  onSaveAndExit: () => void;
  onDeleteAndExit: () => void;
};

export function ExitMatchModal({
  visible,
  matchTitle,
  onClose,
  onSaveAndExit,
  onDeleteAndExit,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.emoji}>🚪</Text>
          <Text style={styles.title}>Salir de la partida</Text>
          {matchTitle ? (
            <Text style={styles.matchName} numberOfLines={2}>
              {matchTitle}
            </Text>
          ) : null}
          <Text style={styles.subtitle}>
            ¿Qué quieres hacer con esta partida antes de salir?
          </Text>

          <Pressable
            onPress={onSaveAndExit}
            style={({ pressed }) => [
              styles.option,
              styles.optionSave,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={[styles.optionIcon, styles.optionIconSave]}>
              <Text style={styles.optionIconText}>💾</Text>
            </View>
            <View style={styles.optionTexts}>
              <Text style={styles.optionTitle}>Guardar partida y salir</Text>
              <Text style={styles.optionHint}>
                La partida quedará guardada para retomarla después
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onDeleteAndExit}
            style={({ pressed }) => [
              styles.option,
              styles.optionDelete,
              pressed && styles.optionPressed,
            ]}
          >
            <View style={[styles.optionIcon, styles.optionIconDelete]}>
              <Text style={styles.optionIconText}>✕</Text>
            </View>
            <View style={styles.optionTexts}>
              <Text style={[styles.optionTitle, styles.optionTitleDanger]}>
                Salir sin guardar
              </Text>
              <Text style={styles.optionHint}>
                Se eliminará esta partida y perderás su progreso
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={styles.cancelLabel}>Seguir jugando</Text>
          </Pressable>
        </View>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.border,
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
  emoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  matchName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.accent,
    textAlign: 'center',
    marginTop: -4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionSave: {
    backgroundColor: theme.accent + '14',
    borderColor: theme.accent + '50',
  },
  optionDelete: {
    backgroundColor: theme.danger + '10',
    borderColor: theme.danger + '40',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSave: {
    backgroundColor: theme.accent,
  },
  optionIconDelete: {
    backgroundColor: theme.danger,
  },
  optionIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  optionTexts: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  optionTitleDanger: {
    color: theme.danger,
  },
  optionHint: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
  },
});

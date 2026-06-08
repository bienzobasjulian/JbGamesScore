import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  onViewRanking: () => void;
  onEditMatch: () => void;
  onFinishMatch: () => void;
  canEditMatch?: boolean;
};

export function MatchActionsMenu({
  visible,
  onClose,
  onViewRanking,
  onEditMatch,
  onFinishMatch,
  canEditMatch = true,
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

          <Pressable
            onPress={() => {
              onClose();
              onViewRanking();
            }}
            style={({ pressed }) => [
              styles.option,
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={styles.optionTitle}>Ver clasificación actual</Text>
            <Text style={styles.optionHint}>
              Ranking y puntos acumulados hasta ahora
            </Text>
          </Pressable>

          {canEditMatch ? (
            <Pressable
              onPress={() => {
                onClose();
                onEditMatch();
              }}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionTitle}>Editar partida</Text>
              <Text style={styles.optionHint}>
                Cambia nombre, reglas o jugadores sin perder los puntos
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => {
              onClose();
              onFinishMatch();
            }}
            style={({ pressed }) => [
              styles.option,
              styles.optionFinish,
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={[styles.optionTitle, styles.optionTitleFinish]}>
              Finalizar partida
            </Text>
            <Text style={styles.optionHint}>
              Ver podio y decidir si guardar la partida
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={styles.cancelLabel}>Cancelar</Text>
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
    gap: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    marginBottom: 4,
  },
  option: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
    gap: 4,
  },
  optionFinish: {
    borderColor: theme.warning + '55',
    backgroundColor: theme.warning + '12',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  optionTitleFinish: {
    color: theme.warning,
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

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

export type GameOverflowMenuItem = {
  title: string;
  hint?: string;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: GameOverflowMenuItem[];
};

export function GameOverflowMenu({ visible, onClose, items }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

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
          {items.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionTitle}>{item.title}</Text>
              {item.hint ? (
                <Text style={styles.optionHint}>{item.hint}</Text>
              ) : null}
            </Pressable>
          ))}
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    optionPressed: {
      opacity: 0.85,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
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

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { RankedPlayer } from '../utils/match';
import { MatchRanking } from './MatchRanking';

type Props = {
  visible: boolean;
  onClose: () => void;
  ranking: RankedPlayer[];
};

export function CurrentRankingModal({ visible, onClose, ranking }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const bottomInset = useSheetBottomInset();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 16 + bottomInset }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Clasificación actual</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <MatchRanking ranking={ranking} showPodium={false} />
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
          >
            <Text style={styles.closeLabel}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.border,
    maxHeight: '85%',
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    textAlign: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  closeBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
  },
  closeBtnPressed: {
    opacity: 0.85,
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
  },
});

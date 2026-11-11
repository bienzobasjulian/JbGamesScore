import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSheetBottomInset } from '../hooks/useSheetBottomInset';
import { useThemedStyles, type AppTheme } from '../theme';
import type { CreateMatchHowTo } from '../utils/createMatchHowTo';
import { HowToPlayScreen } from './HowToPlayScreen';

type Props = {
  rules: CreateMatchHowTo | null;
  onClose: () => void;
};

export function GameRulesSheet({ rules, onClose }: Props) {
  const styles = useThemedStyles(createStyles);
  const bottomInset = useSheetBottomInset();

  return (
    <Modal
      visible={rules != null}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 12 + bottomInset }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{rules?.title ?? 'Cómo jugar'}</Text>
          {rules ? (
            <HowToPlayScreen
              embedded
              title={rules.title}
              body={rules.body}
              items={rules.items}
              sections={rules.sections}
              onBack={onClose}
            />
          ) : null}
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
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      height: '78%',
      backgroundColor: theme.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 10,
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
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
  });

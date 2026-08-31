import { Modal, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants';
import { Player } from '../types';
import { Button } from './Button';

type Props = {
  visible: boolean;
  player: Player | null;
  onNextRound: () => void;
};

export function Flip7CelebrationModal({ visible, player, onNextRound }: Props) {
  if (!player) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onNextRound}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.emoji}>🎴</Text>
          <Text style={styles.title}>Flip 7</Text>
          <Text style={styles.message}>
            <Text style={styles.playerName}>{player.name}</Text> consiguió 7 números
            diferentes y se lleva +15 pts de bonificación.
          </Text>
          <Button
            label="Siguiente ronda"
            onPress={onNextRound}
            style={styles.btn}
          />
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.accent,
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.accent,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  playerName: {
    fontWeight: '800',
    color: theme.text,
  },
  btn: {
    alignSelf: 'stretch',
  },
});

import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { theme } from './src/constants';
import { useGame } from './src/hooks/useGame';
import { GameScreen } from './src/screens/GameScreen';
import { SetupScreen } from './src/screens/SetupScreen';

export default function App() {
  const game = useGame();

  if (!game.loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        {game.state.isPlaying ? (
          <GameScreen
            state={game.state}
            onAdjust={game.adjustRoundScore}
            onSetScore={game.setRoundScore}
            onFinishRound={game.finishRound}
            onUndoRound={game.undoLastRound}
            onBack={game.backToSetup}
            onReset={game.resetGame}
          />
        ) : (
          <SetupScreen
            state={game.state}
            onAddPlayer={game.addPlayer}
            onRemovePlayer={game.removePlayer}
            onUpdateSettings={game.updateSettings}
            onStart={game.startGame}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HamburgerMenu } from './src/components/HamburgerMenu';
import { theme } from './src/constants';
import { useApp } from './src/hooks/useApp';
import { CreateMatchScreen } from './src/screens/CreateMatchScreen';
import { CreatePlayerScreen } from './src/screens/CreatePlayerScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MatchesListScreen } from './src/screens/MatchesListScreen';
import { PlayersListScreen } from './src/screens/PlayersListScreen';
import { checkGameOver } from './src/utils/game';
import {
  formatMatchTitle,
  getAllMatchesSorted,
  matchToGameState,
} from './src/utils/match';

export default function App() {
  const app = useApp();
  const isHome = app.screen.type === 'home';

  const activeMatch =
    app.screen.type === 'game'
      ? app.getMatch(app.screen.matchId)
      : undefined;

  useEffect(() => {
    if (!app.loaded || app.screen.type !== 'game') return;
    if (!activeMatch) {
      app.goHome();
      return;
    }
    const state = matchToGameState(activeMatch);
    if (checkGameOver(state).isOver && activeMatch.status === 'in_progress') {
      app.markMatchFinished(activeMatch.id);
    }
  }, [
    app.loaded,
    app.screen.type,
    app.screen.type === 'game' ? app.screen.matchId : null,
    activeMatch?.status,
    activeMatch?.rounds,
    activeMatch?.activeRoundIndex,
  ]);

  useEffect(() => {
    if (!isHome) {
      app.closeMenu();
    }
  }, [isHome]);

  if (!app.loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (app.screen.type) {
      case 'home':
        return (
          <HomeScreen
            inProgressMatches={app.inProgressMatches}
            recentFinishedMatches={app.recentFinishedMatches}
            recentPlayers={app.recentPlayers}
            onMenuPress={app.openMenu}
            onCreateMatch={app.goCreateMatch}
            onOpenMatch={app.openMatch}
            onCreatePlayer={app.goCreatePlayer}
          />
        );

      case 'createMatch':
        return (
          <CreateMatchScreen
            savedPlayers={app.data.players}
            onBack={app.goHome}
            onStart={(players, settings, name) => {
              app.createAndStartMatch(players, settings, name);
            }}
            onAddFromSaved={app.addPlayerFromSaved}
            onCreateNewPlayer={app.createPlayerForMatch}
          />
        );

      case 'matchesList':
        return (
          <MatchesListScreen
            matches={getAllMatchesSorted(app.data.matches)}
            onBack={app.goHome}
            onCreateMatch={app.goCreateMatch}
            onOpenMatch={app.openMatch}
            onDeleteMatch={app.deleteMatch}
          />
        );

      case 'playersList':
        return (
          <PlayersListScreen
            players={app.data.players}
            onBack={app.goHome}
            onCreatePlayer={app.goCreatePlayer}
            onRemovePlayer={app.removeSavedPlayer}
          />
        );

      case 'createPlayer':
        return (
          <CreatePlayerScreen
            onBack={app.backFromCreatePlayer}
            onSave={app.addSavedPlayer}
          />
        );

      case 'game': {
        const match = app.getMatch(app.screen.matchId);
        if (!match) return null;
        const state = matchToGameState(match);
        return (
          <GameScreen
            state={state}
            matchTitle={formatMatchTitle(match)}
            isMatchFinished={match.status === 'finished'}
            onAddBreakdownItem={(playerId, value, truncateLater) =>
              app.addBreakdownItem(match.id, playerId, value, truncateLater)
            }
            onRemoveBreakdownItem={(playerId, index, truncateLater) =>
              app.removeBreakdownItem(match.id, playerId, index, truncateLater)
            }
            onGoToRound={(roundIndex) =>
              app.goToRound(match.id, roundIndex)
            }
            onAddRound={() => app.addNextRound(match.id)}
            onAdjust={(playerId, delta, truncateLater) =>
              app.adjustRoundScore(match.id, playerId, delta, truncateLater)
            }
            onSetScore={(playerId, value, truncateLater) =>
              app.setRoundScore(match.id, playerId, value, truncateLater)
            }
            onScoringModeChange={(playerId, mode, truncateLater) =>
              app.setRoundScoringMode(match.id, playerId, mode, truncateLater)
            }
            onBack={app.goHome}
            onFinishMatch={() => app.finishMatch(match.id)}
            onResumeMatch={() => app.resumeMatch(match.id)}
            onRepeatMatch={() => app.repeatMatch(match.id)}
            onDeleteMatch={() => app.deleteMatch(match.id)}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        {renderScreen()}
        {isHome && (
          <HamburgerMenu
            visible={app.menuOpen}
            onClose={app.closeMenu}
            items={[
              { label: 'Nueva partida', onPress: app.goCreateMatch },
              { label: 'Lista de partidas', onPress: app.goMatchesList },
              { label: 'Lista de jugadores', onPress: app.goPlayersList },
            ]}
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

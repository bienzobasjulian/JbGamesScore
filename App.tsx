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
import { EditTemplateScreen } from './src/screens/EditTemplateScreen';
import { MatchesListScreen } from './src/screens/MatchesListScreen';
import { PlayersListScreen } from './src/screens/PlayersListScreen';
import { PelusasCounterScreen } from './src/screens/PelusasCounterScreen';
import { PelusasSetupScreen } from './src/screens/PelusasSetupScreen';
import { TemplatesListScreen } from './src/screens/TemplatesListScreen';
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

      case 'createMatch': {
        const initialTemplateId = app.screen.templateId;
        return (
          <CreateMatchScreen
            key={initialTemplateId ?? 'new'}
            templates={app.data.templates}
            savedPlayers={app.data.players}
            initialTemplateId={initialTemplateId}
            onBack={app.goHome}
            onStartStandard={(players, settings, name) => {
              app.createAndStartMatch(players, settings, name);
            }}
            onStartPelusas={(players) => {
              app.startPelusasSession(players);
            }}
            onAddFromSaved={app.addPlayerFromSaved}
            onCreateNewPlayer={app.createPlayerForMatch}
          />
        );
      }

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

      case 'templatesList':
        return (
          <TemplatesListScreen
            templates={app.data.templates}
            savedPlayers={app.data.players}
            onBack={app.goHome}
            onCreateTemplate={() => app.goEditTemplate()}
            onPlayTemplate={app.playTemplate}
            onEditTemplate={app.goEditTemplate}
            onDeleteTemplate={app.deleteTemplate}
          />
        );

      case 'editTemplate': {
        const template = app.screen.templateId
          ? app.getTemplate(app.screen.templateId)
          : undefined;
        if (app.screen.templateId && !template) {
          return null;
        }
        return (
          <EditTemplateScreen
            template={template}
            savedPlayers={app.data.players}
            onBack={app.goTemplatesList}
            onSave={app.saveTemplate}
            onDelete={
              template
                ? () => app.deleteTemplate(template.id)
                : undefined
            }
            onAddFromSaved={app.addPlayerFromSaved}
            onCreateNewPlayer={app.createPlayerForMatch}
          />
        );
      }

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
            isPelusasMatch={match.gameMode === 'pelusas'}
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

      case 'pelusasSetup':
        return (
          <PelusasSetupScreen
            key={
              app.pelusasSession?.players.map((p) => p.id).join('-') ?? 'new'
            }
            savedPlayers={app.data.players}
            initialPlayers={app.pelusasSession?.players}
            onBack={app.exitPelusas}
            onStart={(players) =>
              app.pelusasSession
                ? app.updatePelusasPlayers(players)
                : app.startPelusasSession(players)
            }
            onAddFromSaved={app.addPlayerFromSaved}
            onCreateNewPlayer={app.createPlayerForMatch}
          />
        );

      case 'pelusasCount': {
        if (!app.pelusasSession) return null;
        return (
          <PelusasCounterScreen
            session={app.pelusasSession}
            onBack={() => app.goPelusasSetup(true)}
            onFinishMatch={app.finishPelusasSession}
            onSetRevolutionMode={app.setPelusasRevolutionMode}
            onSetCardCount={app.setPelusasCardCount}
            onResetCounts={app.resetPelusasCounts}
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
              {
                label: 'Plantillas de partida',
                onPress: app.goTemplatesList,
              },
              {
                label: 'Contador de pelusas',
                onPress: () => app.goPelusasSetup(false),
              },
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

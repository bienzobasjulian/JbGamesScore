import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { HamburgerMenu } from './src/components/HamburgerMenu';
import { useApp } from './src/hooks/useApp';
import {
  OnboardingProvider,
  SpotlightTour,
  WelcomeCarousel,
  useOnboarding,
} from './src/onboarding';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme, useThemeContext, useThemedStyles, type AppTheme } from './src/theme';
import { CreateMatchScreen } from './src/screens/CreateMatchScreen';
import { CreateSessionScreen } from './src/screens/CreateSessionScreen';
import { CreateWinnerMatchScreen } from './src/screens/CreateWinnerMatchScreen';
import { RegicideCounterScreen } from './src/screens/RegicideCounterScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EditMatchScreen } from './src/screens/EditMatchScreen';
import { EditTemplateScreen } from './src/screens/EditTemplateScreen';
import { MatchesListScreen } from './src/screens/MatchesListScreen';
import { PlayersListScreen } from './src/screens/PlayersListScreen';
import { PelusasCounterScreen } from './src/screens/PelusasCounterScreen';
import { PelusasSetupScreen } from './src/screens/PelusasSetupScreen';
import { AventurerosTrenCounterScreen } from './src/screens/AventurerosTrenCounterScreen';
import { SessionDetailScreen } from './src/screens/SessionDetailScreen';
import { SessionsListScreen } from './src/screens/SessionsListScreen';
import { SelectPlayersScreen } from './src/screens/SelectPlayersScreen';
import { SkullKingCounterScreen } from './src/screens/SkullKingCounterScreen';
import { PiliPiliCounterScreen } from './src/screens/PiliPiliCounterScreen';
import { Flip7CounterScreen } from './src/screens/Flip7CounterScreen';
import { TemplatesListScreen } from './src/screens/TemplatesListScreen';
import {
  CreateMatchDraft,
  CreateWinnerMatchDraft,
  EditMatchDraft,
  EditTemplateDraft,
  PelusasSetupDraft,
} from './src/types/playerSelection';
import { checkGameOver } from './src/utils/game';
import {
  formatMatchTitle,
  getAllMatchesSorted,
  getMatchRankingFromMatch,
  getWinnerOnlyRanking,
  matchToGameState,
} from './src/utils/match';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <OnboardingProvider>
            <AppShell />
          </OnboardingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const app = useApp();
  const onboarding = useOnboarding();
  const { colorScheme } = useThemeContext();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const isHome = app.screen.type === 'home';
  const insets = useSafeAreaInsets();

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
    if (
      checkGameOver(state).isOver &&
      activeMatch.status === 'in_progress' &&
      !activeMatch.editingAfterFinish
    ) {
      app.markMatchFinished(activeMatch.id);
    }
  }, [
    app.loaded,
    app.screen.type,
    app.screen.type === 'game' ? app.screen.matchId : null,
    activeMatch?.status,
    activeMatch?.editingAfterFinish,
    activeMatch?.rounds,
    activeMatch?.activeRoundIndex,
  ]);

  useEffect(() => {
    if (!isHome) {
      app.closeMenu();
    }
  }, [isHome]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !app.loaded) return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isHome && app.menuOpen) {
          app.closeMenu();
          return true;
        }

        switch (app.screen.type) {
          case 'home':
            return false;

          case 'createMatch':
          case 'matchesList':
          case 'playersList':
          case 'sessionsList':
          case 'game':
            app.goHome();
            return true;

          case 'createSession':
            if (
              app.screen.type === 'createSession' &&
              app.screen.returnTo === 'sessionsList'
            ) {
              app.goSessionsList();
            } else {
              app.goHome();
            }
            return true;

          case 'sessionDetail':
            app.goSessionsList();
            return true;

          case 'createSessionMatch':
          case 'createWinnerMatch':
            app.goSessionDetail(app.screen.sessionId);
            return true;

          case 'selectPlayers':
            app.cancelSelectPlayers();
            return true;

          case 'templatesList':
            app.goHome();
            return true;

          case 'settings':
            app.goHome();
            return true;

          case 'editTemplate':
            app.goTemplatesList();
            return true;

          case 'editMatch':
            app.openMatch(app.screen.matchId);
            return true;

          case 'pelusasSetup':
            if (app.pelusasSession) {
              app.goPelusasCount();
            } else {
              app.exitPelusas();
            }
            return true;

          case 'pelusasCount':
          case 'skullKingCount':
          case 'piliPiliCount':
          case 'flip7Count':
          case 'aventurerosTrenCount':
            return false;

          case 'regicideCount':
            return false;

          default:
            return false;
        }
      },
    );

    return () => subscription.remove();
  }, [
    app,
    app.loaded,
    app.menuOpen,
    app.screen.type,
    isHome,
  ]);

  if (!app.loaded || !onboarding.isReady) {
    return (
      <View
        style={[
          styles.loading,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
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
            recentSessions={app.recentSessions}
            allMatches={app.data.matches}
            recentPlayers={app.recentPlayers}
            selfPlayerId={app.selfPlayerId}
            onMenuPress={app.openMenu}
            onCreateMatch={app.goCreateMatch}
            onCreateSession={app.goCreateSession}
            onOpenMatch={app.openMatch}
            onOpenSession={app.goSessionDetail}
            onViewAllSessions={app.goSessionsList}
            onViewAllMatches={app.goMatchesList}
            onViewAllPlayers={app.goPlayersList}
          />
        );

      case 'createMatch': {
        const initialTemplateId = app.screen.templateId;
        const restoredDraft =
          app.consumeReturningDraft<CreateMatchDraft>('createMatch');
        return (
          <CreateMatchScreen
            key={
              restoredDraft
                ? `restored-${restoredDraft.players.map((p) => p.id).join('-')}`
                : (initialTemplateId ?? 'new')
            }
            templates={app.data.templates}
            savedPlayers={app.data.players}
            initialTemplateId={initialTemplateId}
            restoredDraft={restoredDraft}
            onBack={app.goHome}
            onOpenPlayerSelection={app.openSelectPlayers}
            onStartStandard={(players, settings, name, sessionId) => {
              app.createAndStartMatch(players, settings, name, sessionId);
            }}
            onStartPelusas={(players, sessionId) => {
              app.startPelusasSession(players, sessionId);
            }}
            onStartSkullKing={(players, sessionId) => {
              app.startSkullKingSession(players, sessionId);
            }}
            onStartPiliPili={(players, sessionId) => {
              app.startPiliPiliSession(players, sessionId);
            }}
            onStartFlip7={(players, sessionId) => {
              app.startFlip7Session(players, sessionId);
            }}
            onStartAventurerosTren={(players, submode, sessionId) => {
              app.startAventurerosTrenSession(players, submode, sessionId);
            }}
            onStartRegicide={(sessionId) => {
              app.startRegicideSession(sessionId);
            }}
            selfPlayer={app.selfPlayer}
          />
        );
      }

      case 'createSessionMatch': {
        const session = app.getSession(app.screen.sessionId);
        if (!session) return null;
        const restoredDraft =
          app.consumeReturningDraft<CreateMatchDraft>('createMatch');
        return (
          <CreateMatchScreen
            key={
              restoredDraft
                ? `session-restored-${restoredDraft.players.map((p) => p.id).join('-')}`
                : `session-${session.id}`
            }
            templates={app.data.templates}
            savedPlayers={app.data.players}
            sessionId={session.id}
            sessionName={session.name}
            restoredDraft={restoredDraft}
            onBack={() => app.goSessionDetail(session.id)}
            onOpenPlayerSelection={app.openSelectPlayers}
            onStartStandard={(players, settings, name, sessionId) => {
              app.createAndStartMatch(players, settings, name, sessionId);
            }}
            onStartPelusas={(players, sessionId) => {
              app.startPelusasSession(players, sessionId);
            }}
            onStartSkullKing={(players, sessionId) => {
              app.startSkullKingSession(players, sessionId);
            }}
            onStartPiliPili={(players, sessionId) => {
              app.startPiliPiliSession(players, sessionId);
            }}
            onStartFlip7={(players, sessionId) => {
              app.startFlip7Session(players, sessionId);
            }}
            onStartAventurerosTren={(players, submode, sessionId) => {
              app.startAventurerosTrenSession(players, submode, sessionId);
            }}
            onStartRegicide={(sessionId) => {
              app.startRegicideSession(sessionId);
            }}
            selfPlayer={app.selfPlayer}
          />
        );
      }

      case 'createWinnerMatch': {
        const session = app.getSession(app.screen.sessionId);
        if (!session) return null;
        const restoredDraft =
          app.consumeReturningDraft<CreateWinnerMatchDraft>(
            'createWinnerMatch',
          );
        return (
          <CreateWinnerMatchScreen
            key={
              restoredDraft
                ? `winner-restored-${restoredDraft.players.map((p) => p.id).join('-')}`
                : `winner-${session.id}`
            }
            sessionId={session.id}
            sessionName={session.name}
            savedPlayers={app.data.players}
            restoredDraft={restoredDraft}
            onBack={() => app.goSessionDetail(session.id)}
            onOpenPlayerSelection={app.openSelectPlayers}
            onSave={(players, winnerIds, name) => {
              app.createAndSaveWinnerMatch(
                players,
                winnerIds,
                name,
                session.id,
              );
              app.goSessionDetail(session.id);
            }}
            selfPlayer={app.selfPlayer}
          />
        );
      }

      case 'selectPlayers': {
        const config = app.getPlayerSelectionConfig();
        if (!config) return null;
        return (
          <SelectPlayersScreen
            savedPlayers={app.data.players}
            groups={app.data.groups}
            initialPlayers={config.players}
            maxPlayers={config.maxPlayers}
            allowAnonymous={config.allowAnonymous}
            onBack={app.cancelSelectPlayers}
            onConfirm={app.confirmSelectPlayers}
            onCreatePlayer={app.createSavedPlayerForSelection}
          />
        );
      }

      case 'sessionsList':
        return (
          <SessionsListScreen
            sessions={app.data.sessions}
            matches={app.data.matches}
            onBack={app.goHome}
            onCreateSession={() => app.goCreateSession('sessionsList')}
            onOpenSession={app.goSessionDetail}
            onDeleteSession={app.deleteSession}
            onDeleteSessions={app.deleteSessions}
          />
        );

      case 'createSession':
        return (
          <CreateSessionScreen
            onBack={() =>
              app.screen.type === 'createSession' &&
              app.screen.returnTo === 'sessionsList'
                ? app.goSessionsList()
                : app.goHome()
            }
            onSave={app.createSession}
            onCreated={app.goSessionDetail}
          />
        );

      case 'sessionDetail': {
        const session = app.getSession(app.screen.sessionId);
        if (!session) return null;
        return (
          <SessionDetailScreen
            session={session}
            matches={app.data.matches}
            onBack={app.goSessionsList}
            onCreateScoredMatch={() =>
              app.goCreateSessionMatch(session.id)
            }
            onCreateWinnerMatch={() =>
              app.goCreateWinnerMatch(session.id)
            }
            onOpenMatch={(matchId) => {
              app.openMatch(matchId);
            }}
            onCloseSession={() => app.closeSession(session.id)}
            onReopenSession={() => app.reopenSession(session.id)}
            onDeleteSession={() => app.deleteSession(session.id)}
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
            onDeleteMatches={app.deleteMatches}
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
        const restoredDraft =
          app.consumeReturningDraft<EditTemplateDraft>('editTemplate');
        return (
          <EditTemplateScreen
            key={
              restoredDraft
                ? `template-restored-${restoredDraft.playerIds.join('-')}`
                : template?.id ?? 'new'
            }
            template={template}
            savedPlayers={app.data.players}
            restoredDraft={restoredDraft}
            onBack={app.goTemplatesList}
            onSave={app.saveTemplate}
            onDelete={
              template
                ? () => app.deleteTemplate(template.id)
                : undefined
            }
            onOpenPlayerSelection={app.openSelectPlayers}
          />
        );
      }

      case 'playersList':
        return (
          <PlayersListScreen
            players={app.data.players}
            groups={app.data.groups}
            onBack={app.goHome}
            onCreatePlayer={app.createSavedPlayerForSelection}
            onCreateGroup={app.createPlayerGroupByName}
            onUpdateGroup={(groupId, patch) =>
              app.updatePlayerGroup(groupId, patch)
            }
            onDeleteGroup={app.deletePlayerGroup}
            onRemoveGroups={app.deletePlayerGroups}
            onUpdatePlayer={(playerId, patch) =>
              app.updateSavedPlayer(playerId, patch)
            }
            onRemovePlayer={app.removeSavedPlayer}
            onRemovePlayers={app.removeSavedPlayers}
            selfPlayerId={app.selfPlayerId}
            onSetSelfPlayerId={app.setSelfPlayerId}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onBack={app.goHome}
            onReplayHomeTour={() => {
              app.goHome();
              setTimeout(() => onboarding.startTour('home', { force: true }), 350);
            }}
            onReplayCreateMatchTour={() => {
              app.goCreateMatch();
              setTimeout(
                () => onboarding.startTour('createMatch', { force: true }),
                350,
              );
            }}
          />
        );

      case 'game': {
        const match = app.getMatch(app.screen.matchId);
        if (!match) return null;
        const state = matchToGameState(match);
        const resultsRanking =
          match.status === 'finished'
            ? match.winnerOnly
              ? getWinnerOnlyRanking(match)
              : getMatchRankingFromMatch(match)
            : undefined;
        return (
          <GameScreen
            state={state}
            matchTitle={formatMatchTitle(match)}
            resultsRanking={resultsRanking}
            isMatchFinished={match.status === 'finished'}
            editingAfterFinish={Boolean(match.editingAfterFinish)}
            isWinnerOnlyMatch={Boolean(match.winnerOnly)}
            isDedicatedGameMatch={
              match.winnerOnly ||
              match.gameMode === 'pelusas' ||
              match.gameMode === 'skull_king' ||
              match.gameMode === 'pili_pili' ||
              match.gameMode === 'flip7' ||
              match.gameMode === 'aventureros_tren'
            }
            floorRoundTotalsAtZero={match.gameMode === 'pili_pili'}
            onAddBreakdownItem={(playerId, value) =>
              app.addBreakdownItem(match.id, playerId, value)
            }
            onRemoveBreakdownItem={(playerId, index) =>
              app.removeBreakdownItem(match.id, playerId, index)
            }
            onGoToRound={(roundIndex) =>
              app.goToRound(match.id, roundIndex)
            }
            onAddRound={() => app.addNextRound(match.id)}
            onAdjust={(playerId, delta) =>
              app.adjustRoundScore(match.id, playerId, delta)
            }
            onSetScore={(playerId, value) =>
              app.setRoundScore(match.id, playerId, value)
            }
            onScoringModeChange={(playerId, mode) =>
              app.setRoundScoringMode(match.id, playerId, mode)
            }
            onBack={() => {
              if (match.sessionId) {
                app.goSessionDetail(match.sessionId);
              } else {
                app.goHome();
              }
            }}
            onEditMatch={() => app.goEditMatch(match.id)}
            onFinishMatch={() => app.finishMatch(match.id)}
            onResumeMatch={() => app.resumeMatch(match.id)}
            onRepeatMatch={() => app.repeatMatch(match.id)}
            onDeleteMatch={() => app.deleteMatch(match.id)}
          />
        );
      }

      case 'editMatch': {
        const match = app.getMatch(app.screen.matchId);
        if (!match || match.status === 'finished') return null;
        if (match.gameMode && match.gameMode !== 'standard') return null;
        const restoredDraft =
          app.consumeReturningDraft<EditMatchDraft>('editMatch');
        return (
          <EditMatchScreen
            key={
              restoredDraft
                ? `edit-restored-${restoredDraft.players.map((p) => p.id).join('-')}`
                : match.id
            }
            match={match}
            savedPlayers={app.data.players}
            restoredDraft={restoredDraft}
            onBack={() => app.openMatch(match.id)}
            onSave={(players, settings, name) =>
              app.updateMatchConfiguration(match.id, players, settings, name)
            }
            onOpenPlayerSelection={app.openSelectPlayers}
            selfPlayer={app.selfPlayer}
          />
        );
      }

      case 'pelusasSetup': {
        const restoredDraft =
          app.consumeReturningDraft<PelusasSetupDraft>('pelusasSetup');
        return (
          <PelusasSetupScreen
            key={
              restoredDraft
                ? `pelusas-restored-${restoredDraft.players.map((p) => p.id).join('-')}`
                : (app.pelusasSession?.players.map((p) => p.id).join('-') ??
                  'new')
            }
            savedPlayers={app.data.players}
            initialPlayers={app.pelusasSession?.players}
            restoredDraft={restoredDraft}
            onBack={
              app.pelusasSession ? app.goPelusasCount : app.exitPelusas
            }
            onOpenPlayerSelection={app.openSelectPlayers}
            onStart={(players) =>
              app.pelusasSession
                ? app.updatePelusasPlayers(players)
                : app.startPelusasSession(players)
            }
            selfPlayer={app.selfPlayer}
          />
        );
      }

      case 'pelusasCount': {
        if (!app.pelusasSession) return null;
        return (
          <PelusasCounterScreen
            session={app.pelusasSession}
            onSaveAndExit={app.savePelusasAndExit}
            onDeleteAndExit={app.deletePelusasAndExit}
            onFinishMatch={app.finishPelusasSession}
            onSetRevolutionMode={app.setPelusasRevolutionMode}
            onSetCardCount={app.setPelusasCardCount}
            onResetCounts={app.resetPelusasCounts}
            onEditMatch={() => app.goPelusasSetup(true)}
          />
        );
      }

      case 'skullKingCount': {
        if (!app.skullKingSession) return null;
        return (
          <SkullKingCounterScreen
            session={app.skullKingSession}
            onSaveAndExit={app.saveSkullKingAndExit}
            onDeleteAndExit={app.deleteSkullKingAndExit}
            onFinishMatch={app.finishSkullKingSession}
            onGoToRound={app.goSkullKingRound}
            onUpdateRoundEntry={app.updateSkullKingRoundEntry}
          />
        );
      }

      case 'piliPiliCount': {
        if (!app.piliPiliSession) return null;
        return (
          <PiliPiliCounterScreen
            session={app.piliPiliSession}
            onSaveAndExit={app.savePiliPiliAndExit}
            onDeleteAndExit={app.deletePiliPiliAndExit}
            onFinishMatch={app.finishPiliPiliSession}
            onGoToRound={app.goPiliPiliRound}
            onAddRound={app.addPiliPiliRound}
            onUpdateRoundEntry={app.updatePiliPiliRoundEntry}
            onUpdateRoundConfig={app.updatePiliPiliRoundConfig}
          />
        );
      }

      case 'flip7Count': {
        if (!app.flip7Session) return null;
        return (
          <Flip7CounterScreen
            session={app.flip7Session}
            onSaveAndExit={app.saveFlip7AndExit}
            onDeleteAndExit={app.deleteFlip7AndExit}
            onFinishMatch={app.finishFlip7Session}
            onGoToRound={app.goFlip7Round}
            onAddRound={app.addFlip7Round}
            onToggleNumber={app.toggleFlip7RoundNumber}
            onToggleModifier={app.toggleFlip7RoundModifier}
            onClearPlayer={app.clearFlip7RoundPlayer}
          />
        );
      }

      case 'aventurerosTrenCount': {
        if (!app.aventurerosTrenSession) return null;
        return (
          <AventurerosTrenCounterScreen
            session={app.aventurerosTrenSession}
            onSaveAndExit={app.saveAventurerosTrenAndExit}
            onDeleteAndExit={app.deleteAventurerosTrenAndExit}
            onFinishMatch={app.finishAventurerosTrenSession}
            onSetPhase={app.setAventurerosTrenPhase}
            onAddRoute={app.addAventurerosTrenRoute}
            onUpdateRoute={app.updateAventurerosTrenRoute}
            onRemoveRoute={app.removeAventurerosTrenRoute}
            onAddDestination={app.addAventurerosTrenDestination}
            onUpdateDestination={app.updateAventurerosTrenDestination}
            onRemoveDestination={app.removeAventurerosTrenDestination}
            onUpdatePlayerScoring={app.updateAventurerosTrenPlayerScoring}
          />
        );
      }

      case 'regicideCount': {
        if (!app.regicideSession) return null;
        return (
          <RegicideCounterScreen
            session={app.regicideSession}
            onSaveAndExit={app.saveRegicideAndExit}
            onDeleteAndExit={app.deleteRegicideAndExit}
            onUpdateSession={app.updateRegicideSession}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {renderScreen()}
      {isHome && (
        <HamburgerMenu
          visible={app.menuOpen}
          onClose={app.closeMenu}
          items={[
            { label: 'Nueva partida', onPress: app.goCreateMatch },
            { label: 'Sesiones de juego', onPress: app.goSessionsList },
            { label: 'Lista de partidas', onPress: app.goMatchesList },
            { label: 'Lista de jugadores', onPress: app.goPlayersList },
            {
              label: 'Plantillas de partida',
              onPress: app.goTemplatesList,
            },
            { label: 'Ajustes', onPress: app.goSettings },
            {
              label: 'Ver tutorial',
              onPress: () => onboarding.startTour('home', { force: true }),
            },
          ]}
        />
      )}
      <WelcomeCarousel />
      <SpotlightTour />
    </View>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
});

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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

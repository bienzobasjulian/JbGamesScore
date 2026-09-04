import { useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ListRow } from '../components/ListRow';
import { MatchListRow } from '../components/MatchListRow';
import { SectionBlock } from '../components/SectionBlock';
import { SectionLabel } from '../components/SectionLabel';
import { SessionListRow } from '../components/SessionListRow';
import { useAutoTour } from '../onboarding';
import { useThemedStyles, type AppTheme } from '../theme';
import { Match, PlaySession, SavedPlayer } from '../types';
import { formatPlayerLastUsed } from '../utils/players';

type Props = {
  inProgressMatches: Match[];
  recentFinishedMatches: Match[];
  recentSessions: PlaySession[];
  allMatches: Match[];
  recentPlayers: SavedPlayer[];
  selfPlayerId?: string | null;
  onMenuPress: () => void;
  onCreateMatch: () => void;
  onCreateSession: () => void;
  onOpenMatch: (matchId: string) => void;
  onOpenSession: (sessionId: string) => void;
  onViewAllSessions: () => void;
  onViewAllMatches: () => void;
  onViewAllPlayers: () => void;
};

export function HomeScreen({
  inProgressMatches,
  recentFinishedMatches,
  recentSessions,
  allMatches,
  recentPlayers,
  selfPlayerId,
  onMenuPress,
  onCreateMatch,
  onCreateSession,
  onOpenMatch,
  onOpenSession,
  onViewAllSessions,
  onViewAllMatches,
  onViewAllPlayers,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const scrollRef = useRef<ScrollView>(null);
  useAutoTour('home');

  const scrollToPlayers = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  const hasAnyMatch =
    inProgressMatches.length > 0 || recentFinishedMatches.length > 0;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Jb Games Score"
        subtitle="Contador de puntos para tus partidas"
        onMenuPress={onMenuPress}
        showLogo
        menuTourAnchorId="home.menu"
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionBlock
          title="Sesiones de juego"
          actionLabel="Nueva sesión"
          actionVariant="sessions"
          onAction={onCreateSession}
          tourAnchorId="home.sessions"
          onTitlePress={onViewAllSessions}
          titleAccessibilityLabel="Ver todas las sesiones"
        >
          {recentSessions.length === 0 ? (
            <Text style={styles.empty}>
              Agrupa partidas de la misma tarde y consulta quién gana más.
            </Text>
          ) : (
            recentSessions.map((session) => (
              <SessionListRow
                key={session.id}
                session={session}
                matches={allMatches}
                onPress={() => onOpenSession(session.id)}
              />
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Partidas"
          actionLabel="Crear partida"
          actionVariant="matches"
          onAction={onCreateMatch}
          style={styles.sectionSpaced}
          tourAnchorId="home.matches"
          onTitlePress={onViewAllMatches}
          titleAccessibilityLabel="Ver todas las partidas"
        >
          {!hasAnyMatch ? (
            <Text style={styles.empty}>No hay partidas guardadas</Text>
          ) : (
            <View style={styles.subsections}>
              <SectionLabel label="En curso" />
              {inProgressMatches.length === 0 ? (
                <Text style={styles.emptySection}>
                  Ninguna partida en curso
                </Text>
              ) : (
                inProgressMatches.map((match) => (
                  <MatchListRow
                    key={match.id}
                    match={match}
                    onPress={() => onOpenMatch(match.id)}
                  />
                ))
              )}

              <SectionLabel label="Recientes" />
              {recentFinishedMatches.length === 0 ? (
                <Text style={styles.emptySection}>
                  Sin partidas finalizadas recientes
                </Text>
              ) : (
                recentFinishedMatches.map((match) => (
                  <MatchListRow
                    key={match.id}
                    match={match}
                    onPress={() => onOpenMatch(match.id)}
                  />
                ))
              )}
            </View>
          )}
        </SectionBlock>

        <SectionBlock
          title="Jugadores recientes"
          actionLabel="Ver todos"
          actionVariant="players"
          onAction={onViewAllPlayers}
          style={styles.sectionSpaced}
          tourAnchorId="home.players"
          tourOnFocus={scrollToPlayers}
        >
          {recentPlayers.length === 0 ? (
            <Text style={styles.empty}>
              Aún no hay jugadores. Créalos al elegir jugadores en una partida
              o desde la lista completa.
            </Text>
          ) : (
            <>
              <Text style={styles.playersHint}>
                Los mismos que verás al pulsar «Elegir jugadores» en una partida.
              </Text>
              {recentPlayers.map((player) => (
                <ListRow
                  key={player.id}
                  title={player.name}
                  subtitle={formatPlayerLastUsed(player.lastUsedAt)}
                  badge={player.id === selfPlayerId ? 'Tú' : undefined}
                  color={player.color}
                  avatar={player.avatar}
                  playerName={player.name}
                />
              ))}
            </>
          )}
        </SectionBlock>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scroll: {
    gap: 16,
    paddingBottom: 24,
  },
  sectionSpaced: {
    marginTop: 4,
  },
  subsections: {
    gap: 4,
  },
  empty: {
    fontSize: 15,
    color: theme.textMuted,
    paddingVertical: 8,
  },
  emptySection: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  playersHint: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 4,
  },
});

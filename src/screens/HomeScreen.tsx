import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { HomeCarouselSection } from '../components/HomeCarouselSection';
import { ListRow } from '../components/ListRow';
import { MatchListRow } from '../components/MatchListRow';
import { SectionBlock } from '../components/SectionBlock';
import { SectionLabel } from '../components/SectionLabel';
import { SessionListRow } from '../components/SessionListRow';
import { TourScrollView, useAutoTour } from '../onboarding';
import { useThemedStyles, type AppTheme } from '../theme';
import { Match, MatchTemplate, PlaySession, PreferredCreateMatchGame, SavedPlayer } from '../types';
import { getVisibleCreateMatchGames } from '../utils/games';
import { formatPlayerLastUsed } from '../utils/players';
import { getTemplateFacts } from '../utils/template';

type Props = {
  inProgressMatches: Match[];
  recentFinishedMatches: Match[];
  recentSessions: PlaySession[];
  allMatches: Match[];
  recentPlayers: SavedPlayer[];
  templates: MatchTemplate[];
  savedPlayers: SavedPlayer[];
  preferredGames: PreferredCreateMatchGame[];
  selfPlayerId?: string | null;
  onMenuPress: () => void;
  onCreateMatch: () => void;
  onOpenGame: (gameType: PreferredCreateMatchGame) => void;
  onViewAllGames: () => void;
  onPlayTemplate: (templateId: string) => void;
  onViewAllTemplates: () => void;
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
  templates,
  savedPlayers,
  preferredGames,
  selfPlayerId,
  onMenuPress,
  onCreateMatch,
  onOpenGame,
  onViewAllGames,
  onPlayTemplate,
  onViewAllTemplates,
  onCreateSession,
  onOpenMatch,
  onOpenSession,
  onViewAllSessions,
  onViewAllMatches,
  onViewAllPlayers,
}: Props) {
  const styles = useThemedStyles(createStyles);
  useAutoTour('home');

  const hasAnyMatch =
    inProgressMatches.length > 0 || recentFinishedMatches.length > 0;
  const recentTemplates = [...templates]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8);
  const visibleGames = getVisibleCreateMatchGames(preferredGames);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Jb Games Score"
        subtitle="Contador de puntos para tus partidas"
        onMenuPress={onMenuPress}
        showLogo
        menuTourAnchorId="home.menu"
      />

      <TourScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {visibleGames.length > 0 ? (
          <HomeCarouselSection title="Juegos" onAction={onViewAllGames}>
            {visibleGames.map((game) => (
              <Pressable
                key={game.id}
                onPress={() =>
                  onOpenGame(game.id as PreferredCreateMatchGame)
                }
                accessibilityRole="button"
                accessibilityLabel={game.name}
                style={({ pressed }) => [
                  styles.gameChip,
                  pressed && styles.chipPressed,
                ]}
              >
                <Text style={styles.gameChipText}>{game.name}</Text>
              </Pressable>
            ))}
          </HomeCarouselSection>
        ) : null}

        <HomeCarouselSection title="Plantillas" onAction={onViewAllTemplates}>
          {recentTemplates.length === 0 ? (
            <Text style={styles.emptyCarousel}>
              Aún no hay plantillas. Créalas desde Ver todo.
            </Text>
          ) : (
            recentTemplates.map((template) => {
              const facts = getTemplateFacts(template, savedPlayers);
              return (
                <Pressable
                  key={template.id}
                  onPress={() => onPlayTemplate(template.id)}
                  accessibilityRole="button"
                  accessibilityLabel={template.name}
                  style={({ pressed }) => [
                    styles.templateCard,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text style={styles.templateTitle} numberOfLines={1}>
                    {template.name}
                  </Text>
                  <View style={styles.templateFacts}>
                    {facts.facts.map((fact) => (
                      <Text
                        key={fact.label}
                        style={[
                          styles.templateFact,
                          fact.tone === 'high' && styles.templateFactHigh,
                          fact.tone === 'low' && styles.templateFactLow,
                        ]}
                      >
                        {fact.label}
                      </Text>
                    ))}
                  </View>
                  {facts.playersLabel ? (
                    <Text style={styles.templateSubtitle} numberOfLines={1}>
                      {facts.playersLabel}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </HomeCarouselSection>

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
      </TourScrollView>
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
  gameChip: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minWidth: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
  },
  templateCard: {
    width: 210,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },
  templateFacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  templateFact: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.accent,
  },
  templateFactHigh: {
    color: theme.success,
  },
  templateFactLow: {
    color: theme.danger,
  },
  templateSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.textMuted,
  },
  chipPressed: {
    opacity: 0.75,
  },
  emptyCarousel: {
    fontSize: 14,
    color: theme.textMuted,
    paddingVertical: 8,
  },
});

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ListRow } from '../components/ListRow';
import { MatchListRow } from '../components/MatchListRow';
import { SectionBlock } from '../components/SectionBlock';
import { SectionLabel } from '../components/SectionLabel';
import { theme } from '../constants';
import { Match, SavedPlayer } from '../types';

type Props = {
  inProgressMatches: Match[];
  recentFinishedMatches: Match[];
  recentPlayers: SavedPlayer[];
  onMenuPress: () => void;
  onCreateMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  onCreatePlayer: () => void;
};

export function HomeScreen({
  inProgressMatches,
  recentFinishedMatches,
  recentPlayers,
  onMenuPress,
  onCreateMatch,
  onOpenMatch,
  onCreatePlayer,
}: Props) {
  const hasAnyMatch =
    inProgressMatches.length > 0 || recentFinishedMatches.length > 0;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Jb Games Score"
        subtitle="Contador de puntos para tus partidas"
        onMenuPress={onMenuPress}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionBlock
          title="Partidas"
          actionLabel="Crear partida"
          actionVariant="matches"
          onAction={onCreateMatch}
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
          actionLabel="Nuevo jugador"
          actionVariant="players"
          onAction={onCreatePlayer}
          style={styles.sectionSpaced}
        >
          {recentPlayers.length === 0 ? (
            <Text style={styles.empty}>
              Aún no hay jugadores. Crea uno para reutilizarlo en tus partidas.
            </Text>
          ) : (
            <>
              <Text style={styles.playersHint}>
                Los últimos con los que has jugado
              </Text>
              {recentPlayers.map((player) => (
                <ListRow
                  key={player.id}
                  title={player.name}
                  color={player.color}
                />
              ))}
            </>
          )}
        </SectionBlock>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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

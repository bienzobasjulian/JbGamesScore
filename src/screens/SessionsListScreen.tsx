import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { SessionListRow } from '../components/SessionListRow';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Match, PlaySession } from '../types';
import { getAllSessionsSorted } from '../utils/session';

type Props = {
  sessions: PlaySession[];
  matches: Match[];
  onBack: () => void;
  onCreateSession: () => void;
  onOpenSession: (sessionId: string) => void;
};

export function SessionsListScreen({
  sessions,
  matches,
  onBack,
  onCreateSession,
  onOpenSession,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const sorted = getAllSessionsSorted(sessions);

  return (
    <View style={styles.container}>
      <AppHeader title="Sesiones de juego" onBack={onBack} />

      <Text style={styles.intro}>
        Agrupa partidas de la misma tarde o reunión. Registra quién gana cada
        juego y consulta quién lleva más victorias.
      </Text>

      <Button
        label="Nueva sesión"
        onPress={onCreateSession}
        style={styles.createBtn}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {sorted.length === 0 ? (
          <Text style={styles.empty}>No hay sesiones guardadas</Text>
        ) : (
          sorted.map((session) => (
            <SessionListRow
              key={session.id}
              session={session}
              matches={matches}
              onPress={() => onOpenSession(session.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  intro: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  createBtn: {
    marginBottom: 16,
  },
  scroll: {
    paddingBottom: 24,
  },
  empty: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
});

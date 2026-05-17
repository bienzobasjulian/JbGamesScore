import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { MatchListRow } from '../components/MatchListRow';
import { theme } from '../constants';
import { Match } from '../types';

type Props = {
  matches: Match[];
  onBack: () => void;
  onCreateMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  onDeleteMatch: (matchId: string) => void;
};

export function MatchesListScreen({
  matches,
  onBack,
  onCreateMatch,
  onOpenMatch,
  onDeleteMatch,
}: Props) {
  return (
    <View style={styles.container}>
      <AppHeader title="Partidas" onBack={onBack} />

      <Button
        label="Nueva partida"
        onPress={onCreateMatch}
        style={styles.createBtn}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {matches.length === 0 ? (
          <Text style={styles.empty}>No hay partidas guardadas</Text>
        ) : (
          matches.map((match) => (
            <MatchListRow
              key={match.id}
              match={match}
              onPress={() => onOpenMatch(match.id)}
              onRemove={() => onDeleteMatch(match.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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

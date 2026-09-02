import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { MatchListRow } from '../components/MatchListRow';
import { SectionLabel } from '../components/SectionLabel';
import { SessionWinRanking } from '../components/SessionWinRanking';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Match, PlaySession } from '../types';
import {
  collectSessionPlayers,
  formatSessionMatchCount,
  getSessionMatches,
  getSessionWinRanking,
} from '../utils/session';

type Props = {
  session: PlaySession;
  matches: Match[];
  onBack: () => void;
  onCreateScoredMatch: () => void;
  onCreateWinnerMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  onCloseSession: () => void;
  onReopenSession: () => void;
  onDeleteSession: () => void;
};

export function SessionDetailScreen({
  session,
  matches,
  onBack,
  onCreateScoredMatch,
  onCreateWinnerMatch,
  onOpenMatch,
  onCloseSession,
  onReopenSession,
  onDeleteSession,
}: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const sessionMatches = getSessionMatches(session.id, matches);
  const winRanking = getSessionWinRanking(sessionMatches);
  const allPlayers = collectSessionPlayers(sessionMatches);
  const isActive = session.status === 'active';

  return (
    <View style={styles.container}>
      <AppHeader
        title={session.name}
        subtitle={formatSessionMatchCount(sessionMatches.length)}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SessionWinRanking ranking={winRanking} />

        {allPlayers.length > 0 ? (
          <View style={styles.playersBlock}>
            <Text style={styles.playersTitle}>Jugadores en la sesión</Text>
            <Text style={styles.playersList}>
              {allPlayers.map((p) => p.name).join(' · ')}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {isActive ? (
            <>
              <Button
                label="Registrar partida con puntuación"
                onPress={onCreateScoredMatch}
              />
              <Button
                label="Registrar partida con ganador"
                onPress={onCreateWinnerMatch}
                variant="secondary"
              />
              <Button
                label="Cerrar sesión"
                onPress={onCloseSession}
                variant="ghost"
              />
            </>
          ) : (
            <Button
              label="Reabrir sesión"
              onPress={onReopenSession}
              variant="secondary"
            />
          )}
        </View>

        <SectionLabel label="Partidas de la sesión" />
        {sessionMatches.length === 0 ? (
          <Text style={styles.empty}>
            Aún no hay partidas. Registra la primera con puntuación o indicando
            quién ganó.
          </Text>
        ) : (
          sessionMatches.map((match) => (
            <MatchListRow
              key={match.id}
              match={match}
              onPress={() => onOpenMatch(match.id)}
            />
          ))
        )}

        <Button
          label="Eliminar sesión"
          onPress={() => setConfirmDelete(true)}
          variant="danger"
          style={styles.deleteBtn}
        />
      </ScrollView>

      <ConfirmModal
        visible={confirmDelete}
        title="¿Eliminar sesión?"
        message={`Se borrará «${session.name}». Las partidas se conservarán, pero ya no estarán agrupadas.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          onDeleteSession();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
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
    paddingBottom: 32,
  },
  playersBlock: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 6,
  },
  playersTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  playersList: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  empty: {
    fontSize: 14,
    color: theme.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  deleteBtn: {
    marginTop: 8,
  },
});

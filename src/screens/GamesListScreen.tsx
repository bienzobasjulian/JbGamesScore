import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import type { PreferredCreateMatchGame } from '../types';
import {
  DEDICATED_CREATE_MATCH_GAMES,
  getGameCatalogMeta,
  type GameCatalogTone,
} from '../utils/games';

type Props = {
  onBack: () => void;
  onOpenGame: (gameType: PreferredCreateMatchGame) => void;
};

export function GamesListScreen({ onBack, onOpenGame }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');

  const games = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DEDICATED_CREATE_MATCH_GAMES.filter((game) => {
      if (!needle) return true;
      const meta = getGameCatalogMeta(game.id);
      return [game.name, game.description, meta.playersLabel, meta.roundsLabel, meta.objectiveLabel]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });
  }, [query]);

  return (
    <View style={styles.container}>
      <AppHeader title="Juegos" onBack={onBack} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar..."
        placeholderTextColor={theme.textMuted}
        style={styles.search}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {games.length === 0 ? (
          <Text style={styles.empty}>Ningún juego coincide con la búsqueda</Text>
        ) : (
          games.map((game) => {
            const meta = getGameCatalogMeta(game.id);
            return (
              <Pressable
                key={game.id}
                onPress={() => onOpenGame(game.id as PreferredCreateMatchGame)}
                accessibilityRole="button"
                accessibilityLabel={game.name}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.copy}>
                  <Text style={styles.name}>{game.name}</Text>
                  <Text style={styles.description}>{game.description}</Text>
                  {meta.playersLabel || meta.roundsLabel || meta.objectiveLabel ? (
                    <View style={styles.metaRow}>
                      {meta.playersLabel ? (
                        <Text style={styles.players}>{meta.playersLabel}</Text>
                      ) : null}
                      {meta.roundsLabel ? (
                        <Text style={styles.players}>{meta.roundsLabel}</Text>
                      ) : null}
                      {meta.objectiveLabel ? (
                        <Text
                          style={[
                            styles.objective,
                            { color: toneColor(theme, meta.objectiveTone) },
                          ]}
                        >
                          {meta.objectiveLabel}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function toneColor(theme: AppTheme, tone: GameCatalogTone): string {
  if (tone === 'high') return theme.success;
  if (tone === 'low') return theme.danger;
  return theme.accent;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    search: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
    },
    scroll: {
      gap: 10,
      paddingBottom: 24,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    pressed: {
      opacity: 0.75,
    },
    copy: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
    },
    description: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.textMuted,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 4,
    },
    players: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    objective: {
      fontSize: 13,
      fontWeight: '700',
    },
    chevron: {
      fontSize: 22,
      color: theme.textMuted,
    },
    empty: {
      fontSize: 15,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 24,
    },
  });

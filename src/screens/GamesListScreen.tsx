import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
                        <View style={styles.metaItem}>
                          <FactIcon name="pawns" color={theme.text} />
                          <Text style={styles.players}>{meta.playersLabel}</Text>
                        </View>
                      ) : null}
                      {meta.roundsLabel ? (
                        <View style={styles.metaItem}>
                          <FactIcon name="time" color={theme.text} />
                          <Text style={styles.players}>{meta.roundsLabel}</Text>
                        </View>
                      ) : null}
                      {meta.objectiveLabel ? (
                        <View style={styles.metaItem}>
                          <FactIcon
                            name={meta.objectiveIcon ?? 'trophy'}
                            color={toneColor(theme, meta.objectiveTone)}
                          />
                          <Text
                            style={[
                              styles.objective,
                              { color: toneColor(theme, meta.objectiveTone) },
                            ]}
                          >
                            {meta.objectiveLabel}
                          </Text>
                        </View>
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

export function FactIcon({
  name,
  color,
}: {
  name: 'pawns' | 'time' | 'trophy' | 'poop' | 'goal';
  color: string;
}) {
  const common = { width: 14, height: 14 };
  if (name === 'time') {
    return (
      <Svg {...common} viewBox="0 0 20 20">
        <Path fill={color} d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-7.59V4h2v5.59l3.95 3.95-1.41 1.41L9 10.41z" />
      </Svg>
    );
  }
  if (name === 'trophy') {
    return (
      <Svg {...common} viewBox="0 0 64 64">
        <Path fill={color} d="M60,4H48c0-2.215-1.789-4-4-4H20c-2.211,0-4,1.785-4,4H4C1.789,4,0,5.785,0,8v8c0,8.836,7.164,16,16,16c0.188,0,0.363-0.051,0.547-0.059C17.984,37.57,22.379,41.973,28,43.43V56h-8c-2.211,0-4,1.785-4,4v4h32v-4c0-2.215-1.789-4-4-4h-8V43.43c5.621-1.457,10.016-5.859,11.453-11.488C47.637,31.949,47.812,32,48,32c8.836,0,16-7.164,16-16V8C64,5.785,62.211,4,60,4z M8,16v-4h8v12C11.582,24,8,20.414,8,16z M56,16c0,4.414-3.582,8-8,8V12h8V16z" />
      </Svg>
    );
  }
  if (name === 'poop') {
    return (
      <Svg {...common} viewBox="0 0 512 512">
        <Path fill={color} d="M451.36 369.14C468.66 355.99 480 335.41 480 312c0-39.77-32.24-72-72-72h-14.07c13.42-11.73 22.07-28.78 22.07-48 0-35.35-28.65-64-64-64h-5.88c3.57-10.05 5.88-20.72 5.88-32 0-53.02-42.98-96-96-96-5.17 0-10.15.74-15.11 1.52C250.31 14.64 256 30.62 256 48c0 44.18-35.82 80-80 80h-16c-35.35 0-64 28.65-64 64 0 19.22 8.65 36.27 22.07 48H104c-39.76 0-72 32.23-72 72 0 23.41 11.34 43.99 28.64 57.14C26.31 374.62 0 404.12 0 440c0 39.76 32.24 72 72 72h368c39.76 0 72-32.24 72-72 0-35.88-26.31-65.38-60.64-70.86z" />
      </Svg>
    );
  }
  if (name === 'goal') {
    return (
      <Svg {...common} viewBox="0 0 330 330">
        <Path fill={color} d="M264.207,129.996l52.504-65.629c3.603-4.503,4.305-10.671,1.807-15.869c-2.498-5.197-7.754-8.502-13.52-8.502l-125,0.004V15c0-3.979-1.58-7.794-4.394-10.607C172.791,1.58,168.975,0,164.997,0l-140,0.005c-8.283,0-14.999,6.716-14.999,15v0.009v149.982v150c0,8.284,6.716,15,15,15s15-6.716,15-15v-135h110v25c0,8.284,6.716,15,15,15h140c5.766,0,11.022-3.305,13.52-8.502c2.498-5.197,1.796-11.366-1.807-15.869L264.207,129.996z M39.998,149.996V30.004l110-0.004v25v94.996H39.998z M179.998,189.996v-25V69.999l93.79-0.002l-40.503,50.628c-4.383,5.479-4.383,13.263,0,18.741l40.504,50.629H179.998z" />
      </Svg>
    );
  }
  return (
    <Svg {...common} viewBox="0 8 100 82">
      <Path fill={color} d="M92,65.2l-8.3-25.7c2.8-2.3,4.6-5.8,4.6-9.7c0-7-5.7-12.7-12.8-12.7c-4.7,0-8.9,2.6-11.1,6.4c-2.4-5.6-8-9.5-14.5-9.5c-6.5,0-12.1,3.9-14.5,9.5c-2.2-3.8-6.3-6.4-11.1-6.4c-7,0-12.8,5.7-12.8,12.7c0,3.9,1.8,7.4,4.6,9.7L8,65.2c0,0.1-0.1,0.3-0.1,0.5c0,4.8,7.1,8.5,16.5,8.5c1.9,0,3.7-0.2,5.5-0.5l-0.5,1.5c0,0.1-0.1,0.3-0.1,0.5C29.3,81.4,38.4,86,50,86c11.6,0,20.7-4.6,20.7-10.4c0-0.2,0-0.3-0.1-0.5l-0.5-1.5c1.8,0.3,3.6,0.5,5.5,0.5c9.4,0,16.5-3.6,16.5-8.5C92.1,65.5,92.1,65.3,92,65.2z M75.6,20.1c5.4,0,9.8,4.3,9.8,9.7c0,3.3-1.7,6.2-4.3,8c-0.4,0.3-0.8,0.5-1.2,0.7c0,0-0.1,0-0.1,0.1c-2.6,1.2-5.8,1.2-8.4,0c-0.1,0-0.1,0-0.2-0.1c-0.4-0.2-0.8-0.4-1.1-0.7c-2.6-1.7-4.3-4.7-4.3-8C65.9,24.4,70.2,20.1,75.6,20.1z M59.9,42.1c2-1.6,3.6-3.7,4.6-6c0.8,1.3,1.7,2.5,2.9,3.5l-4.2,13L59.9,42.1z M50,17c7.1,0,12.9,5.7,12.9,12.8c0,4.4-2.2,8.3-5.6,10.6c-0.1,0-0.1,0.1-0.2,0.1c-0.3,0.2-0.5,0.3-0.8,0.5c-0.1,0-0.2,0.1-0.3,0.1c-0.3,0.1-0.5,0.3-0.8,0.4c-0.1,0-0.2,0.1-0.2,0.1c-0.7,0.3-1.4,0.5-2.2,0.7c-0.1,0-0.2,0-0.3,0.1c-0.3,0.1-0.6,0.1-0.9,0.1c-0.1,0-0.2,0-0.3,0c-0.4,0-0.8,0.1-1.2,0.1c-0.4,0-0.8,0-1.2-0.1c-0.1,0-0.2,0-0.3,0c-0.3,0-0.6-0.1-0.9-0.1c-0.1,0-0.2,0-0.3-0.1c-0.8-0.2-1.5-0.4-2.2-0.7c-0.1,0-0.1-0.1-0.2-0.1c-0.3-0.1-0.6-0.3-0.9-0.4c-0.1,0-0.2-0.1-0.2-0.1c-0.3-0.2-0.6-0.3-0.9-0.5c0,0-0.1,0-0.1-0.1c-3.4-2.3-5.7-6.2-5.7-10.6C37.1,22.7,42.9,17,50,17z M36.7,52.5l-4.2-13c1.2-1,2.2-2.1,2.9-3.5c1,2.4,2.6,4.4,4.6,6L36.7,52.5z M14.6,29.8c0-5.3,4.4-9.7,9.8-9.7s9.8,4.3,9.8,9.7c0,3.3-1.7,6.2-4.3,8c-0.4,0.3-0.8,0.5-1.2,0.7c0,0-0.1,0-0.1,0.1c-2.6,1.2-5.8,1.2-8.4,0c-0.1,0-0.1,0-0.2-0.1c-0.4-0.2-0.8-0.4-1.2-0.7C16.3,36,14.6,33.1,14.6,29.8z M24.4,71.1c-7.5,0-13.2-2.7-13.5-5.3l7.9-24.7c0.1,0,0.2,0.1,0.3,0.1c0.2,0.1,0.5,0.2,0.8,0.3c0.1,0.1,0.3,0.1,0.4,0.2c0.4,0.1,0.8,0.2,1.2,0.3c0,0,0.1,0,0.1,0c0.9,0.2,1.9,0.3,2.8,0.3c1,0,1.9-0.1,2.8-0.3c0,0,0.1,0,0.1,0c0.4-0.1,0.8-0.2,1.2-0.3c0.2,0,0.3-0.1,0.4-0.2c0.3-0.1,0.5-0.2,0.8-0.3c0.1,0,0.2-0.1,0.3-0.1l5.2,16.2l-4.2,13C28.9,70.9,26.7,71.1,24.4,71.1z M50,83c-10.2,0-17.4-3.8-17.6-7.2l1.2-3.7c0,0,0,0,0,0l9.1-28.3c0.1,0.1,0.3,0.1,0.4,0.2c0.4,0.2,0.7,0.3,1.1,0.5c0.2,0.1,0.3,0.1,0.5,0.2c0.5,0.2,1,0.3,1.5,0.4c0,0,0.1,0,0.1,0c1.2,0.3,2.4,0.5,3.7,0.5c1.3,0,2.5-0.2,3.7-0.5c0,0,0.1,0,0.1,0c0.5-0.1,1-0.3,1.5-0.4c0.2-0.1,0.3-0.1,0.5-0.2c0.4-0.2,0.8-0.3,1.1-0.5c0.1-0.1,0.3-0.1,0.4-0.2l9.1,28.3c0,0,0,0,0,0l1.2,3.7C67.4,79.2,60.2,83,50,83z M75.6,71.1c-2.3,0-4.6-0.3-6.6-0.8l-4.2-13l5.2-16.2c0.1,0,0.2,0.1,0.3,0.1c0.2,0.1,0.5,0.2,0.8,0.3c0.1,0.1,0.3,0.1,0.4,0.2c0.4,0.1,0.8,0.2,1.2,0.3c0,0,0,0,0.1,0c0.9,0.2,1.9,0.3,2.8,0.3c1,0,1.9-0.1,2.8-0.3c0,0,0,0,0,0c0.4-0.1,0.8-0.2,1.2-0.3c0.1,0,0.3-0.1,0.4-0.2c0.3-0.1,0.5-0.2,0.8-0.3c0.1,0,0.2-0.1,0.3-0.1l7.9,24.7C88.8,68.4,83.1,71.1,75.6,71.1z" />
    </Svg>
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
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
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

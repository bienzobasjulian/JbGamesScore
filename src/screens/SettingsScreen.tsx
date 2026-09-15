import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import {
  useThemeContext,
  useThemedStyles,
  type AppTheme,
  type ThemePreference,
} from '../theme';
import { PreferredCreateMatchGame } from '../types';
import { DEDICATED_CREATE_MATCH_GAMES } from '../utils/games';

type Props = {
  onBack: () => void;
  preferredCreateMatchGames: PreferredCreateMatchGame[];
  onChangePreferredCreateMatchGames: (
    games: PreferredCreateMatchGame[],
  ) => void;
};

const THEME_OPTIONS: { value: ThemePreference; label: string; hint: string }[] =
  [
    {
      value: 'system',
      label: 'Seguir sistema',
      hint: 'Usa el modo claro u oscuro del dispositivo',
    },
    {
      value: 'light',
      label: 'Claro',
      hint: 'Fondo claro con texto oscuro',
    },
    {
      value: 'dark',
      label: 'Oscuro',
      hint: 'Fondo oscuro con texto claro',
    },
  ];

export function SettingsScreen({
  onBack,
  preferredCreateMatchGames,
  onChangePreferredCreateMatchGames,
}: Props) {
  const { preference, setPreference } = useThemeContext();
  const styles = useThemedStyles(createStyles);

  const toggleGame = (id: PreferredCreateMatchGame) => {
    if (preferredCreateMatchGames.includes(id)) {
      onChangePreferredCreateMatchGames(
        preferredCreateMatchGames.filter((game) => game !== id),
      );
      return;
    }
    onChangePreferredCreateMatchGames([...preferredCreateMatchGames, id]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader title="Ajustes" onBack={onBack} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tema</Text>
        <Text style={styles.cardHint}>
          Elige cómo quieres ver la interfaz de la app.
        </Text>
        {THEME_OPTIONS.map((option, index) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setPreference(option.value)}
              style={({ pressed }) => [
                styles.option,
                index === 0 && styles.optionFirst,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.optionTextWrap}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionHint}>{option.hint}</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Juegos</Text>
        <Text style={styles.cardHint}>
          Tienen la puntuación ya configurada en la app. Marca los que quieres
          ver al crear una partida. Si no marcas ninguno, ese apartado no
          aparecerá.
        </Text>
        {DEDICATED_CREATE_MATCH_GAMES.map((game, index) => {
          const selected = preferredCreateMatchGames.includes(
            game.id as PreferredCreateMatchGame,
          );
          return (
            <Pressable
              key={game.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={game.name}
              onPress={() => toggleGame(game.id as PreferredCreateMatchGame)}
              style={({ pressed }) => [
                styles.option,
                index === 0 && styles.optionFirst,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.optionTextWrap}>
                <Text
                  style={[
                    styles.optionLabel,
                    selected && styles.optionLabelSelected,
                  ]}
                >
                  {game.name}
                </Text>
                <Text style={styles.optionHint}>{game.description}</Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  selected && styles.checkboxSelected,
                ]}
              >
                <Text style={styles.checkboxMark}>{selected ? '✓' : ''}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      paddingBottom: 4,
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 4,
    },
    cardHint: {
      fontSize: 14,
      color: theme.textMuted,
      lineHeight: 20,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    optionFirst: {
      borderTopWidth: 0,
    },
    optionSelected: {
      backgroundColor: theme.accent + '14',
    },
    optionPressed: {
      backgroundColor: theme.surfaceLight,
    },
    optionTextWrap: {
      flex: 1,
      gap: 2,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    optionLabelSelected: {
      color: theme.accent,
    },
    optionHint: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 18,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: theme.accent,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.accent,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
    },
    checkboxSelected: {
      borderColor: theme.accent,
      backgroundColor: theme.accent,
    },
    checkboxMark: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.onAccent,
    },
  });

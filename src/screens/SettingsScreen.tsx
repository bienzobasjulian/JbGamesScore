import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useOnboarding } from '../onboarding';
import {
  useThemeContext,
  useThemedStyles,
  type AppTheme,
  type ThemePreference,
} from '../theme';

type Props = {
  onBack: () => void;
  onReplayHomeTour: () => void;
  onReplayCreateMatchTour: () => void;
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
  onReplayHomeTour,
  onReplayCreateMatchTour,
}: Props) {
  const { preference, setPreference } = useThemeContext();
  const styles = useThemedStyles(createStyles);
  const { openWelcome, resetTour, resetAll } = useOnboarding();
  const [helpNotice, setHelpNotice] = useState<string | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader title="Ajustes" onBack={onBack} />

      <Text style={styles.sectionLabel}>Apariencia</Text>
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

      <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
        Ayuda y tutoriales
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Guías de la app</Text>
        <Text style={styles.cardHint}>
          Vuelve a ver la bienvenida o los tutoriales que resaltan cada apartado.
        </Text>
        <HelpRow
          label="Ver bienvenida"
          hint="Carrusel con las funcionalidades principales"
          onPress={openWelcome}
          styles={styles}
        />
        <HelpRow
          label="Tutorial de inicio"
          hint="Los botones de la pantalla principal y el menú"
          onPress={onReplayHomeTour}
          styles={styles}
        />
        <HelpRow
          label="Tutorial al crear partida"
          hint="Juego, plantillas, configuración y jugadores"
          onPress={onReplayCreateMatchTour}
          styles={styles}
        />
        <HelpRow
          label="Repetir tutoriales de partida"
          hint="Rondas y menú ⋮ la próxima vez que abras una"
          onPress={() => {
            resetTour('match');
            resetTour('rounds');
            setHelpNotice(
              'Se mostrarán al abrir la próxima partida en curso.',
            );
          }}
          styles={styles}
        />
        <HelpRow
          label="Restablecer todos"
          hint="Los tutoriales contextuales volverán a salir al entrar en cada pantalla"
          onPress={() => {
            resetAll();
            setHelpNotice(
              'Listo. Al entrar en inicio, crear partida, una sesión o una partida, verás las guías otra vez.',
            );
          }}
          styles={styles}
          last
        />
        {helpNotice ? <Text style={styles.helpNotice}>{helpNotice}</Text> : null}
      </View>
    </ScrollView>
  );
}

function HelpRow({
  label,
  hint,
  onPress,
  styles,
  last,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        last && styles.helpLast,
        pressed && styles.optionPressed,
      ]}
    >
      <View style={styles.optionTextWrap}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionHint}>{hint}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
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
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      paddingBottom: 4,
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
    sectionSpaced: {
      marginTop: 28,
    },
    helpLast: {
      marginBottom: 8,
    },
    chevron: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.textMuted,
      lineHeight: 24,
    },
    helpNotice: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.success,
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
  });

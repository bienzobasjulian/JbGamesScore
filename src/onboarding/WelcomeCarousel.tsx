import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { useOnboarding } from './useOnboarding';

type Slide = {
  title: string;
  body: string;
  showLogo?: boolean;
};

const SLIDES: Slide[] = [
  {
    title: '¡Bienvenido!',
    body: 'JbGamesScore te ayuda a anotar puntos y ver quién gana, en una partida suelta o en toda una sesión de juegos.',
    showLogo: true,
  },
  {
    title: 'Sesiones de juego',
    body: 'Agrupa las partidas de la misma quedada y consulta quién ha ganado más.',
  },
  {
    title: 'Partidas',
    body: 'Cualquier juego: configuras rondas o puntos, y puedes guardar plantillas para repetirlas. Algunos vienen integrados, con su propio contador.',
  },
  {
    title: 'Jugadores y grupos',
    body: 'Crea y edita jugadores y organízalos en grupos para tus partidas.',
  },
];

export function WelcomeCarousel() {
  const { showWelcome, welcomeSeen, dismissWelcome } = useOnboarding();
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  if (!showWelcome) return null;

  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    setIndex(0);
    dismissWelcome({ startHomeTour: !welcomeSeen });
  };

  return (
    <Modal
      visible
      animationType="fade"
      onRequestClose={finish}
      statusBarTranslucent
    >
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 20,
            paddingLeft: 24 + insets.left,
            paddingRight: 24 + insets.right,
          },
        ]}
      >
        <View style={styles.topRow}>
          {!isLast ? (
            <Pressable
              onPress={finish}
              hitSlop={10}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.skip}>Saltar</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Text style={styles.counter}>
            {index + 1} / {SLIDES.length}
          </Text>
        </View>

        <View style={styles.slide}>
          {slide.showLogo ? (
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              accessibilityLabel="Jb Games Score"
            />
          ) : (
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>{index}</Text>
            </View>
          )}
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && styles.dotActive,
                i === index && { backgroundColor: theme.accent },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {!isFirst ? (
            <Pressable
              onPress={() => setIndex((i) => i - 1)}
              style={({ pressed }) => [
                styles.secondary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryLabel}>Atrás</Text>
            </Pressable>
          ) : (
            <View style={styles.secondarySpacer} />
          )}
          <Pressable
            onPress={() => {
              if (isLast) {
                finish();
                return;
              }
              setIndex((i) => i + 1);
            }}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryLabel}>
              {isLast ? 'Empezar' : 'Siguiente'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    skip: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textMuted,
    },
    counter: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textMuted,
    },
    slide: {
      flex: 1,
      justifyContent: 'center',
      gap: 16,
    },
    logo: {
      width: 88,
      height: 88,
      borderRadius: 20,
      marginBottom: 8,
    },
    iconBadge: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    iconText: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.accent,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.text,
    },
    body: {
      fontSize: 17,
      lineHeight: 26,
      color: theme.textMuted,
    },
    dots: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      marginBottom: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.border,
    },
    dotActive: {
      width: 22,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    secondary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondarySpacer: {
      flex: 1,
    },
    secondaryLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    primary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.accent,
    },
    primaryLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.onAccent,
    },
    pressed: {
      opacity: 0.85,
    },
  });

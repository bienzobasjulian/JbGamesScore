import { useRef, useState } from 'react';
import {
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
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
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  if (!showWelcome) return null;

  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    setIndex(0);
    dismissWelcome({ startHomeTour: !welcomeSeen });
  };

  const goTo = (next: number) => {
    const clamped = Math.min(SLIDES.length - 1, Math.max(0, next));
    setIndex(clamped);
    if (pageWidth > 0) {
      scrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true });
    }
  };

  const syncIndexFromScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (pageWidth <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setIndex(Math.min(SLIDES.length - 1, Math.max(0, next)));
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

        <View
          style={styles.pager}
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width;
            if (width > 0 && width !== pageWidth) {
              setPageWidth(width);
              if (index > 0) {
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollTo({
                    x: index * width,
                    animated: false,
                  });
                });
              }
            }
          }}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            decelerationRate="fast"
            snapToInterval={pageWidth || undefined}
            snapToAlignment="start"
            disableIntervalMomentum
            onMomentumScrollEnd={syncIndexFromScroll}
            onScrollEndDrag={syncIndexFromScroll}
          >
            {SLIDES.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.slide,
                  pageWidth > 0 && { width: pageWidth },
                  item.showLogo && styles.slideCentered,
                ]}
              >
                {item.showLogo ? (
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    accessibilityLabel="Jb Games Score"
                  />
                ) : null}
                <Text
                  style={[
                    styles.title,
                    item.showLogo && styles.titleCentered,
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.body, item.showLogo && styles.bodyCentered]}
                >
                  {item.body}
                </Text>
              </View>
            ))}
          </ScrollView>
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
              onPress={() => goTo(index - 1)}
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
              goTo(index + 1);
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
    pager: {
      flex: 1,
    },
    slide: {
      flex: 1,
      justifyContent: 'center',
      gap: 16,
      paddingRight: 8,
    },
    slideCentered: {
      alignItems: 'center',
      paddingRight: 0,
    },
    logo: {
      width: 156,
      height: 156,
      borderRadius: 36,
      marginBottom: 12,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.text,
    },
    titleCentered: {
      textAlign: 'center',
    },
    body: {
      fontSize: 17,
      lineHeight: 26,
      color: theme.textMuted,
    },
    bodyCentered: {
      textAlign: 'center',
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

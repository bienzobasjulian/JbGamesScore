import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FLIP7_CARD_SHARED,
  FLIP7_MODIFIER_CARD_HEIGHT,
  FLIP7_MODIFIER_CARD_WIDTH,
  FLIP7_NUMBER_COLORS,
  FLIP7_VENGEANCE_MODIFIER_CARD_STYLE,
  FLIP7_VENGEANCE_SPECIAL_CARD_HEIGHT,
  FLIP7_VENGEANCE_SPECIAL_CARD_WIDTH,
} from '../constants/flip7Cards';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { Flip7VengeanceModifier, Flip7VengeanceSpecial } from '../types';

type ModifierProps = {
  modifier: Flip7VengeanceModifier;
  selected: boolean;
  onPress: () => void;
};

export function Flip7VengeanceModifierCard({
  modifier,
  selected,
  onPress,
}: ModifierProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createModifierStyles);
  const palette = FLIP7_VENGEANCE_MODIFIER_CARD_STYLE;
  const valueSize = modifier === '÷2' || modifier === '-10' ? 18 : 20;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        pressed && styles.pressed,
        selected && styles.wrapSelected,
      ]}
    >
      <View
        style={[
          styles.outer,
          { backgroundColor: selected ? palette.outerSelected : palette.outer },
        ]}
      >
        <View
          style={[
            styles.inner,
            { backgroundColor: selected ? palette.bgSelected : palette.bg },
          ]}
        >
          <View style={styles.frame}>
            <Text style={[styles.value, { fontSize: valueSize }]}>{modifier}</Text>
          </View>
        </View>
        {selected ? (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const SPECIAL_FACE: Record<
  Flip7VengeanceSpecial,
  { value: string; caption: string; fill: string; fillSelected: string; ink: string }
> = {
  zero: {
    value: '0',
    caption: 'ZERO',
    fill: FLIP7_CARD_SHARED.cream,
    fillSelected: FLIP7_CARD_SHARED.creamSelected,
    ink: FLIP7_NUMBER_COLORS[0],
  },
  unlucky7: {
    value: '7',
    caption: 'UNLUCKY',
    fill: '#E6E6E6',
    fillSelected: '#D4D4D4',
    ink: '#4A4A4A',
  },
  lucky13: {
    value: '13',
    caption: 'LUCKY',
    fill: FLIP7_CARD_SHARED.cream,
    fillSelected: FLIP7_CARD_SHARED.creamSelected,
    ink: FLIP7_NUMBER_COLORS[13],
  },
};

type SpecialProps = {
  special: Flip7VengeanceSpecial;
  selected: boolean;
  onPress: () => void;
};

export function Flip7VengeanceSpecialCard({
  special,
  selected,
  onPress,
}: SpecialProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createSpecialStyles);
  const face = SPECIAL_FACE[special];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        pressed && styles.pressed,
        selected && styles.wrapSelected,
      ]}
    >
      <View
        style={[
          styles.goldBorder,
          {
            backgroundColor: selected
              ? FLIP7_CARD_SHARED.goldDark
              : FLIP7_CARD_SHARED.gold,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            { backgroundColor: selected ? face.fillSelected : face.fill },
          ]}
        >
          <View style={styles.frame}>
            <Text style={[styles.value, { color: face.ink }]}>{face.value}</Text>
            <Text style={[styles.caption, { color: face.ink }]}>{face.caption}</Text>
          </View>
        </View>
        {selected ? (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const createModifierStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrap: {
      width: FLIP7_MODIFIER_CARD_WIDTH,
      height: FLIP7_MODIFIER_CARD_HEIGHT,
    },
    wrapSelected: { transform: [{ scale: 1.04 }] },
    pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
    outer: {
      flex: 1,
      borderRadius: 9,
      padding: 2.5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    inner: { flex: 1, borderRadius: 7, padding: 2 },
    frame: {
      flex: 1,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: FLIP7_VENGEANCE_MODIFIER_CARD_STYLE.frame,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontWeight: '900',
      color: FLIP7_VENGEANCE_MODIFIER_CARD_STYLE.text,
      textAlign: 'center',
    },
    checkBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: '900',
      marginTop: -1,
    },
  });

const createSpecialStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrap: {
      width: FLIP7_VENGEANCE_SPECIAL_CARD_WIDTH,
      height: FLIP7_VENGEANCE_SPECIAL_CARD_HEIGHT,
    },
    wrapSelected: { transform: [{ scale: 1.04 }] },
    pressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
    goldBorder: {
      flex: 1,
      borderRadius: 9,
      padding: 2.5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 3,
      elevation: 3,
    },
    fill: { flex: 1, borderRadius: 7, padding: 2 },
    frame: {
      flex: 1,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: FLIP7_CARD_SHARED.frame,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    },
    value: { fontSize: 22, fontWeight: '900', lineHeight: 24 },
    caption: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
    checkBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: '900',
      marginTop: -1,
    },
  });

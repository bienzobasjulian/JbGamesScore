import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PLAYER_COLORS, theme } from '../constants';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

function isLightColor(hex: string): boolean {
  return getPlayerAvatarTextColor(hex) === '#000000';
}

export function PlayerColorPicker({ value, onChange }: Props) {
  const normalizedValue = value.trim().toUpperCase();

  const colors = useMemo(() => {
    if (PLAYER_COLORS.includes(normalizedValue)) return PLAYER_COLORS;
    return [normalizedValue, ...PLAYER_COLORS];
  }, [normalizedValue]);

  return (
    <View style={styles.grid}>
      {colors.map((color) => {
        const selected = normalizedValue === color.trim().toUpperCase();
        const light = isLightColor(color);
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: color },
              light && styles.swatchLight,
              selected &&
                (light ? styles.swatchSelectedLight : styles.swatchSelected),
              pressed && styles.swatchPressed,
            ]}
          >
            {selected ? (
              <Text
                style={[styles.check, light && styles.checkDark]}
              >
                ✓
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchLight: {
    borderColor: theme.border,
  },
  swatchSelected: {
    borderColor: theme.text,
  },
  swatchSelectedLight: {
    borderColor: '#0F1419',
  },
  swatchPressed: {
    opacity: 0.85,
  },
  check: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  checkDark: {
    color: '#0F1419',
  },
});

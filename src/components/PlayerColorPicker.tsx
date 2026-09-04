import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PLAYER_COLOR_OPTIONS, PLAYER_COLORS } from '../constants';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';
import { getPlayerAvatarTextColor } from '../utils/players';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

function isLightColor(hex: string): boolean {
  return getPlayerAvatarTextColor(hex) === '#000000';
}

export function PlayerColorPicker({ value, onChange }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const normalizedValue = value.trim().toUpperCase();

  const options = useMemo(() => {
    const known = PLAYER_COLOR_OPTIONS.map((option) => ({
      name: option.name,
      value: option.value,
    }));
    if (PLAYER_COLORS.includes(normalizedValue)) return known;
    return [{ name: 'Actual', value: normalizedValue }, ...known];
  }, [normalizedValue]);

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = normalizedValue === option.value.trim().toUpperCase();
        const light = isLightColor(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.name}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: option.value },
              light && styles.swatchLight,
              selected &&
                (light ? styles.swatchSelectedLight : styles.swatchSelected),
              pressed && styles.swatchPressed,
            ]}
          >
            {selected ? (
              <Text style={[styles.check, light && styles.checkDark]}>✓</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
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
    borderColor: theme.text,
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
    color: theme.text,
  },
});

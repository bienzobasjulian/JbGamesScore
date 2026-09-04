import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PLAYER_COLOR_OPTIONS, PLAYER_COLORS } from '../constants';
import { useThemedStyles, type AppTheme } from '../theme';
import { getPlayerAvatarTextColor } from '../utils/players';

export type PlayerColorOption = {
  name: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (color: string) => void;
  options?: readonly PlayerColorOption[];
  takenValues?: string[];
  compact?: boolean;
};

function isLightColor(hex: string): boolean {
  return getPlayerAvatarTextColor(hex) === '#000000';
}

function normalizeHex(hex: string): string {
  return hex.trim().toUpperCase();
}

export function PlayerColorPicker({
  value,
  onChange,
  options,
  takenValues = [],
  compact = false,
}: Props) {
  const styles = useThemedStyles(createStyles);

  const normalizedValue = normalizeHex(value);
  const taken = useMemo(
    () => new Set(takenValues.map(normalizeHex)),
    [takenValues],
  );

  const colorOptions = useMemo(() => {
    const known = (options ?? PLAYER_COLOR_OPTIONS).map((option) => ({
      name: option.name,
      value: option.value,
    }));
    const knownValues = known.map((option) => normalizeHex(option.value));
    if (knownValues.includes(normalizedValue)) return known;
    if (PLAYER_COLORS.includes(normalizedValue)) {
      const extra = PLAYER_COLOR_OPTIONS.find(
        (option) => normalizeHex(option.value) === normalizedValue,
      );
      return extra ? [extra, ...known] : known;
    }
    return [{ name: 'Actual', value: normalizedValue }, ...known];
  }, [normalizedValue, options]);

  return (
    <View style={[styles.grid, compact && styles.gridCompact]}>
      {colorOptions.map((option) => {
        const selected = normalizedValue === normalizeHex(option.value);
        const unavailable = taken.has(normalizeHex(option.value)) && !selected;
        const light = isLightColor(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.name}
            accessibilityState={{ selected, disabled: unavailable }}
            disabled={unavailable}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.swatch,
              compact && styles.swatchCompact,
              { backgroundColor: option.value },
              light && styles.swatchLight,
              selected &&
                (light ? styles.swatchSelectedLight : styles.swatchSelected),
              unavailable && styles.swatchTaken,
              pressed && !unavailable && styles.swatchPressed,
            ]}
          >
            {selected ? (
              <Text
                style={[
                  styles.check,
                  compact && styles.checkCompact,
                  light && styles.checkDark,
                ]}
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  gridCompact: {
    gap: 8,
    justifyContent: 'flex-start',
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
  swatchCompact: {
    width: 28,
    height: 28,
    borderRadius: 8,
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
  swatchTaken: {
    opacity: 0.28,
  },
  swatchPressed: {
    opacity: 0.85,
  },
  check: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  checkCompact: {
    fontSize: 12,
  },
  checkDark: {
    color: theme.text,
  },
});

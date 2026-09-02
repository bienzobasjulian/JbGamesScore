import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FLIP7_CARD_SHARED,
  FLIP7_NUMBER_CARD_HEIGHT,
  FLIP7_NUMBER_CARD_WIDTH,
  FLIP7_NUMBER_COLORS,
} from '../constants/flip7Cards';
import { useTheme, useThemedStyles, type AppTheme } from '../theme';

type Props = {
  number: number;
  selected: boolean;
  onPress: () => void;
};

export function Flip7NumberCard({ number, selected, onPress }: Props) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  const shared = FLIP7_CARD_SHARED;
  const numberColor = FLIP7_NUMBER_COLORS[number];

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
            backgroundColor: selected ? shared.goldDark : shared.gold,
          },
        ]}
      >
        <View
          style={[
            styles.creamFill,
            {
              backgroundColor: selected ? shared.creamSelected : shared.cream,
            },
          ]}
        >
          <View style={styles.frame}>
            <Text
              style={[
                styles.number,
                number >= 10 && styles.numberWide,
                { color: numberColor },
              ]}
            >
              {number}
            </Text>
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
  wrap: {
    width: FLIP7_NUMBER_CARD_WIDTH,
    height: FLIP7_NUMBER_CARD_HEIGHT,
  },
  wrapSelected: {
    transform: [{ scale: 1.04 }],
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
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
  creamFill: {
    flex: 1,
    borderRadius: 7,
    padding: 2,
  },
  frame: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: FLIP7_CARD_SHARED.frame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  numberWide: {
    fontSize: 20,
    lineHeight: 22,
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

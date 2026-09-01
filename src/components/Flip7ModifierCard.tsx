import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FLIP7_MODIFIER_CARD_HEIGHT,
  FLIP7_MODIFIER_CARD_STYLE,
  FLIP7_MODIFIER_CARD_WIDTH,
} from '../constants/flip7Cards';
import { Flip7Modifier } from '../types';
import { theme } from '../constants';

type Props = {
  modifier: Flip7Modifier;
  selected: boolean;
  onPress: () => void;
};

export function Flip7ModifierCard({ modifier, selected, onPress }: Props) {
  const palette = FLIP7_MODIFIER_CARD_STYLE;
  const valueSize = modifier === 'x2' ? 22 : modifier === '+10' ? 18 : 20;

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
          {
            backgroundColor: selected ? palette.outerSelected : palette.outer,
          },
          selected && styles.outerSelectedShadow,
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              backgroundColor: selected ? palette.bgSelected : palette.bg,
            },
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

const styles = StyleSheet.create({
  wrap: {
    width: FLIP7_MODIFIER_CARD_WIDTH,
    height: FLIP7_MODIFIER_CARD_HEIGHT,
  },
  wrapSelected: {
    transform: [{ scale: 1.04 }],
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
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
  outerSelectedShadow: {
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  inner: {
    flex: 1,
    borderRadius: 7,
    padding: 2,
  },
  frame: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: FLIP7_MODIFIER_CARD_STYLE.frame,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  value: {
    fontWeight: '900',
    color: FLIP7_MODIFIER_CARD_STYLE.text,
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

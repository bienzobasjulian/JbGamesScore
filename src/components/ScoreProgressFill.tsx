import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

type Props = {
  progress: number;
  color: string;
};

export function ScoreProgressFill({ progress, color }: Props) {
  const width = useRef(new Animated.Value(0)).current;
  const target = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    Animated.timing(width, {
      toValue: target,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [target, width]);

  return (
    <Animated.View
      style={[
        styles.fill,
        {
          backgroundColor: color,
          width: width.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
});

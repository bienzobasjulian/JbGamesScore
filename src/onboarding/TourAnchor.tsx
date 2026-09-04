import { useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useOnboarding } from './useOnboarding';

type Props = {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onFocus?: () => void;
};

export function TourAnchor({ id, children, style, onFocus }: Props) {
  const ref = useRef<View>(null);
  const { registerAnchor, unregisterAnchor, activeStep } = useOnboarding();

  useEffect(() => {
    registerAnchor(id, {
      measure: () =>
        new Promise((resolve) => {
          const node = ref.current;
          if (!node) {
            resolve(null);
            return;
          }
          node.measureInWindow((x, y, width, height) => {
            if (width <= 0 || height <= 0) {
              resolve(null);
              return;
            }
            resolve({ x, y, width, height });
          });
        }),
      onFocus,
    });
    return () => unregisterAnchor(id);
  }, [id, onFocus, registerAnchor, unregisterAnchor]);

  useEffect(() => {
    if (activeStep?.anchorId === id) {
      onFocus?.();
    }
  }, [activeStep?.anchorId, id, onFocus]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

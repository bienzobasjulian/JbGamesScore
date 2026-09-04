import { useEffect, useRef, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { measureInWindow } from './tourLayout';
import { useTourScroll } from './TourScroll';
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
  const scroll = useTourScroll();

  useEffect(() => {
    const measure = () => measureInWindow(ref.current);
    registerAnchor(id, {
      measure,
      onFocus,
    });
    return () => unregisterAnchor(id);
  }, [id, onFocus, registerAnchor, unregisterAnchor]);

  useEffect(() => {
    if (activeStep?.anchorId !== id) return;
    onFocus?.();
    const timer = setTimeout(() => {
      void scroll?.ensureVisible(() => measureInWindow(ref.current));
    }, 40);
    return () => clearTimeout(timer);
  }, [activeStep?.anchorId, id, onFocus, scroll]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

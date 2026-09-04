import { Dimensions } from 'react-native';
import type { LayoutRect } from './types';

/** Espacio reservado para la tarjeta del tour (botones siempre visibles). */
export const TOUR_TOOLTIP_RESERVE = 280;
export const TOUR_HIGHLIGHT_PAD = 6;
export const TOUR_SCROLL_PADDING = 16;

type Measurable = {
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

export function measureInWindow(
  node: unknown,
): Promise<LayoutRect | null> {
  return new Promise((resolve) => {
    const measurable = node as Measurable | null | undefined;
    if (!measurable?.measureInWindow) {
      resolve(null);
      return;
    }
    measurable.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) {
        resolve(null);
        return;
      }
      resolve({ x, y, width, height });
    });
  });
}

export function toLocalRect(
  rect: LayoutRect,
  origin: LayoutRect,
): LayoutRect {
  return {
    x: rect.x - origin.x,
    y: rect.y - origin.y,
    width: rect.width,
    height: rect.height,
  };
}

export function computeTourScrollDelta(
  anchor: LayoutRect,
  viewport: LayoutRect,
): number {
  const visibleBottom = Math.min(
    viewport.y + viewport.height,
    Dimensions.get('window').height - 24,
  );
  const minY = viewport.y + TOUR_SCROLL_PADDING;
  const maxY = visibleBottom - TOUR_TOOLTIP_RESERVE;
  if (maxY - minY < 48) {
    return 0;
  }
  if (anchor.height > maxY - minY) {
    return anchor.y - minY;
  }
  if (anchor.y < minY) {
    return anchor.y - minY;
  }
  if (anchor.y + anchor.height > maxY) {
    return anchor.y + anchor.height - maxY;
  }
  return 0;
}

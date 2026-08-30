import { ImageSourcePropType } from 'react-native';

const PELUSA_IMAGES: Record<number, ImageSourcePropType> = {
  1: require('../../assets/pelusas/pelusa_1.png'),
  2: require('../../assets/pelusas/pelusa_2.png'),
  3: require('../../assets/pelusas/pelusa_3.png'),
  4: require('../../assets/pelusas/pelusa_4.png'),
  5: require('../../assets/pelusas/pelusa_5.png'),
  6: require('../../assets/pelusas/pelusa_6.png'),
  7: require('../../assets/pelusas/pelusa_7.png'),
  8: require('../../assets/pelusas/pelusa_8.png'),
  9: require('../../assets/pelusas/pelusa_9.png'),
  10: require('../../assets/pelusas/pelusa_10.png'),
};

export function getPelusaImageSource(cardValue: number): ImageSourcePropType | null {
  return PELUSA_IMAGES[cardValue] ?? null;
}

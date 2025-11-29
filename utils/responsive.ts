// utils/responsive.ts

import { Dimensions, PixelRatio } from 'react-native';
import type { Percentage, ScaledSize, ImageSize } from '../types/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseline designs are often made for iPhone 11 / XR width (414) or iPhone 6/7/8 width (375).
// You can change this to match your design reference.
const BASE_WIDTH = 375;

// Scale based on width
export const wp = (percentage: Percentage): ScaledSize => {
  return (SCREEN_WIDTH * percentage) / 100;
};

// Scale based on height
export const hp = (percentage: Percentage): ScaledSize => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Scale font relative to screen width
export const RF = (size: number): ScaledSize => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Scale spacing (padding, margin, radius, etc.)
export const RS = (size: number): ScaledSize => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(newSize);
};

// Helpful: responsive image sizing
export const imgSize = (widthPx: number, heightPx: number): ImageSize => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return {
    width: widthPx * scale,
    height: heightPx * scale,
  };
};

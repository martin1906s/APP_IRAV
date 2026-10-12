import { Easing } from 'react-native-reanimated';

export const springConfig = {
  default: { damping: 20, stiffness: 300 },
  gentle:  { damping: 25, stiffness: 200 },
  bouncy:  { damping: 12, stiffness: 350 },
};

export const timingConfig = {
  fast:    { duration: 200, easing: Easing.out(Easing.cubic) },
  medium:  { duration: 350, easing: Easing.inOut(Easing.cubic) },
  slow:    { duration: 500, easing: Easing.inOut(Easing.quad) },
};

import { Dimensions } from 'react-native';
import { spacing } from '../../theme';

export const CHART_WIDTH = Dimensions.get('window').width - spacing.md * 4;
export const CHART_HEIGHT = 160;
export const CHART_PAD = { top: 12, right: 8, bottom: 28, left: 28 };

export function chartInnerSize() {
  return {
    width: CHART_WIDTH - CHART_PAD.left - CHART_PAD.right,
    height: CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom,
  };
}

export function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function yTicks(max: number, sections = 4) {
  const step = max / sections;
  const raw = Array.from({ length: sections + 1 }, (_, i) => {
    const value = max - step * i;
    return max <= 1 ? Math.round(value * 10) / 10 : Math.round(value);
  });
  return raw.filter((tick, index) => raw.indexOf(tick) === index);
}

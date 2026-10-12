import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme';

type Props = {
  progress: number; // 0 a 1
  label?: string;
  height?: number;
};

export function ProgressBar({ progress, label, height = 8 }: Props) {
  const animatedWidth = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(Math.max(progress * 100, 0), 100)}%`, { duration: 500 }),
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, animatedWidth]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  track: {
    width: '100%',
    backgroundColor: colors.vellumDark,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: radius.pill,
  },
});

import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography, springConfig } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GoldButton({ title, onPress, variant = 'primary', disabled, style, textStyle }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96, springConfig.default); };
  const handlePressOut = () => { scale.value = withSpring(1, springConfig.default); };

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.button, animatedStyle, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[colors.gold, colors.goldWarm]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
          borderRadius={radius.pill}
        />
        <Text style={[styles.text, styles.textPrimary, textStyle]}>{title}</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.button, styles.secondary, animatedStyle, disabled && styles.disabled, style]}
    >
      <Text style={[styles.text, styles.textSecondary, textStyle]}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.purple,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    letterSpacing: typography.button.letterSpacing,
  },
  textPrimary: {
    color: colors.textOnGold,
    fontWeight: 'bold',
  },
  textSecondary: {
    color: colors.purple,
    fontWeight: 'bold',
  },
});

import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'accent';
  style?: ViewStyle;
  disabled?: boolean;
};

/** Botón estándar */
export function AppButton({ label, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'accent' && styles.accent,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <AppText
        variant="subtitle"
        invert={variant === 'primary' || variant === 'accent'}
        style={[
          styles.label,
          variant === 'ghost' && styles.ghostLabel,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  accent: {
    backgroundColor: colors.accentWarm,
  },
  label: {
    textAlign: 'center',
    letterSpacing: 0,
    fontSize: 15,
  },
  ghostLabel: { color: colors.text },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.4 },
});

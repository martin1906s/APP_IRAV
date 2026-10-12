import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'accent' | 'glass';
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
        variant === 'glass' && styles.glass,
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
          variant === 'glass' && styles.glassLabel,
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
  glass: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)', // Dorado sutil
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  label: {
    textAlign: 'center',
    letterSpacing: 0,
    fontSize: 15,
  },
  ghostLabel: { color: colors.text },
  glassLabel: { color: colors.gold, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
